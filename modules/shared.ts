/** Renders a Context Object slice as readable bullet points for a task prompt. */
export function describeContext(context: Record<string, unknown>): string {
  const lines: string[] = [];
  for (const [section, value] of Object.entries(context)) {
    if (!value || typeof value !== "object") continue;
    for (const [key, fieldValue] of Object.entries(value as Record<string, unknown>)) {
      if (fieldValue === undefined || fieldValue === null || fieldValue === "") continue;
      lines.push(`- ${section}.${key}: ${String(fieldValue)}`);
    }
  }
  return lines.length > 0 ? lines.join("\n") : "(tidak ada data tambahan)";
}
