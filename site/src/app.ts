import './styles.css';
import { byteOffsetToStringIndex, correct, exportPayload, parseCsv, toCsv, validateEntries, type Audit, type Entry } from './core';

const SLUG = 'proper-noun-lexicon';
const routePath = location.pathname.replace(/\/+$/, '') || '/';
const DEMO_MODE = routePath === '/demo' || new URL(location.href).searchParams.get('demo') === '1';
const DEMO_PREFIX = 'demo:pnl:';
const STORAGE_KEY = DEMO_MODE ? `${DEMO_PREFIX}workspace:v1` : 'pnl:workspace:v1';
const RECOVERY_KEY = DEMO_MODE ? `${DEMO_PREFIX}workspace:recovery:v1` : 'pnl:workspace:recovery:v1';
const LICENSE_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const RETRY_KEY = `sb_license_retry:${SLUG}`;
const VERIFY_URL = `https://api.sociobot.in/api/v1/products/${SLUG}/verify`;
const VERIFY_INTERVAL_MS = 86_400_000;
const FREE_LIMIT = 25;
const SAMPLE_ENTRIES: Entry[] = [
  { term: 'Sociobot', aliases: ['socio bot', 'soshio bot'] },
  { term: 'Kubernetes', aliases: ['cuber netties', 'kube er net ease'] },
  { term: 'API', aliases: ['A P I'] },
];
const SAMPLE_RAW = 'Ask socio bot whether the cuber netties A P I is ready.';

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const termList = $('#term-list');
const empty = $('#lexicon-empty');
const rawInput = $<HTMLTextAreaElement>('#raw-text');
const resultWrap = $('#result-wrap');
const reviewEmpty = $('#review-empty');
const correctedOutput = $('#corrected-output');
const changeList = $('#change-list');
const termError = $('#term-error');
const toast = $('#toast');
let entries: Entry[] = [];
let audit: Audit | null = null;
let format: 'whisper' | 'google' | 'azure' = 'whisper';
let pro = false;

function announce(message: string): void {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries, raw: rawInput.value }));
    $('#save-state').textContent = DEMO_MODE ? 'Demo copy only' : 'Saved locally';
  } catch {
    $('#save-state').textContent = 'Local save unavailable';
    $('#save-state').classList.add('warning');
  }
}

function load(): void {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const stored: unknown = JSON.parse(saved);
    if (!stored || typeof stored !== 'object' || !Array.isArray((stored as { entries?: unknown }).entries) || typeof (stored as { raw?: unknown }).raw !== 'string') {
      throw new Error('Saved browser data has an invalid shape.');
    }
    const workspace = stored as { entries: Entry[]; raw: string };
    validateEntries(workspace.entries);
    entries = workspace.entries;
    rawInput.value = workspace.raw;
  } catch {
    entries = [];
    try {
      const stored = JSON.parse(saved) as { raw?: unknown };
      rawInput.value = typeof stored?.raw === 'string' ? stored.raw : '';
    } catch { rawInput.value = ''; }
    try {
      localStorage.setItem(RECOVERY_KEY, saved);
      localStorage.removeItem(STORAGE_KEY);
      $('#saved-data-recovery').hidden = false;
      termError.textContent = 'Saved vocabulary was invalid and was set aside. Your transcript was kept when possible.';
    } catch {
      termError.textContent = 'Saved browser data could not be read. Start a new lexicon or import your CSV again.';
    }
  }
}

function renderEntries(): void {
  termList.replaceChildren();
  entries.forEach((entry, index) => {
    const row = document.createElement('article');
    row.className = 'term-row';
    const mark = document.createElement('span'); mark.className = 'term-mark'; mark.textContent = entry.term.slice(0, 2).toUpperCase(); mark.setAttribute('aria-hidden', 'true');
    const text = document.createElement('div');
    const name = document.createElement('strong'); name.textContent = entry.term;
    const aliases = document.createElement('p'); aliases.textContent = entry.aliases.length ? entry.aliases.join('  →  ') : 'No spoken aliases — phrase bias only';
    text.append(name, aliases);
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-term'; remove.setAttribute('aria-label', `Remove ${entry.term}`); remove.textContent = '×';
    remove.addEventListener('click', () => { entries.splice(index, 1); save(); renderEntries(); renderExport(); announce(`${entry.term} removed.`); });
    row.append(mark, text, remove); termList.append(row);
  });
  empty.hidden = entries.length > 0;
  $('#entry-count').textContent = `${entries.length} ${entries.length === 1 ? 'term' : 'terms'}`;
  $('#limit-note').hidden = pro;
  renderExport();
}

