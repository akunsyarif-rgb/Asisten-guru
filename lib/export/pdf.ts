/**
 * PDF export (blueprint section 23) is delivered via the browser's native
 * print-to-PDF, using the same A4 canvas the workspace preview already
 * renders (section 20) so what the teacher sees is exactly what gets
 * exported. This avoids bundling a headless-browser dependency just to
 * rasterize HTML we already render correctly in-browser, and keeps export
 * manual — no file is produced without the teacher explicitly asking.
 *
 * See app/(app)/documents/[id]/print/page.tsx for the print view, and
 * components/workspace/export-menu.tsx for how it's triggered.
 */
export function buildPrintableHtml(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  @page { size: A4; margin: 2.5cm 2cm; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; line-height: 1.6; }
  h1, h2, h3 { font-family: system-ui, sans-serif; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
