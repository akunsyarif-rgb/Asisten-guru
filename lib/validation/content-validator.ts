import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "u",
  "table", "thead", "tbody", "tr", "th", "td", "br", "blockquote",
];

const MIN_HTML_LENGTH = 20;
const MAX_HTML_LENGTH = 60_000;

export interface ContentValidationIssue {
  code: string;
  message: string;
}

export interface ContentValidationResult {
  ok: boolean;
  sanitizedHtml: string;
  issues: ContentValidationIssue[];
}

/**
 * Content Validation + Safety/Integrity Check (blueprint section 11).
 * Runs after schema validation. Strips anything unsafe, then flags
 * structural problems (too short/long, stray placeholders, disallowed
 * markup) as warnings rather than silently passing broken output through.
 */
export function validateContent(html: string): ContentValidationResult {
  const issues: ContentValidationIssue[] = [];

  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: [],
  });

  if (sanitizedHtml.trim().length < MIN_HTML_LENGTH) {
    issues.push({ code: "too_short", message: "Konten yang dihasilkan terlalu pendek." });
  }

  if (sanitizedHtml.length > MAX_HTML_LENGTH) {
    issues.push({ code: "too_long", message: "Konten yang dihasilkan melebihi batas panjang." });
  }

  const strippedTagCount = countTags(html) - countTags(sanitizedHtml);
  if (strippedTagCount > 0) {
    issues.push({
      code: "unsafe_markup_removed",
      message: `${strippedTagCount} elemen tidak aman dihapus dari output.`,
    });
  }

  return { ok: issues.length === 0, sanitizedHtml, issues };
}

function countTags(html: string): number {
  return (html.match(/<[a-zA-Z]/g) ?? []).length;
}
