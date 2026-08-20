import type { ModelAdapter, ModelCompletionRequest, ModelCompletionResult } from "../provider";

/**
 * Deterministic, offline adapter used when AI_PROVIDER=mock (the default).
 * It lets the whole generation pipeline — orchestrator, validator, editor,
 * export — run and be demoed/tested without any API key. It never invents
 * facts: it only reflects back the Context Object it was actually given,
 * honoring the Factuality Lock (section 09) by inserting a placeholder for
 * anything it wasn't given.
 */
export const mockAdapter: ModelAdapter = {
  name: "mock",
  async complete(request: ModelCompletionRequest): Promise<ModelCompletionResult> {
    if (request.userPrompt.includes("INLINE_ASSIST_TASK")) {
      return completeInlineAssist(request);
    }

    const moduleName = extractBetween(request.userPrompt, "TASK PROMPT — ", "\n") ?? "Dokumen";
    const context = extractContextObject(request.userPrompt);

    const entries = Object.entries(context).filter(
      ([, value]) => typeof value === "string" && value.trim().length > 0,
    ) as Array<[string, string]>;

    const placeholders: string[] = [];
    const listItems =
      entries.length > 0
        ? entries.map(([key, value]) => `<li><strong>${escapeHtml(labelFor(key))}:</strong> ${escapeHtml(value)}</li>`)
        : [];

    if (entries.length === 0) {
      const note = "[Perlu dilengkapi: konten belum tersedia dari input yang diberikan]";
      placeholders.push(note);
      listItems.push(`<li>${note}</li>`);
    }

    const html = [
      `<h2>${escapeHtml(moduleName)}</h2>`,
      "<p>Draf berikut disusun dari data yang Anda berikan pada wizard.</p>",
      "<ul>",
      ...listItems,
      "</ul>",
    ].join("\n");

    const payload = { title: moduleName, html, placeholders };

    return {
      text: JSON.stringify(payload),
      provider: "mock",
      model: "mock-deterministic-v1",
    };
  },
};

/**
 * Deterministic stand-in for inline selection-based assist (section 21):
 * returns the selected text lightly normalized, never inventing content,
 * so the whole inline-assist UI works end-to-end without an API key.
 */
function completeInlineAssist(request: ModelCompletionRequest): ModelCompletionResult {
  const match = request.userPrompt.match(/TEKS TERPILIH:\n"""\n([\s\S]*?)\n"""/);
  const original = match?.[1]?.trim() ?? "";
  const normalized = original.replace(/\s+/g, " ").trim();

  return {
    text: JSON.stringify({ text: normalized }),
    provider: "mock",
    model: "mock-deterministic-v1",
  };
}

function extractBetween(source: string, start: string, end: string): string | null {
  const startIdx = source.indexOf(start);
  if (startIdx === -1) return null;
  const from = startIdx + start.length;
  const endIdx = source.indexOf(end, from);
  return source.slice(from, endIdx === -1 ? undefined : endIdx).trim();
}

function extractContextObject(userPrompt: string): Record<string, unknown> {
  const marker = "CONTEXT OBJECT (JSON, hanya berisi data yang relevan untuk modul ini):";
  const idx = userPrompt.indexOf(marker);
  if (idx === -1) return {};
  const jsonStart = userPrompt.indexOf("{", idx);
  if (jsonStart === -1) return {};
  let depth = 0;
  for (let i = jsonStart; i < userPrompt.length; i++) {
    if (userPrompt[i] === "{") depth++;
    if (userPrompt[i] === "}") depth--;
    if (depth === 0) {
      try {
        return flatten(JSON.parse(userPrompt.slice(jsonStart, i + 1)));
      } catch {
        return {};
      }
    }
  }
  return {};
}

function flatten(value: unknown, prefix = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      const nextKey = prefix ? `${prefix}.${key}` : key;
      if (v && typeof v === "object" && !Array.isArray(v)) {
        Object.assign(out, flatten(v, nextKey));
      } else {
        out[nextKey] = v;
      }
    }
  }
  return out;
}

function labelFor(key: string): string {
  const last = key.split(".").pop() ?? key;
  return last.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
