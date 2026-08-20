import { parse, NodeType, type HTMLElement } from "node-html-parser";
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
 * regexes, so nested lists/tables survive the conversion. Uses
 * node-html-parser (pure JS, no native DOM) instead of jsdom to avoid
 * jsdom's transitive dependency on ESM-only packages breaking under
 * Vercel's serverless require() runtime.
 */
export async function htmlToDocxBuffer(title: string, html: string): Promise<Buffer> {
  const root = parse(html);

  const topLevelElements = root.childNodes.filter(
    (node): node is HTMLElement => node.nodeType === NodeType.ELEMENT_NODE,
  );

  const children = [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
    ...topLevelElements.flatMap((el) => elementToDocxNodes(el)),
  ];

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  return Packer.toBuffer(doc);
}

function elementToDocxNodes(el: HTMLElement): (Paragraph | Table)[] {
  const tag = el.tagName?.toLowerCase() ?? "";
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
      return el.querySelectorAll("li").map(
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

function elementToDocxTable(tableEl: HTMLElement): Table {
  const rows = tableEl.querySelectorAll("tr").map((tr) => {
    const cells = tr.querySelectorAll("th,td");
    const docxCells = cells.map(
      (cell) =>
        new TableCell({
          children: [new Paragraph(cell.textContent?.trim() ?? "")],
          width: { size: 100 / Math.max(cells.length, 1), type: WidthType.PERCENTAGE },
        }),
    );
    return new TableRow({ children: docxCells });
  });

  return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });
}
