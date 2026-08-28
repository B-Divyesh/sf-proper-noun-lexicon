use clap::{Parser, Subcommand};
use proper_noun_lexicon::{Audit, ExportFormat, Lexicon, export, import_csv};
use serde_json::json;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Parser)]
#[command(
    name = "pnl",
    version,
    about = "Private proper-noun corrections and speech-model phrase exports",
    long_about = "Import an approved terminology CSV, export model-specific phrase hints, or correct a transcript with a reversible local audit. No network access and no interactive prompts."
)]
struct Cli {
    #[arg(long, global = true, help = "Print a machine-readable JSON result")]
    json: bool,
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Import a term,aliases CSV into a portable lexicon
    Import {
        input: PathBuf,
        #[arg(short, long)]
        output: PathBuf,
        #[arg(long, help = "Human-readable lexicon name (defaults to CSV file stem)")]
        name: Option<String>,
    },
    /// List canonical terms and their approved aliases
    List {
        #[arg(short, long)]
        lexicon: PathBuf,
    },
    /// Export a documented speech-engine phrase or prompt payload
    Export {
        #[arg(short, long)]
        lexicon: PathBuf,
        #[arg(short, long, value_enum)]
        format: ExportFormat,
        #[arg(short, long)]
        output: PathBuf,
    },
    /// Replace only approved aliases and write a reversible audit
    Correct {
        #[arg(short, long)]
        lexicon: PathBuf,
        #[arg(short, long)]
        input: PathBuf,
        #[arg(short, long)]
        output: PathBuf,
        #[arg(short, long)]
        audit: PathBuf,
    },
    /// Restore the exact raw text preserved in an audit
    Rollback {
        audit: PathBuf,
        #[arg(short, long)]
        output: PathBuf,
    },
}

fn read_lexicon(path: &Path) -> Result<Lexicon, String> {
    let content =
        fs::read_to_string(path).map_err(|e| format!("could not read {}: {e}", path.display()))?;
    let lexicon: Lexicon = serde_json::from_str(&content)
        .map_err(|e| format!("{} is not a valid lexicon: {e}", path.display()))?;
    proper_noun_lexicon::validate_lexicon(&lexicon).map_err(|e| e.to_string())?;
    Ok(lexicon)
}

fn write(path: &Path, value: &str) -> Result<(), String> {
    if path.is_dir() {
        return Err(format!("{} is a directory", path.display()));
    }
    if let Some(parent) = path.parent().filter(|p| !p.as_os_str().is_empty()) {
        fs::create_dir_all(parent)
            .map_err(|e| format!("could not create {}: {e}", parent.display()))?;
    }
    fs::write(path, value).map_err(|e| format!("could not write {}: {e}", path.display()))
}

fn prepare_destination(path: &Path) -> Result<(), String> {
    if path.is_dir() {
        return Err(format!("{} is a directory", path.display()));
    }
    if let Some(parent) = path.parent().filter(|p| !p.as_os_str().is_empty()) {
        fs::create_dir_all(parent)
            .map_err(|e| format!("could not create {}: {e}", parent.display()))?;
    }
    Ok(())
}

fn write_temporary(path: &Path, value: &str) -> Result<PathBuf, String> {
    let parent = path
        .parent()
        .filter(|p| !p.as_os_str().is_empty())
        .unwrap_or(Path::new("."));
    let name = path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("pnl-output");
    let nonce = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    for attempt in 0..32 {
        let temporary = parent.join(format!(
            ".{name}.pnl-{}-{nonce}-{attempt}.tmp",
            std::process::id()
        ));
        match fs::OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&temporary)
        {
            Ok(mut file) => {
                if let Err(error) = file
                    .write_all(value.as_bytes())
                    .and_then(|_| file.sync_all())
                {
                    let _ = fs::remove_file(&temporary);
                    return Err(format!("could not write {}: {error}", path.display()));
                }
                return Ok(temporary);
            }
            Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => continue,
            Err(error) => return Err(format!("could not write {}: {error}", path.display())),
        }
    }
    Err(format!(
        "could not create a temporary file for {}",
        path.display()
    ))
}

/// Write a correction only after its rollback audit is safely on disk.
///
/// Both contents are fully written to private sibling temporary files before
/// either visible destination changes. The audit is committed first, so a
/// correction can never be emitted when its required rollback record could
/// not be created.
fn write_correction_pair(
    output: &Path,
    corrected: &str,
    audit: &Path,
    audit_json: &str,
) -> Result<(), String> {
    if output == audit {
        return Err("correction output and audit must be different files".into());
    }
    // Validate both destinations before touching either visible artifact.
    prepare_destination(output)?;
    prepare_destination(audit)?;
    let output_temp = write_temporary(output, corrected)?;
    let audit_temp = match write_temporary(audit, audit_json) {
        Ok(path) => path,
        Err(error) => {
            let _ = fs::remove_file(output_temp);
            return Err(error);
        }
    };
    if let Err(error) = fs::rename(&audit_temp, audit) {
        let _ = fs::remove_file(&output_temp);
        let _ = fs::remove_file(&audit_temp);
        return Err(format!("could not write {}: {error}", audit.display()));
    }
    if let Err(error) = fs::rename(&output_temp, output) {
        let _ = fs::remove_file(&output_temp);
        return Err(format!("could not write {}: {error}", output.display()));
    }
    Ok(())
}

