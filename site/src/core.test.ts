import { describe, expect, it } from 'vitest';
import { correct, exportPayload, parseCsv, toCsv } from './core';

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
    expect(JSON.parse(exportPayload(entries, 'google')).phraseSet.phrases[0].boost).toBe(15);
    expect(JSON.parse(exportPayload(entries, 'azure')).phrases).toEqual(['Sociobot']);
  });
});
