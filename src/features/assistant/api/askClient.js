// Simple client wrapper for /ask endpoint
// Normalizes response shape and supports cancellation.
import { API_BASE } from '../../../config';

export function ask(question, signal) {
  const payload = { question: String(question || '').trim() };
  if (!payload.question) {
    return Promise.resolve({ matches: [], answer: '', error: 'EMPTY_QUESTION' });
  }
  const started = performance.now();
  return fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal
  })
    .then(async (r) => {
      let json = null;
      try { json = await r.json(); } catch { json = {}; }
      if (!r.ok) {
        return { matches: [], answer: '', error: json.error || `HTTP_${r.status}`, detail: json.detail };
      }
      // Normalize matches: either array on root or nested
      let matches = Array.isArray(json.matches) ? json.matches : [];
      if (!matches.length && Array.isArray(json.context)) {
        // context may contain objects with doc field in future fix
        const direct = json.context.map(c => c.doc || c).filter(Boolean);
        if (direct.length) matches = direct;
      }
      return {
        matches,
        answer: typeof json.answer === 'string' ? json.answer : '',
        elapsedMs: Math.round(performance.now() - started)
      };
    })
    .catch((e) => ({ matches: [], answer: '', error: 'NETWORK', detail: e?.message }));
}
