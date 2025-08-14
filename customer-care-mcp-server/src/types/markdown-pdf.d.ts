declare module 'markdown-pdf' {
  interface Options {
    cssPath?: string;
    paperFormat?: 'A4' | 'A3' | 'A5' | 'Legal' | 'Letter' | 'Tabloid';
    paperOrientation?: 'portrait' | 'landscape';
    paperBorder?: string;
    renderDelay?: number;
    loadTimeout?: number;
  }
  
  interface ToMethods {
    (outputPath: string, callback: (err: Error | null) => void): void;
    buffer(callback: (err: Error | null, buffer: Buffer) => void): void;
  }
  
  interface FromMethods {
    (path: string): { to: ToMethods };
    string(content: string): { to: ToMethods };
  }
  
  interface MarkdownPdfInstance {
    from: FromMethods;
  }
  
  function markdownPdf(options?: Options): MarkdownPdfInstance;
  export = markdownPdf;
}