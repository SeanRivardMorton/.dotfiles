#!/usr/bin/env node

import { PdfGenerator } from './pdf-generator.js';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Generate PDF report for a customer
 */
export async function generateCustomerReportPdf(
  markdownFilePath: string,
  outputDir: string = 'reports'
): Promise<string> {
  try {
    // Ensure the markdown file exists
    await fs.access(markdownFilePath);
    
    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });
    
    // Generate output filename
    const fileName = path.basename(markdownFilePath, '.md');
    const outputPath = path.join(outputDir, `${fileName}.pdf`);
    
    // Initialize PDF generator with custom options
    const pdfGenerator = new PdfGenerator({
      paperFormat: 'A4',
      paperOrientation: 'portrait',
      paperBorder: '2cm',
      renderDelay: 1000,
      loadTimeout: 10000
    });
    
    // Generate PDF
    await pdfGenerator.convertMarkdownToPdf(markdownFilePath, outputPath);
    
    console.log(`✓ PDF report generated successfully: ${outputPath}`);
    return outputPath;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`✗ Failed to generate PDF report: ${errorMessage}`);
    throw error;
  }
}

/**
 * Command line interface
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: tsx src/generate-report-pdf.ts <markdown-file> [output-directory]');
    console.log('Example: tsx src/generate-report-pdf.ts customer-report-QUZN389.md reports');
    process.exit(1);
  }
  
  const markdownFilePath = args[0];
  const outputDir = args[1] || 'reports';
  
  try {
    const outputPath = await generateCustomerReportPdf(markdownFilePath, outputDir);
    console.log(`Report saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}