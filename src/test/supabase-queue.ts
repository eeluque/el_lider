/** Cola de respuestas `{ data, error }` para el mock de Supabase (un drain por `await`). */

export type SBResponse = { data: unknown; error: null };

let queue: SBResponse[] = [];

export function setResponseQueue(next: SBResponse[]) {
  queue = [...next];
}

export function drain(): SBResponse {
  const r = queue.shift();
  if (!r) return { data: [], error: null };
  return r;
}

export function resetQueue() {
  queue = [];
}
