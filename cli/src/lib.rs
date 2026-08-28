//! Core library for the `pnl` command.
//!
//! The library applies only aliases that a user explicitly approved and returns
//! an audit containing the exact raw input, so every operation can be reversed.

use regex::RegexBuilder;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fmt::{Display, Formatter};
use std::time::{SystemTime, UNIX_EPOCH};

pub const FORMAT_VERSION: u8 = 1;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Entry {
    pub term: String,
    pub aliases: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Lexicon {
    pub version: u8,
    pub name: String,
    pub entries: Vec<Entry>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Change {
    pub start: usize,
    pub end: usize,
    pub original: String,
    pub replacement: String,
    pub term: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Audit {
    pub version: u8,
    pub created_at: u64,
    pub raw: String,
    pub corrected: String,
    pub changes: Vec<Change>,
}

#[derive(Debug, Clone, Copy, clap::ValueEnum)]
pub enum ExportFormat {
    Whisper,
    GoogleSpeech,
    AzureSpeech,
}

#[derive(Debug)]
pub struct PnlError(pub String);

impl Display for PnlError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl std::error::Error for PnlError {}

/// Parse the documented `term,aliases` CSV format.
pub fn import_csv(input: &str, name: impl Into<String>) -> Result<Lexicon, PnlError> {
    let mut reader = csv::ReaderBuilder::new()
        .trim(csv::Trim::All)
        .from_reader(input.as_bytes());
    let headers = reader
        .headers()
        .map_err(|e| PnlError(format!("could not read CSV header: {e}")))?
        .clone();
    let term_index = headers
        .iter()
        .position(|h| h.eq_ignore_ascii_case("term"))
        .ok_or_else(|| PnlError("CSV needs a 'term' column".into()))?;
    let aliases_index = headers
        .iter()
        .position(|h| h.eq_ignore_ascii_case("aliases"))
        .ok_or_else(|| PnlError("CSV needs an 'aliases' column".into()))?;
    let mut entries = Vec::new();
    let mut terms = HashSet::new();
    for (row_index, record) in reader.records().enumerate() {
        let record =
            record.map_err(|e| PnlError(format!("CSV row {} is invalid: {e}", row_index + 2)))?;
        let term = record.get(term_index).unwrap_or("").trim();
        if term.is_empty() {
            return Err(PnlError(format!(
                "CSV row {} has an empty term",
                row_index + 2
            )));
        }
        let key = term.to_lowercase();
        if !terms.insert(key) {
            return Err(PnlError(format!(
                "duplicate term '{term}' on CSV row {}",
                row_index + 2
            )));
        }
        let mut aliases = Vec::new();
        let mut seen = HashSet::new();
        for alias in record
            .get(aliases_index)
            .unwrap_or("")
            .split('|')
            .map(str::trim)
            .filter(|v| !v.is_empty())
        {
            let alias_key = alias.to_lowercase();
            if alias_key != term.to_lowercase() && seen.insert(alias_key) {
                aliases.push(alias.to_string());
            }
        }
        entries.push(Entry {
            term: term.to_string(),
            aliases,
        });
    }
    if entries.is_empty() {
        return Err(PnlError("CSV has no term rows".into()));
    }
    validate_aliases(&entries)?;
    Ok(Lexicon {
        version: FORMAT_VERSION,
        name: name.into(),
        entries,
    })
}

pub fn validate_lexicon(lexicon: &Lexicon) -> Result<(), PnlError> {
    if lexicon.version != FORMAT_VERSION {
        return Err(PnlError(format!(
            "unsupported lexicon version {}",
            lexicon.version
        )));
    }
    if lexicon.entries.is_empty() {
        return Err(PnlError("lexicon has no entries".into()));
    }
    if lexicon
        .entries
        .iter()
        .any(|entry| entry.term.trim().is_empty())
    {
        return Err(PnlError("lexicon contains an empty term".into()));
    }
    validate_aliases(&lexicon.entries)
}

fn validate_aliases(entries: &[Entry]) -> Result<(), PnlError> {
    let mut owners: std::collections::HashMap<String, &str> = std::collections::HashMap::new();
    for entry in entries {
        for alias in &entry.aliases {
            if alias.trim().is_empty() {
                return Err(PnlError(format!(
                    "term '{}' has an empty alias",
                    entry.term
                )));
            }
            let key = alias.to_lowercase();
            if let Some(owner) = owners.insert(key, &entry.term) {
                if owner != entry.term {
                    return Err(PnlError(format!(
                        "alias '{alias}' belongs to both '{owner}' and '{}'",
                        entry.term
                    )));
                }
            }
        }
    }
    Ok(())
}

/// Apply approved aliases, preferring the longest match and never changing an
/// already-approved canonical term.
pub fn correct(raw: &str, lexicon: &Lexicon) -> Result<Audit, PnlError> {
    validate_lexicon(lexicon)?;
    let canonical: HashSet<String> = lexicon
        .entries
        .iter()
        .map(|e| e.term.to_lowercase())
        .collect();
    let mut candidates: Vec<(&str, &str)> = lexicon
        .entries
        .iter()
        .flat_map(|e| e.aliases.iter().map(move |a| (a.as_str(), e.term.as_str())))
        .filter(|(alias, _)| !canonical.contains(&alias.to_lowercase()))
        .collect();
    candidates.sort_by_key(|(alias, _)| std::cmp::Reverse(alias.chars().count()));

    let mut matches: Vec<(usize, usize, String)> = Vec::new();
    for (alias, term) in candidates {
        // Capture the leading boundary; validate the trailing boundary without
        // consuming it so adjacent/repeated aliases are still discoverable.
        let pattern = format!(r"(?u)(^|[^\p{{L}}\p{{N}}])({})", regex::escape(alias));
        let regex = RegexBuilder::new(&pattern)
            .case_insensitive(true)
            .build()
            .map_err(|e| PnlError(format!("invalid alias '{alias}': {e}")))?;
        for captures in regex.captures_iter(raw) {
            let m = captures.get(2).expect("alias capture");
            if raw[m.end()..]
                .chars()
                .next()
                .is_some_and(|c| c.is_alphanumeric())
            {
                continue;
            }
            if !matches
                .iter()
                .any(|(s, e, _)| m.start() < *e && m.end() > *s)
            {
                matches.push((m.start(), m.end(), term.to_string()));
            }
        }
    }
    matches.sort_by_key(|(start, _, _)| *start);
    let mut corrected = String::with_capacity(raw.len());
    let mut changes = Vec::new();
    let mut cursor = 0;
    for (start, end, term) in matches {
        corrected.push_str(&raw[cursor..start]);
        corrected.push_str(&term);
        changes.push(Change {
            start,
            end,
            original: raw[start..end].to_string(),
            replacement: term.clone(),
            term,
        });
        cursor = end;
    }
    corrected.push_str(&raw[cursor..]);
    let created_at = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    Ok(Audit {
        version: FORMAT_VERSION,
        created_at,
        raw: raw.to_string(),
        corrected,
        changes,
    })
}

pub fn export(lexicon: &Lexicon, format: ExportFormat) -> Result<String, PnlError> {
    validate_lexicon(lexicon)?;
    let terms: Vec<&str> = lexicon.entries.iter().map(|e| e.term.as_str()).collect();
    match format {
        ExportFormat::Whisper => Ok(format!("The following proper nouns may appear: {}. Preserve their spelling exactly.\n", terms.join(", "))),
        ExportFormat::GoogleSpeech => serde_json::to_string_pretty(&serde_json::json!({
            "phraseSet": { "phrases": terms.iter().map(|term| serde_json::json!({"value": term, "boost": 15.0})).collect::<Vec<_>>() }
        })).map(|s| s + "\n").map_err(|e| PnlError(e.to_string())),
        ExportFormat::AzureSpeech => serde_json::to_string_pretty(&serde_json::json!({ "phrases": terms }))
            .map(|s| s + "\n").map_err(|e| PnlError(e.to_string())),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample() -> Lexicon {
        import_csv(
            "term,aliases\nSociobot,socio bot|soshio bot\nAPI,A P I\n",
            "team",
        )
        .unwrap()
    }

    #[test]
    fn documented_csv_imports() {
        let lexicon = sample();
        assert_eq!(lexicon.entries[0].term, "Sociobot");
        assert_eq!(lexicon.entries[0].aliases.len(), 2);
    }

    #[test]
    fn correction_is_approved_and_reversible() {
        let audit = correct(
            "Ask socio bot about the A P I. Keep sociobotics.",
            &sample(),
        )
        .unwrap();
        assert_eq!(
            audit.corrected,
            "Ask Sociobot about the API. Keep sociobotics."
        );
        assert_eq!(audit.changes.len(), 2);
        assert_eq!(
            audit.raw,
            "Ask socio bot about the A P I. Keep sociobotics."
        );
    }

    #[test]
    fn ambiguous_alias_is_rejected() {
        let csv = "term,aliases\nOne,same\nTwo,same\n";
        assert!(
            import_csv(csv, "bad")
                .unwrap_err()
                .to_string()
                .contains("both")
        );
    }

    #[test]
    fn exports_all_documented_formats() {
        for format in [
            ExportFormat::Whisper,
            ExportFormat::GoogleSpeech,
            ExportFormat::AzureSpeech,
        ] {
            let value = export(&sample(), format).unwrap();
            assert!(value.contains("Sociobot"));
        }
    }
}
