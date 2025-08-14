import markdownPdf from 'markdown-pdf';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PdfGenerationOptions {
  cssPath?: string;
  paperFormat?: 'A4' | 'A3' | 'A5' | 'Legal' | 'Letter' | 'Tabloid';
  paperOrientation?: 'portrait' | 'landscape';
  paperBorder?: string;
  renderDelay?: number;
  loadTimeout?: number;
}

export class PdfGenerator {
  private defaultOptions: PdfGenerationOptions = {
    paperFormat: 'A4',
    paperOrientation: 'portrait',
    paperBorder: '2cm',
    renderDelay: 1000,
    loadTimeout: 10000
  };

  constructor(private options: PdfGenerationOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  /**
   * Convert markdown file to PDF
   */
  async convertMarkdownToPdf(
    markdownFilePath: string,
    outputPdfPath: string
  ): Promise<void> {
    try {
      // Check if markdown file exists
      await fs.access(markdownFilePath);
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPdfPath);
      await fs.mkdir(outputDir, { recursive: true });

      return new Promise((resolve, reject) => {
        markdownPdf({
          ...this.options,
          cssPath: this.options.cssPath || this.getDefaultCssPath(),
        }).from(markdownFilePath).to(outputPdfPath, (err: Error | null) => {
          if (err) {
            reject(new Error(`PDF generation failed: ${err.message}`));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      throw new Error(`Failed to convert markdown to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert markdown string to PDF
   */
  async convertMarkdownStringToPdf(
    markdownContent: string,
    outputPdfPath: string
  ): Promise<void> {
    try {
      // Ensure output directory exists
      const outputDir = path.dirname(outputPdfPath);
      await fs.mkdir(outputDir, { recursive: true });

      return new Promise((resolve, reject) => {
        markdownPdf({
          ...this.options,
          cssPath: this.options.cssPath || this.getDefaultCssPath(),
        }).from.string(markdownContent).to(outputPdfPath, (err: Error | null) => {
          if (err) {
            reject(new Error(`PDF generation failed: ${err.message}`));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      throw new Error(`Failed to convert markdown string to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate PDF from markdown file and return as buffer
   */
  async convertMarkdownToBuffer(markdownFilePath: string): Promise<Buffer> {
    try {
      await fs.access(markdownFilePath);

      return new Promise((resolve, reject) => {
        markdownPdf({
          ...this.options,
          cssPath: this.options.cssPath || this.getDefaultCssPath(),
        }).from(markdownFilePath).to.buffer((err: Error | null, buffer: Buffer) => {
          if (err) {
            reject(new Error(`PDF generation failed: ${err.message}`));
          } else {
            resolve(buffer);
          }
        });
      });
    } catch (error) {
      throw new Error(`Failed to convert markdown to buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate PDF from markdown string and return as buffer
   */
  async convertMarkdownStringToBuffer(markdownContent: string): Promise<Buffer> {
    try {
      return new Promise((resolve, reject) => {
        markdownPdf({
          ...this.options,
          cssPath: this.options.cssPath || this.getDefaultCssPath(),
        }).from.string(markdownContent).to.buffer((err: Error | null, buffer: Buffer) => {
          if (err) {
            reject(new Error(`PDF generation failed: ${err.message}`));
          } else {
            resolve(buffer);
          }
        });
      });
    } catch (error) {
      throw new Error(`Failed to convert markdown string to buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getDefaultCssPath(): string {
    return path.join(__dirname, '..', 'assets', 'pdf-styles.css');
  }
}

// Convenience functions for quick usage
export const generatePdfFromMarkdown = async (
  markdownFilePath: string,
  outputPdfPath: string,
  options?: PdfGenerationOptions
): Promise<void> => {
  const generator = new PdfGenerator(options);
  return generator.convertMarkdownToPdf(markdownFilePath, outputPdfPath);
};

export const generatePdfFromMarkdownString = async (
  markdownContent: string,
  outputPdfPath: string,
  options?: PdfGenerationOptions
): Promise<void> => {
  const generator = new PdfGenerator(options);
  return generator.convertMarkdownStringToPdf(markdownContent, outputPdfPath);
};