function addEntries(incoming: Entry[], replace = false): boolean {
  const next = replace ? incoming : [...entries, ...incoming];
  if (!pro && next.length > FREE_LIMIT) {
    termError.textContent = `The free workspace holds ${FREE_LIMIT} terms. Your file has ${next.length}; unlock unlimited terms below or import a smaller file.`;
    $('#pricing').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    return false;
  }
  try {
    // Parsing combined CSV reuses the collision checks in the core contract.
    parseCsv(toCsv(next));
    entries = next; termError.textContent = ''; save(); renderEntries(); return true;
  } catch (error) {
    termError.textContent = error instanceof Error ? error.message : 'Those terms could not be added.';
    return false;
  }
}

$('#term-form').addEventListener('submit', event => {
  event.preventDefault();
  const term = $<HTMLInputElement>('#term-input').value.trim();
  const aliases = [...new Set($<HTMLInputElement>('#aliases-input').value.split('|').map(value => value.trim()).filter(Boolean))];
  if (addEntries([{ term, aliases }])) {
    (event.currentTarget as HTMLFormElement).reset(); $<HTMLInputElement>('#term-input').focus(); announce(`${term} added locally.`);
  }
});

$('#csv-file').addEventListener('change', async event => {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0]; if (!file) return;
  try {
    const imported = parseCsv(await file.text());
    if (addEntries(imported, true)) announce(`Imported ${imported.length} terms from ${file.name}.`);
  } catch (error) { termError.textContent = error instanceof Error ? error.message : 'That CSV could not be imported.'; }
  input.value = '';
});

$('#load-sample').addEventListener('click', () => {
  if (addEntries(SAMPLE_ENTRIES.map(entry => ({ ...entry, aliases: [...entry.aliases] })), true)) {
    rawInput.value = SAMPLE_RAW; save(); announce('Sample loaded. Try applying corrections.');
  }
});

function download(name: string, value: string, type: string): void {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

$('#export-csv').addEventListener('click', () => {
  if (!entries.length) return announce('Add vocabulary before exporting CSV.');
  download('proper-noun-lexicon.csv', toCsv(entries), 'text/csv'); announce('CSV exported.');
});

rawInput.addEventListener('input', () => { save(); if (audit) resetReview(); });

function applyCorrections(): void {
  if (!rawInput.value.trim()) { announce('Paste a raw transcript first.'); rawInput.focus(); return; }
  if (!entries.length) { announce('Add at least one approved term first.'); $<HTMLInputElement>('#term-input').focus(); return; }
  audit = correct(rawInput.value, entries);
  correctedOutput.replaceChildren();
  let cursor = 0;
  for (const change of audit.changes) {
    const start = byteOffsetToStringIndex(audit.raw, change.start);
    const end = byteOffsetToStringIndex(audit.raw, change.end);
    correctedOutput.append(document.createTextNode(audit.raw.slice(cursor, start)));
    const mark = document.createElement('mark'); mark.textContent = change.replacement; mark.title = `Changed from “${change.original}”`; correctedOutput.append(mark);
    cursor = end;
  }
  correctedOutput.append(document.createTextNode(audit.raw.slice(cursor)));
  changeList.replaceChildren();
  audit.changes.forEach(change => {
    const item = document.createElement('div');
    const before = document.createElement('del'); before.textContent = change.original;
    const arrow = document.createElement('span'); arrow.textContent = '→'; arrow.setAttribute('aria-hidden', 'true');
    const after = document.createElement('ins'); after.textContent = change.replacement;
    item.append(before, arrow, after); changeList.append(item);
  });
  $('#change-count').textContent = audit.changes.length ? `${audit.changes.length} approved ${audit.changes.length === 1 ? 'change' : 'changes'}` : 'No approved aliases found';
  resultWrap.hidden = false; reviewEmpty.hidden = true; $<HTMLButtonElement>('#undo').disabled = false;
  announce(audit.changes.length ? `${audit.changes.length} corrections ready to review.` : 'No approved aliases were found. Raw text is unchanged.');
}

function resetReview(): void {
  audit = null; resultWrap.hidden = true; reviewEmpty.hidden = false; $<HTMLButtonElement>('#undo').disabled = true;
}

$('#apply-corrections').addEventListener('click', applyCorrections);
$('#undo').addEventListener('click', () => { if (!audit) return; rawInput.value = audit.raw; save(); resetReview(); announce('Exact raw transcript restored.'); });
$('#copy-corrected').addEventListener('click', async () => {
  if (!audit) return;
  try { await navigator.clipboard.writeText(audit.corrected); announce('Corrected text copied.'); }
  catch { download('corrected.txt', audit.corrected, 'text/plain'); announce('Clipboard unavailable; downloaded corrected text.'); }
});
$('#download-audit').addEventListener('click', () => { if (audit) download('review.pnl-audit.json', JSON.stringify(audit, null, 2) + '\n', 'application/json'); });

$('#download-saved-data').addEventListener('click', () => {
  const recovery = localStorage.getItem(RECOVERY_KEY);
  if (!recovery) return announce('There is no saved recovery data to download.');
  download('proper-noun-lexicon-recovery.json', recovery + '\n', 'application/json');
});
$('#discard-saved-data').addEventListener('click', () => {
  localStorage.removeItem(RECOVERY_KEY);
  $('#saved-data-recovery').hidden = true;
  termError.textContent = '';
  announce('Saved recovery copy discarded.');
});

function renderExport(): void {
  $('#export-preview').textContent = entries.length ? exportPayload(entries, format) : 'Add vocabulary to preview a model-ready export.';
  $('#download-model').textContent = format === 'whisper' ? 'Download prompt' : 'Download phrase file';
  $('#export-help').textContent = {
    whisper: 'Use this text as a Whisper initial prompt.',
    google: 'Insert this inline PhraseSet object into RecognitionConfig.adaptation.phraseSets[].',
    azure: 'Submit this phrase list through the Azure Speech phrase-list interface.',
  }[format];
}

const exportTabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
function selectExportTab(tab: HTMLButtonElement, moveFocus = false): void {
  exportTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  format = tab.dataset.format as typeof format;
  $('#export-preview').setAttribute('aria-labelledby', tab.id);
  renderExport();
  if (moveFocus) tab.focus();
}
exportTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectExportTab(tab));
  tab.addEventListener('keydown', event => {
    let next: number | undefined;
    if (event.key === 'ArrowRight') next = (index + 1) % exportTabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + exportTabs.length) % exportTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = exportTabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectExportTab(exportTabs[next], true);
  });
});
$('#download-model').addEventListener('click', () => {
  if (!entries.length) return announce('Add vocabulary before exporting.');
  const names = { whisper: 'whisper-prompt.txt', google: 'google-phrase-set.json', azure: 'azure-phrase-list.json' };
  download(names[format], exportPayload(entries, format), format === 'whisper' ? 'text/plain' : 'application/json');
});

