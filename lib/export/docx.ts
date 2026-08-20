import { JSDOM } from "jsdom";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";

/**
 * Converts a document's sanitized HTML (the MVP output contract, section
 * 10) into a .docx buffer. Walks the DOM directly rather than string
 * regexes, so nested lists/tables survive the conversion.
 */
export async function htmlToDocxBuffer(title: string, html: string): Promise<Buffer> {
  const dom = new JSDOM(`<!doctype html><body>${html}</body>`);
  const body = dom.window.document.body;

  const children = [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
    ...Array.from(body.children).flatMap((el) => elementToDocxNodes(el)),
  ];

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  return Packer.toBuffer(doc);
}

function elementToDocxNodes(el: Element): (Paragraph | Table)[] {
  const tag = el.tagName.toLowerCase();
  const text = el.textContent?.trim() ?? "";

  switch (tag) {
    case "h1":
      return [new Paragraph({ text, heading: HeadingLevel.HEADING_1 })];
    case "h2":
      return [new Paragraph({ text, heading: HeadingLevel.HEADING_2 })];
    case "h3":
    case "h4":
      return [new Paragraph({ text, heading: HeadingLevel.HEADING_3 })];
    case "p":
    case "blockquote":
      return text ? [new Paragraph({ children: [new TextRun(text)] })] : [];
    case "ul":
    case "ol":
      return Array.from(el.querySelectorAll("li")).map(
        (li) =>
          new Paragraph({
            text: li.textContent?.trim() ?? "",
            bullet: { level: 0 },
          }),
      );
    case "table":
      return [elementToDocxTable(el)];
    default:
      return text ? [new Paragraph({ children: [new TextRun(text)] })] : [];
  }
}

function elementToDocxTable(tableEl: Element): Table {
  const rows = Array.from(tableEl.querySelectorAll("tr")).map((tr) => {
    const cells = Array.from(tr.querySelectorAll("th,td")).map(
      (cell) =>
        new TableCell({
          children: [new Paragraph(cell.textContent?.trim() ?? "")],
          width: { size: 100 / Math.max(tr.children.length, 1), type: WidthType.PERCENTAGE },
        }),
    );
    return new TableRow({ children: cells });
  });

  return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });
}