fn run(cli: Cli) -> Result<serde_json::Value, String> {
    match cli.command {
        Command::Import {
            input,
            output,
            name,
        } => {
            let csv = fs::read_to_string(&input)
                .map_err(|e| format!("could not read {}: {e}", input.display()))?;
            let default_name = input
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("lexicon")
                .to_string();
            let lexicon =
                import_csv(&csv, name.unwrap_or(default_name)).map_err(|e| e.to_string())?;
            write(
                &output,
                &(serde_json::to_string_pretty(&lexicon).map_err(|e| e.to_string())? + "\n"),
            )?;
            Ok(
                json!({"ok": true, "command": "import", "entries": lexicon.entries.len(), "output": output}),
            )
        }
        Command::List { lexicon } => {
            let value = read_lexicon(&lexicon)?;
            if !cli.json {
                for entry in &value.entries {
                    println!("{}\t{}", entry.term, entry.aliases.join(" | "));
                }
            }
            Ok(json!({"ok": true, "command": "list", "name": value.name, "entries": value.entries}))
        }
        Command::Export {
            lexicon,
            format,
            output,
        } => {
            let value = read_lexicon(&lexicon)?;
            let payload = export(&value, format).map_err(|e| e.to_string())?;
            write(&output, &payload)?;
            Ok(
                json!({"ok": true, "command": "export", "entries": value.entries.len(), "output": output}),
            )
        }
        Command::Correct {
            lexicon,
            input,
            output,
            audit,
        } => {
            let value = read_lexicon(&lexicon)?;
            let raw = fs::read_to_string(&input)
                .map_err(|e| format!("could not read {}: {e}", input.display()))?;
            let result = proper_noun_lexicon::correct(&raw, &value).map_err(|e| e.to_string())?;
            let audit_json =
                serde_json::to_string_pretty(&result).map_err(|e| e.to_string())? + "\n";
            write_correction_pair(&output, &result.corrected, &audit, &audit_json)?;
            Ok(
                json!({"ok": true, "command": "correct", "changes": result.changes.len(), "output": output, "audit": audit}),
            )
        }
        Command::Rollback { audit, output } => {
            let content = fs::read_to_string(&audit)
                .map_err(|e| format!("could not read {}: {e}", audit.display()))?;
            let value: Audit = serde_json::from_str(&content)
                .map_err(|e| format!("{} is not a valid audit: {e}", audit.display()))?;
            if value.version != proper_noun_lexicon::FORMAT_VERSION {
                return Err(format!("unsupported audit version {}", value.version));
            }
            write(&output, &value.raw)?;
            Ok(json!({"ok": true, "command": "rollback", "output": output}))
        }
    }
}

fn main() {
    let cli = Cli::parse();
    let json_output = cli.json;
    match run(cli) {
        Ok(result) if json_output => {
            println!("{}", serde_json::to_string(&result).expect("JSON result"))
        }
        Ok(result) => {
            if result["command"] != "list" {
                println!(
                    "Done — {}.",
                    result["command"].as_str().unwrap_or("operation")
                );
            }
        }
        Err(message) => {
            if json_output {
                eprintln!("{}", json!({"ok": false, "error": message}));
            } else {
                eprintln!("Error: {message}");
            }
            std::process::exit(1);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn documented_flow_round_trips_raw_text() {
        let dir = tempdir().unwrap();
        let csv = dir.path().join("names.csv");
        let lexicon = dir.path().join("names.json");
        let raw = dir.path().join("raw.txt");
        let corrected = dir.path().join("corrected.txt");
        let audit = dir.path().join("audit.json");
        let restored = dir.path().join("restored.txt");
        fs::write(&csv, "term,aliases\nSociobot,socio bot\n").unwrap();
        fs::write(&raw, "Hello socio bot.").unwrap();
        run(Cli {
            json: true,
            command: Command::Import {
                input: csv,
                output: lexicon.clone(),
                name: None,
            },
        })
        .unwrap();
        run(Cli {
            json: true,
            command: Command::Correct {
                lexicon,
                input: raw.clone(),
                output: corrected.clone(),
                audit: audit.clone(),
            },
        })
        .unwrap();
        run(Cli {
            json: true,
            command: Command::Rollback {
                audit,
                output: restored.clone(),
            },
        })
        .unwrap();
        assert_eq!(fs::read_to_string(corrected).unwrap(), "Hello Sociobot.");
        assert_eq!(
            fs::read_to_string(restored).unwrap(),
            fs::read_to_string(raw).unwrap()
        );
    }

    #[test]
    fn correction_is_not_emitted_when_its_audit_destination_is_unwritable() {
        let dir = tempdir().unwrap();
        let csv = dir.path().join("names.csv");
        let lexicon = dir.path().join("names.json");
        let raw = dir.path().join("raw.txt");
        let corrected = dir.path().join("corrected.txt");
        let blocked_parent = dir.path().join("not-a-directory");
        let audit = blocked_parent.join("audit.json");
        fs::write(&csv, "term,aliases\nSociobot,socio bot\n").unwrap();
        fs::write(&raw, "Hello socio bot.").unwrap();
        fs::write(&blocked_parent, "file, not a directory").unwrap();
        run(Cli {
            json: true,
            command: Command::Import {
                input: csv,
                output: lexicon.clone(),
                name: None,
            },
        })
        .unwrap();

        let error = run(Cli {
            json: true,
            command: Command::Correct {
                lexicon,
                input: raw,
                output: corrected.clone(),
                audit: audit.clone(),
            },
        })
        .unwrap_err();

        assert!(error.contains("could not create"));
        assert!(
            !corrected.exists(),
            "a correction without a rollback audit must not be emitted"
        );
        assert!(!audit.exists());
    }
}