document.addEventListener('keydown', event => {
  const mod = event.ctrlKey || event.metaKey;
  if (mod && event.key === 'Enter') { event.preventDefault(); applyCorrections(); }
  if (mod && event.key.toLowerCase() === 'z' && audit && !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) {
    event.preventDefault(); rawInput.value = audit.raw; save(); resetReview(); announce('Exact raw transcript restored.');
  }
});
if (/Mac|iPhone|iPad/.test(navigator.platform)) $('#shortcut-hint').textContent = '⌘ + Enter';

function setPro(value: boolean, status = ''): void {
  pro = value; document.body.classList.toggle('is-pro', value);
  $('#license-status').textContent = status || (value ? '✓ Permanent access active on this device.' : '');
  $('#buy-link').textContent = value ? 'Permanent access active' : 'Buy permanent access';
  $('#buy-link').setAttribute('aria-disabled', String(value));
  renderEntries();
}

async function verifyLicense(token: string, force = false): Promise<void> {
  let cached: { valid: boolean; checkedAt: number; token: string } | null = null;
  try { cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null'); } catch { /* verify fresh */ }
  let limitedUntil = 0;
  try {
    const retry = JSON.parse(localStorage.getItem(RETRY_KEY) || 'null') as { token?: string; retryAt?: number } | null;
    if (retry?.token === token && typeof retry.retryAt === 'number') limitedUntil = retry.retryAt;
  } catch { /* retry now */ }
  if (limitedUntil > Date.now()) {
    const retrySeconds = Math.max(1, Math.ceil((limitedUntil - Date.now()) / 1000));
    const status = `Too many license checks. Try again in ${retrySeconds} seconds; ${cached?.valid ? 'the last verified license remains active' : 'the free workspace still works'}.`;
    setPro(Boolean(cached?.valid), status);
    return;
  }
  if (!force && cached?.token === token && Date.now() - cached.checkedAt < VERIFY_INTERVAL_MS) { setPro(cached.valid); return; }
  $('#license-status').textContent = navigator.onLine ? 'Checking license…' : 'Offline — cached license state kept.';
  try {
    const response = await fetch(`${VERIFY_URL}?license=${encodeURIComponent(token)}`, { headers: { accept: 'application/json' } });
    if (response.status === 429) {
      const retryHeader = response.headers.get('retry-after');
      const retryDate = retryHeader && !/^\d+$/.test(retryHeader) ? Date.parse(retryHeader) : Number.NaN;
      const retrySeconds = retryHeader && /^\d+$/.test(retryHeader) ? Number(retryHeader) : null;
      const retryAt = retrySeconds === null ? (Number.isNaN(retryDate) ? Date.now() + 60_000 : retryDate) : Date.now() + retrySeconds * 1000;
      localStorage.setItem(RETRY_KEY, JSON.stringify({ token, retryAt }));
      const retryText = retrySeconds === null ? 'later' : `in ${retrySeconds} seconds`;
      if (cached?.token === token && cached.valid) setPro(true, `Too many license checks. Try again ${retryText}; the last verified license remains active.`);
      else setPro(false, `Too many license checks. Try again ${retryText}; the free workspace still works.`);
      return;
    }
    if (!response.ok) throw new Error('verification service unavailable');
    const verdict = await response.json() as { valid: boolean; reason?: string };
    localStorage.removeItem(RETRY_KEY);
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: verdict.valid, checkedAt: Date.now(), token }));
    setPro(verdict.valid, verdict.valid ? '✓ License verified. Permanent access is active.' : 'License no longer active. You can keep using the free workspace or buy a new license.');
  } catch {
    if (cached?.token === token && cached.valid) setPro(true, 'Offline — using the last verified license.');
    else setPro(false, 'Could not verify right now. Check your connection and try again; the free workspace still works.');
  }
}

