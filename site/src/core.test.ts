import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { byteOffsetToStringIndex, correct, exportPayload, parseCsv, toCsv } from './core';

const unicodeAuditFixture = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../cli/fixtures/unicode-audit.json'), 'utf8')) as {
  raw: string; entries: { term: string; aliases: string[] }[]; corrected: string;
  changes: { start: number; end: number; original: string; replacement: string; term: string }[];
};

describe('browser lexicon core', () => {
  it('imports quoted CSV and keeps aliases', () => {
    expect(parseCsv('term,aliases\n"Sociobot","socio bot|soshio bot"\n')[0]).toEqual({ term: 'Sociobot', aliases: ['socio bot', 'soshio bot'] });
  });

  it('applies only complete approved aliases and preserves raw', () => {
    const raw = 'Ask socio bot, not sociobotics, about A P I.';
    const audit = correct(raw, [{ term: 'Sociobot', aliases: ['socio bot'] }, { term: 'API', aliases: ['A P I'] }]);
    expect(audit.corrected).toBe('Ask Sociobot, not sociobotics, about API.');
    expect(audit.raw).toBe(raw);
    expect(audit.changes).toHaveLength(2);
  });

  it('round trips exported CSV', () => {
    const entries = [{ term: 'Doe, Jane', aliases: ['jane doe'] }];
    expect(parseCsv(toCsv(entries))).toEqual(entries);
  });

  it('emits each documented model format', () => {
    const entries = [{ term: 'Sociobot', aliases: [] }];
    expect(exportPayload(entries, 'whisper')).toContain('Sociobot');
    expect(JSON.parse(exportPayload(entries, 'azure')).phrases).toEqual(['Sociobot']);
  });

  it('emits a Google inline PhraseSet for RecognitionConfig.adaptation.phraseSets', () => {
    const payload = JSON.parse(exportPayload([{ term: 'Sociobot', aliases: [] }], 'google'));
    expect(Object.keys(payload)).toEqual(['phrases']);
    expect(payload.phrases).toEqual([{ value: 'Sociobot', boost: 15 }]);
    expect(payload).not.toHaveProperty('phraseSet');
    expect(payload).not.toHaveProperty('phraseSets');
  });

  it('shares the Unicode fixture byte offsets with the CLI audit contract', () => {
    const audit = correct(unicodeAuditFixture.raw, unicodeAuditFixture.entries);
    expect(audit.corrected).toBe(unicodeAuditFixture.corrected);
    expect(audit.changes).toEqual(unicodeAuditFixture.changes);
    expect(byteOffsetToStringIndex(audit.raw, audit.changes[0].start)).toBe(3);
    expect(byteOffsetToStringIndex(audit.raw, audit.changes[0].end)).toBe(12);
  });
});
