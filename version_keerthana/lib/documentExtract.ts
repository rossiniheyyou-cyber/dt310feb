/**
 * Extract plain text from document files (PDF, Word, Excel, text) for AI quiz/assignment generation.
 * Used client-side only.
 */

const TEXT_EXTENSIONS = [".txt", ".md", ".csv"];
const MAX_TEXT_LENGTH = 50000;

function getExtension(fileName: string): string {
  const name = (fileName || "").toLowerCase();
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i) : "";
}

/** Extract text from .txt, .md, .csv using File API */
async function extractTextFile(file: File): Promise<string> {
  const text = await file.text();
  return (text || "").slice(0, MAX_TEXT_LENGTH);
}

/** Extract text from PDF using pdfjs-dist */
async function extractPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const numPages = pdf.numPages;
  const parts: string[] = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = (content.items as { str?: string }[])
      .map((item) => item.str || "")
      .join(" ");
    parts.push(text);
  }
  return parts.join("\n\n").slice(0, MAX_TEXT_LENGTH);
}

/** Extract text from .docx using mammoth */
async function extractDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return (result.value || "").slice(0, MAX_TEXT_LENGTH);
}

/** Extract text from .xlsx/.xls using xlsx */
async function extractXlsx(file: File): Promise<string> {
  const XLSX = await import("xlsx");
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const parts: string[] = [];
  workbook.SheetNames.forEach((name) => {
    const sheet = workbook.Sheets[name];
    const text = (XLSX.utils.sheet_to_txt ?? XLSX.utils.sheet_to_csv)?.(sheet) ?? "";
    if (text) parts.push(text);
  });
  return parts.join("\n\n").slice(0, MAX_TEXT_LENGTH);
}

/**
 * Extract plain text from a file. Supports:
 * - .txt, .md, .csv (plain text)
 * - .pdf (PDF.js)
 * - .doc, .docx (mammoth)
 * - .xls, .xlsx (xlsx)
 * - .ppt, .pptx (limited: we try to read as zip/text; otherwise return empty with message)
 */
export async function extractDocumentText(file: File): Promise<{ text: string; error?: string }> {
  const ext = getExtension(file.name);

  try {
    if (TEXT_EXTENSIONS.includes(ext)) {
      const text = await extractTextFile(file);
      return { text };
    }
    if (ext === ".pdf") {
      const text = await extractPdf(file);
      return { text };
    }
    if (ext === ".docx" || ext === ".doc") {
      const text = await extractDocx(file);
      return { text };
    }
    if (ext === ".xlsx" || ext === ".xls") {
      const text = await extractXlsx(file);
      return { text };
    }
    if (ext === ".ppt" || ext === ".pptx") {
      return {
        text: "",
        error: "PowerPoint files are not fully supported. Export as PDF or paste content in the topic box.",
      };
    }
    // Unknown type: try as plain text (e.g. some .doc are plain text)
    try {
      const text = await extractTextFile(file);
      if (text.trim().length > 0) return { text };
    } catch {
      // ignore
    }
    return {
      text: "",
      error: `Unsupported file type "${ext}". Use PDF, Word (.doc/.docx), Excel (.xls/.xlsx), or text (.txt/.md/.csv).`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to extract text";
    return { text: "", error: message };
  }
}

/** Accept all file types for uploads across the system */
export const ACCEPT_ALL = "*/*";

/** Accepted for quiz/assignment document upload (UI hint; extraction still supports PDF, Word, Excel, text). Use ACCEPT_ALL for any format. */
export const ACCEPT_DOCUMENTS = ACCEPT_ALL;