function initLicense(): void {
  const url = new URL(location.href), returned = url.searchParams.get('license');
  if (returned) { localStorage.setItem(LICENSE_KEY, returned); url.searchParams.delete('license'); history.replaceState({}, '', url); }
  const token = returned || localStorage.getItem(LICENSE_KEY);
  if (token) {
    try {
      const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null');
      if (cached?.valid && cached.token === token) setPro(true, '✓ Permanent access active. Verifying quietly…');
    } catch { /* verify below */ }
    void verifyLicense(token, Boolean(returned));
  }
}

$('#show-license').addEventListener('click', () => { const form = $<HTMLFormElement>('#license-form'); form.hidden = false; $<HTMLInputElement>('#license-token').focus(); });
$('#license-form').addEventListener('submit', event => {
  event.preventDefault(); const token = $<HTMLInputElement>('#license-token').value.trim();
  if (!token) { $('#license-status').textContent = 'Paste the license token from your receipt.'; return; }
  localStorage.setItem(LICENSE_KEY, token); void verifyLicense(token);
});

function connectionState(): void {
  $('#connection-status').innerHTML = navigator.onLine ? '<span aria-hidden="true">●</span> Local &amp; ready' : '<span aria-hidden="true">○</span> Offline — local tools ready';
}
addEventListener('online', connectionState); addEventListener('offline', connectionState);

function removeDemoStorage(): void {
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(DEMO_PREFIX)) localStorage.removeItem(key);
  }
}

function seedDemo(): void {
  entries = SAMPLE_ENTRIES.map(entry => ({ ...entry, aliases: [...entry.aliases] }));
  rawInput.value = SAMPLE_RAW;
  resetReview();
  save();
}

function initDemo(): void {
  if (!DEMO_MODE) return;
  document.body.classList.add('demo-mode');
  $('#demo-banner').hidden = false;
  document.title = 'Demo — Proper Noun Lexicon';
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', 'https://proper-noun-lexicon.sociobot.in/demo');
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', 'https://proper-noun-lexicon.sociobot.in/demo');
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', 'Demo — Proper Noun Lexicon');
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', 'Demo — Proper Noun Lexicon');
  try {
    if (localStorage.getItem(STORAGE_KEY) === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries: SAMPLE_ENTRIES, raw: SAMPLE_RAW }));
    }
  } catch {
    entries = SAMPLE_ENTRIES.map(entry => ({ ...entry, aliases: [...entry.aliases] }));
    rawInput.value = SAMPLE_RAW;
  }
}

$('#reset-demo').addEventListener('click', () => {
  removeDemoStorage();
  seedDemo();
  renderEntries();
  announce('Demo reset to the original sample.');
});
$('#start-real').addEventListener('click', () => removeDemoStorage());

initDemo(); load(); renderEntries(); connectionState();
if (!DEMO_MODE) initLicense();
if (DEMO_MODE) requestAnimationFrame(() => {
  document.documentElement.classList.add('instant-scroll');
  window.scrollTo(0, $('#workspace').offsetTop + 96);
  document.documentElement.classList.remove('instant-scroll');
});
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => { /* online app remains available */ }));
