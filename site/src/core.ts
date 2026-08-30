export type Entry = { term: string; aliases: string[] };
export type Change = { start: number; end: number; original: string; replacement: string; term: string };
export type Audit = { version: 1; created_at: number; raw: string; corrected: string; changes: Change[] };

const utf8 = new TextEncoder();

/** Convert a JavaScript string position to the documented UTF-8 byte offset. */
export function stringIndexToByteOffset(value: string, index: number): number {
  return utf8.encode(value.slice(0, index)).byteLength;
}

/** Convert a documented UTF-8 byte offset back to a JavaScript string position. */
export function byteOffsetToStringIndex(value: string, offset: number): number {
  if (!Number.isInteger(offset) || offset < 0) throw new Error('The audit offset is invalid.');
  let bytes = 0;
  let index = 0;
  for (const character of value) {
    if (bytes === offset) return index;
    bytes += utf8.encode(character).byteLength;
    index += character.length;
  }
  if (bytes === offset) return index;
  throw new Error('The audit offset does not end at a UTF-8 character boundary.');
}

export function parseCsv(input: string): Entry[] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', quoted = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"' && quoted && input[i + 1] === '"') { field += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && input[i + 1] === '\n') i++;
      row.push(field); if (row.some(cell => cell.trim())) rows.push(row); row = []; field = '';
    } else field += char;
  }
  row.push(field); if (row.some(cell => cell.trim())) rows.push(row);
  if (quoted) throw new Error('The CSV has an unclosed quoted field.');
  if (!rows.length) throw new Error('The CSV is empty.');
  const headers = rows[0].map(value => value.trim().toLowerCase());
  const termIndex = headers.indexOf('term'), aliasIndex = headers.indexOf('aliases');
  if (termIndex < 0 || aliasIndex < 0) throw new Error("The CSV needs 'term' and 'aliases' columns.");
  const entries = rows.slice(1).map((cells, index) => {
    const term = (cells[termIndex] || '').trim();
    if (!term) throw new Error(`Row ${index + 2} has an empty term.`);
    const aliases = [...new Set((cells[aliasIndex] || '').split('|').map(a => a.trim()).filter(a => a && a.toLocaleLowerCase() !== term.toLocaleLowerCase()))];
    return { term, aliases };
  });
  if (!entries.length) throw new Error('The CSV has no term rows.');
  validateEntries(entries);
  return entries;
}

export function validateEntries(entries: Entry[]): void {
  const terms = new Set<string>(), aliases = new Map<string, string>();
  for (const entry of entries) {
    if (!entry || typeof entry.term !== 'string' || !Array.isArray(entry.aliases) || entry.aliases.some(alias => typeof alias !== 'string')) {
      throw new Error('Saved vocabulary has an invalid entry.');
    }
    const termKey = entry.term.trim().toLocaleLowerCase();
    if (!termKey) throw new Error('An approved spelling is empty.');
    if (terms.has(termKey)) throw new Error(`The term “${entry.term}” is already present.`);
    terms.add(termKey);
    for (const alias of entry.aliases) {
      const key = alias.trim().toLocaleLowerCase();
      if (!key) throw new Error(`The aliases for “${entry.term}” include an empty value.`);
      const owner = aliases.get(key);
      if (owner && owner !== entry.term) throw new Error(`The alias “${alias}” already maps to “${owner}”.`);
      aliases.set(key, entry.term);
    }
  }
}

const isWord = (char: string | undefined) => char ? /[\p{L}\p{N}]/u.test(char) : false;

export function correct(raw: string, entries: Entry[]): Audit {
  validateEntries(entries);
  const aliases = entries.flatMap(entry => entry.aliases.map(alias => ({ alias, term: entry.term })))
    .sort((a, b) => b.alias.length - a.alias.length);
  const lower = raw.toLocaleLowerCase();
  const occupied: Array<[number, number]> = [];
  const matches: Array<{ start: number; end: number; original: string; replacement: string; term: string }> = [];
  for (const { alias, term } of aliases) {
    const needle = alias.toLocaleLowerCase();
    let from = 0, start: number;
    while ((start = lower.indexOf(needle, from)) >= 0) {
      const end = start + needle.length;
      const boundary = !isWord(raw[start - 1]) && !isWord(raw[end]);
      const overlaps = occupied.some(([a, b]) => start < b && end > a);
      if (boundary && !overlaps) {
        occupied.push([start, end]);
        matches.push({ start, end, original: raw.slice(start, end), replacement: term, term });
      }
      from = Math.max(end, start + 1);
    }
  }
  matches.sort((a, b) => a.start - b.start);
  let cursor = 0, corrected = '';
  for (const change of matches) { corrected += raw.slice(cursor, change.start) + change.replacement; cursor = change.end; }
  corrected += raw.slice(cursor);
  const changes = matches.map(change => ({
    start: stringIndexToByteOffset(raw, change.start),
    end: stringIndexToByteOffset(raw, change.end),
    original: change.original,
    replacement: change.replacement,
    term: change.term,
  }));
  return { version: 1, created_at: Math.floor(Date.now() / 1000), raw, corrected, changes };
}

export function exportPayload(entries: Entry[], format: 'whisper' | 'google' | 'azure'): string {
  const terms = entries.map(entry => entry.term);
  if (format === 'whisper') return `The following proper nouns may appear: ${terms.join(', ')}. Preserve their spelling exactly.\n`;
  // One inline Google Cloud Speech PhraseSet for
  // RecognitionConfig.adaptation.phraseSets[].
  if (format === 'google') return JSON.stringify({ phrases: terms.map(value => ({ value, boost: 15 })) }, null, 2) + '\n';
  return JSON.stringify({ phrases: terms }, null, 2) + '\n';
}

export function toCsv(entries: Entry[]): string {
  const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return 'term,aliases\n' + entries.map(entry => `${quote(entry.term)},${quote(entry.aliases.join('|'))}`).join('\n') + '\n';
}
