use clap::{Parser, Subcommand};
use proper_noun_lexicon::{Audit, ExportFormat, Lexicon, export, import_csv};
use serde_json::json;
use std::ffi::OsString;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Parser)]
#[command(
    name = "pnl",
    version,
    about = "Private proper-noun corrections and speech-model phrase exports",
    long_about = "Import an approved terminology CSV, export model-specific phrase hints, or correct a transcript with a reversible local audit. Inputs and outputs are local files, and commands do not prompt."
)]
struct Cli {
    #[arg(long, global = true, help = "Print a machine-readable JSON result")]
    json: bool,
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Run the complete workflow on bundled sample data in a temporary directory
    Demo,
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

const DEMO_CSV: &str = include_str!("../examples/sample-terms.csv");
const DEMO_RAW: &str = include_str!("../examples/raw-transcript.txt");

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

/// Resolve a parent path without creating it.
///
/// This keeps rejected `output`/`audit` aliases from leaving even an empty
/// parent directory behind. Existing symlinked components are resolved as the
/// operating system resolves them; missing components stay lexical so a later
/// `..` still identifies the destination `create_dir_all` would use.
fn resolve_parent_without_writing(path: &Path) -> Result<PathBuf, String> {
    use std::path::Component;

    let parent = path
        .parent()
        .filter(|parent| !parent.as_os_str().is_empty())
        .unwrap_or(Path::new("."));
    let absolute_parent = if parent.is_absolute() {
        parent.to_path_buf()
    } else {
        std::env::current_dir()
            .map_err(|e| format!("could not resolve the current directory: {e}"))?
            .join(parent)
    };
    let mut resolved = PathBuf::new();
    for component in absolute_parent.components() {
        match component {
            Component::Prefix(prefix) => resolved.push(prefix.as_os_str()),
            Component::RootDir => resolved.push(component.as_os_str()),
            Component::CurDir => {}
            Component::ParentDir => {
                let _ = resolved.pop();
            }
            Component::Normal(name) => {
                let candidate = resolved.join(name);
                resolved = match fs::symlink_metadata(&candidate) {
                    Ok(metadata) if metadata.file_type().is_symlink() => {
                        fs::canonicalize(&candidate).map_err(|e| {
                            format!("could not resolve {}: {e}", candidate.display())
                        })?
                    }
                    Ok(_) => candidate,
                    Err(error) if error.kind() == std::io::ErrorKind::NotFound => candidate,
                    Err(error) => {
                        return Err(format!(
                            "could not inspect {}: {error}",
                            candidate.display()
                        ));
                    }
                };
            }
        }
    }
    Ok(resolved)
}

/// Return the destination that `rename` will replace after resolving its
/// parent. This deliberately does not canonicalize the leaf: it may not exist
/// yet, while a symlinked parent still needs to identify its real directory.
fn canonical_destination(path: &Path) -> Result<PathBuf, String> {
    let name = path
        .file_name()
        .ok_or_else(|| format!("{} does not name a file", path.display()))?;
    let resolved_parent = resolve_parent_without_writing(path)?;
    Ok(resolved_parent.join(name))
}

#[cfg(unix)]
fn same_existing_file(left: &Path, right: &Path) -> Result<bool, String> {
    use std::os::unix::fs::MetadataExt;

    let metadata = |path: &Path| match fs::metadata(path) {
        Ok(value) => Ok(Some(value)),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(format!("could not inspect {}: {error}", path.display())),
    };
    match (metadata(left)?, metadata(right)?) {
        (Some(left), Some(right)) => Ok(left.dev() == right.dev() && left.ino() == right.ino()),
        _ => Ok(false),
    }
}

#[cfg(not(unix))]
fn same_existing_file(_left: &Path, _right: &Path) -> Result<bool, String> {
    Ok(false)
}

/// Refuse path aliases before either correction artifact is written.
///
/// Existing hard links have distinct path spellings, so their file identity is
/// checked separately. The first check is deliberately before parent creation;
/// the second closes the gap after valid destinations prepare their parents.
fn ensure_distinct_destinations(output: &Path, audit: &Path) -> Result<(), String> {
    if output == audit {
        return Err("correction output and audit must be different files".into());
    }
    let collides = || -> Result<bool, String> {
        Ok(
            canonical_destination(output)? == canonical_destination(audit)?
                || same_existing_file(output, audit)?,
        )
    };
    if collides()? {
        return Err("correction output and audit must resolve to different files".into());
    }
    prepare_destination(output)?;
    prepare_destination(audit)?;
    if collides()? {
        return Err("correction output and audit must resolve to different files".into());
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
    // Validate both destinations before touching either visible artifact.
    ensure_distinct_destinations(output, audit)?;
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

fn create_demo_directory() -> Result<PathBuf, String> {
    let base = std::env::temp_dir();
    let nonce = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    for attempt in 0..32 {
        let directory = base.join(format!(
            "proper-noun-lexicon-demo-{}-{nonce}-{attempt}",
            std::process::id()
        ));
        match fs::create_dir(&directory) {
            Ok(()) => return Ok(directory),
            Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => continue,
            Err(error) => {
                return Err(format!(
                    "could not create demo directory {}: {error}",
                    directory.display()
                ));
            }
        }
    }
    Err("could not create a unique demo directory".into())
}

fn run_demo_in(directory: &Path) -> Result<serde_json::Value, String> {
    let csv_path = directory.join("sample-terms.csv");
    let raw_path = directory.join("raw-transcript.txt");
    let lexicon_path = directory.join("sample.pnl.json");
    let corrected_path = directory.join("corrected.txt");
    let audit_path = directory.join("review.pnl-audit.json");
    let whisper_path = directory.join("whisper-prompt.txt");
    let google_path = directory.join("google-phrase-set.json");
    let azure_path = directory.join("azure-phrase-list.json");

    write(&csv_path, DEMO_CSV)?;
    write(&raw_path, DEMO_RAW)?;
    let lexicon = import_csv(DEMO_CSV, "sample vocabulary").map_err(|error| error.to_string())?;
    write(
        &lexicon_path,
        &(serde_json::to_string_pretty(&lexicon).map_err(|error| error.to_string())? + "\n"),
    )?;
    let audit =
        proper_noun_lexicon::correct(DEMO_RAW, &lexicon).map_err(|error| error.to_string())?;
    let audit_json =
        serde_json::to_string_pretty(&audit).map_err(|error| error.to_string())? + "\n";
    write_correction_pair(&corrected_path, &audit.corrected, &audit_path, &audit_json)?;
    write(
        &whisper_path,
        &export(&lexicon, ExportFormat::Whisper).map_err(|error| error.to_string())?,
    )?;
    write(
        &google_path,
        &export(&lexicon, ExportFormat::GoogleSpeech).map_err(|error| error.to_string())?,
    )?;
    write(
        &azure_path,
        &export(&lexicon, ExportFormat::AzureSpeech).map_err(|error| error.to_string())?,
    )?;

    Ok(json!({
        "ok": true,
        "command": "demo",
        "directory": directory,
        "entries": lexicon.entries.len(),
        "changes": audit.changes.len(),
        "corrected": audit.corrected,
        "files": [
            csv_path, raw_path, lexicon_path, corrected_path, audit_path,
            whisper_path, google_path, azure_path
        ]
    }))
}

fn run(cli: Cli) -> Result<serde_json::Value, String> {
    match cli.command {
        Command::Demo => {
            let directory = create_demo_directory()?;
            match run_demo_in(&directory) {
                Ok(result) => Ok(result),
                Err(error) => {
                    let _ = fs::remove_dir_all(&directory);
                    Err(error)
                }
            }
        }
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

fn parse_cli_args(
    arguments: impl IntoIterator<Item = OsString>,
) -> Result<Cli, (bool, clap::Error)> {
    let arguments: Vec<OsString> = arguments.into_iter().collect();
    let json_output = arguments.iter().any(|argument| argument == "--json");
    Cli::try_parse_from(arguments).map_err(|error| (json_output, error))
}

fn json_error(message: impl AsRef<str>) -> String {
    json!({"ok": false, "error": message.as_ref().trim()}).to_string()
}

fn main() {
    let cli = match parse_cli_args(std::env::args_os()) {
        Ok(cli) => cli,
        Err((_, error))
            if matches!(
                error.kind(),
                clap::error::ErrorKind::DisplayHelp | clap::error::ErrorKind::DisplayVersion
            ) =>
        {
            error.exit()
        }
        Err((true, error)) => {
            eprintln!("{}", json_error(error.to_string()));
            std::process::exit(2);
        }
        Err((false, error)) => error.exit(),
    };
    let json_output = cli.json;
    match run(cli) {
        Ok(result) if json_output => {
            println!("{}", serde_json::to_string(&result).expect("JSON result"))
        }
        Ok(result) => {
            if result["command"] == "demo" {
                println!(
                    "Demo complete — sample data was written only to {}.",
                    result["directory"]
                        .as_str()
                        .unwrap_or("a temporary directory")
                );
                println!(
                    "Corrected sample: {}",
                    result["corrected"].as_str().unwrap_or("")
                );
            } else if result["command"] != "list" {
                println!(
                    "Done — {}.",
                    result["command"].as_str().unwrap_or("operation")
                );
            }
        }
        Err(message) => {
            if json_output {
                eprintln!("{}", json_error(message));
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
    fn demo_runs_the_shipped_sample_in_an_isolated_directory() {
        let parent = tempdir().unwrap();
        let directory = parent.path().join("demo-output");
        fs::create_dir(&directory).unwrap();

        let result = run_demo_in(&directory).unwrap();

        assert_eq!(result["entries"], 3);
        assert_eq!(result["changes"], 3);
        assert_eq!(
            fs::read_to_string(directory.join("corrected.txt")).unwrap(),
            "Ask Sociobot whether the Kubernetes API is ready.\n"
        );
        let audit: Audit = serde_json::from_str(
            &fs::read_to_string(directory.join("review.pnl-audit.json")).unwrap(),
        )
        .unwrap();
        assert_eq!(audit.raw, DEMO_RAW);
        assert!(directory.join("whisper-prompt.txt").is_file());
        assert!(directory.join("google-phrase-set.json").is_file());
        assert!(directory.join("azure-phrase-list.json").is_file());
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

        assert!(error.contains("could not"));
        assert!(
            !corrected.exists(),
            "a correction without a rollback audit must not be emitted"
        );
        assert!(!audit.exists());
    }

    fn correction_with_paths(output: PathBuf, audit: PathBuf) -> Result<serde_json::Value, String> {
        let dir = output.parent().unwrap();
        let csv = dir.join("names.csv");
        let lexicon = dir.join("names.json");
        let raw = dir.join("raw.txt");
        fs::write(&csv, "term,aliases\nSociobot,socio bot\n").unwrap();
        fs::write(&raw, "Hello socio bot.").unwrap();
        run(Cli {
            json: true,
            command: Command::Import {
                input: csv,
                output: lexicon.clone(),
                name: None,
            },
        })?;
        run(Cli {
            json: true,
            command: Command::Correct {
                lexicon,
                input: raw,
                output,
                audit,
            },
        })
    }

    #[test]
    fn correction_refuses_dot_and_parent_path_aliases_before_writing() {
        let dir = tempdir().unwrap();
        let missing_parent = dir.path().join("path-alias");
        for (output, audit) in [
            (
                dir.path().join("dot.txt"),
                dir.path().join(".").join("dot.txt"),
            ),
            (
                dir.path().join("parent.txt"),
                dir.path().join("path-alias").join("..").join("parent.txt"),
            ),
        ] {
            let error = correction_with_paths(output.clone(), audit.clone()).unwrap_err();
            assert!(error.contains("different files"));
            assert!(!output.exists());
            assert!(!audit.exists());
        }
        assert!(
            !missing_parent.exists(),
            "a rejected alias must not create its parent"
        );
    }

    #[cfg(unix)]
    #[test]
    fn correction_refuses_symlinked_parent_and_hard_link_aliases_before_writing() {
        use std::os::unix::fs::symlink;

        let dir = tempdir().unwrap();
        let actual = dir.path().join("actual");
        let linked = dir.path().join("linked");
        fs::create_dir(&actual).unwrap();
        symlink(&actual, &linked).unwrap();
        let output = actual.join("symlinked.txt");
        let audit = linked.join("symlinked.txt");
        let error = correction_with_paths(output.clone(), audit.clone()).unwrap_err();
        assert!(error.contains("resolve to different files"));
        assert!(!output.exists());
        assert!(!audit.exists());

        let output = dir.path().join("hard-output.txt");
        let audit = dir.path().join("hard-audit.txt");
        fs::write(&output, "keep this file unchanged").unwrap();
        fs::hard_link(&output, &audit).unwrap();
        let error = correction_with_paths(output.clone(), audit.clone()).unwrap_err();
        assert!(error.contains("resolve to different files"));
        assert_eq!(
            fs::read_to_string(&output).unwrap(),
            "keep this file unchanged"
        );
        assert_eq!(
            fs::read_to_string(&audit).unwrap(),
            "keep this file unchanged"
        );
    }

    #[test]
    fn json_mode_renders_parser_errors_as_json() {
        for (arguments, expected) in [
            (
                vec![
                    "pnl",
                    "--json",
                    "export",
                    "--lexicon",
                    "names.pnl.json",
                    "--format",
                    "invented",
                    "--output",
                    "out.json",
                ],
                "invalid value",
            ),
            (
                vec![
                    "pnl",
                    "--json",
                    "export",
                    "--lexicon",
                    "names.pnl.json",
                    "--format",
                    "whisper",
                ],
                "required arguments",
            ),
        ] {
            let arguments = arguments.into_iter().map(OsString::from);
            let (json_requested, error) = match parse_cli_args(arguments) {
                Ok(_) => panic!("invalid command line parsed successfully"),
                Err(error) => error,
            };
            assert!(json_requested);
            let payload: serde_json::Value =
                serde_json::from_str(&json_error(error.to_string())).unwrap();
            assert_eq!(payload["ok"], false);
            assert!(payload["error"].as_str().unwrap().contains(expected));
        }
    }
}
