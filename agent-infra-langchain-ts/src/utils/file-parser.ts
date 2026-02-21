import { createLogger } from "./logger.js";

const log = createLogger("FileParser");

/** Supported file types */
export type FileType = "pdf" | "docx" | "txt" | "md" | "markdown";

/** Parsed document result */
export interface ParsedDocument {
  content: string;
  metadata: {
    filename: string;
    mimetype: string;
    size: number;
    type: FileType;
    pages?: number;
    wordCount?: number;
  };
}

/** Get file type from filename */
export function getFileType(filename: string): FileType | null {
  const ext = filename.toLowerCase().split(".").pop();
  
  switch (ext) {
    case "pdf":
      return "pdf";
    case "docx":
      return "docx";
    case "txt":
      return "txt";
    case "md":
    case "markdown":
      return "md";
    default:
      return null;
  }
}

/** Check if file type is supported */
export function isSupportedFileType(filename: string): boolean {
  return getFileType(filename) !== null;
}

/** Parse PDF file */
async function parsePDF(buffer: Buffer, filename: string): Promise<ParsedDocument> {
  try {
    // Dynamic import to avoid issues if package not available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParseModule: any = await import("pdf-parse");
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const result = await pdfParse(buffer);
    
    return {
      content: result.text,
      metadata: {
        filename,
        mimetype: "application/pdf",
        size: buffer.length,
        type: "pdf",
        pages: result.numpages,
        wordCount: result.text.split(/\s+/).length
      }
    };
  } catch (error) {
    log.error("PDF parsing failed", error instanceof Error ? error : new Error(String(error)));
    throw new Error("Failed to parse PDF file");
  }
}

/** Parse DOCX file */
async function parseDOCX(buffer: Buffer, filename: string): Promise<ParsedDocument> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    
    return {
      content: result.value,
      metadata: {
        filename,
        mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: buffer.length,
        type: "docx",
        wordCount: result.value.split(/\s+/).length
      }
    };
  } catch (error) {
    log.error("DOCX parsing failed", error instanceof Error ? error : new Error(String(error)));
    throw new Error("Failed to parse DOCX file");
  }
}

/** Parse text file (TXT, MD) */
async function parseText(buffer: Buffer, filename: string, type: "txt" | "md"): Promise<ParsedDocument> {
  try {
    const content = buffer.toString("utf-8");
    
    return {
      content,
      metadata: {
        filename,
        mimetype: type === "md" ? "text/markdown" : "text/plain",
        size: buffer.length,
        type,
        wordCount: content.split(/\s+/).length
      }
    };
  } catch (error) {
    log.error("Text parsing failed", error instanceof Error ? error : new Error(String(error)));
    throw new Error(`Failed to parse ${type.toUpperCase()} file`);
  }
}

/** Parse file based on type */
export async function parseFile(
  buffer: Buffer,
  filename: string
): Promise<ParsedDocument> {
  const fileType = getFileType(filename);
  
  if (!fileType) {
    throw new Error(
      `Unsupported file type: ${filename}. Supported: PDF, DOCX, TXT, MD`
    );
  }
  
  log.info(`Parsing file`, { filename, type: fileType, size: buffer.length });
  
  switch (fileType) {
    case "pdf":
      return parsePDF(buffer, filename);
    case "docx":
      return parseDOCX(buffer, filename);
    case "txt":
    case "md":
      return parseText(buffer, filename, fileType);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/** Get file size in human readable format */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/** Validate file before parsing */
export function validateFile(
  filename: string,
  size: number,
  maxSizeBytes = 10 * 1024 * 1024 // 10MB default
): { valid: boolean; error?: string } {
  // Check file type
  if (!isSupportedFileType(filename)) {
    return {
      valid: false,
      error: `Unsupported file type. Supported: PDF, DOCX, TXT, MD, MARKDOWN`
    };
  }
  
  // Check file size
  if (size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${formatFileSize(maxSizeBytes)}`
    };
  }
  
  // Check for empty file
  if (size === 0) {
    return {
      valid: false,
      error: "File is empty"
    };
  }
  
  return { valid: true };
}
