import { vi } from "vitest";
import { drain } from "./supabase-queue";

function makeBuilder() {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  for (const k of ["select", "eq", "in", "gte", "lte", "order", "ilike", "filter"]) {
    builder[k] = chain;
  }
  builder.single = () => Promise.resolve(drain());
  builder.then = (resolve: (v: unknown) => unknown) => Promise.resolve(drain()).then(resolve);
  return builder;
}

vi.mock("@/lib/db", () => ({
  getSupabaseAdmin: vi.fn(() => ({
    from: vi.fn(() => makeBuilder()),
  })),
}));
