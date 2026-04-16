import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Automatically detects the LibreOffice binary path.
 * Checks environment variable first, then common OS-specific installation paths.
 */
function getLibreOfficePath(): string {
  if (process.env.LIBREOFFICE_PATH) return process.env.LIBREOFFICE_PATH;

  if (process.platform === 'win32') {
    const commonPaths = [
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
    ];

    for (const p of commonPaths) {
      if (fs.existsSync(p)) return `"${p}"`;
    }
    // Fallback if not found in common paths
    return 'soffice'; 
  }

  // Linux/macOS: assume it is in the PATH
  return 'soffice';
}

const LIBREOFFICE_PATH = getLibreOfficePath();

/**
 * Converts a .docx file to .pdf using LibreOffice in headless mode.
 * @param inputPath Path to the input .docx file.
 * @param outputDir Directory where the output .pdf should be saved.
 * @returns Path to the generated .pdf file.
 */
export async function convertDocxToPdf(inputPath: string, outputDir: string): Promise<string> {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${filename}.pdf`);

  try {
    // LibreOffice command: --headless --convert-to pdf --outdir <outputDir> <inputPath>
    const command = `${LIBREOFFICE_PATH} --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;
    
    console.log(`[LibreOffice] Running: ${command}`);
    await execPromise(command);

    if (!fs.existsSync(outputPath)) {
      throw new Error(`PDF conversion failed: Output file not found at ${outputPath}`);
    }

    return outputPath;
  } catch (error) {
    console.error('[LibreOffice] Conversion error:', error);
    throw new Error('Failed to convert document to PDF.');
  }
}

/**
 * Converts a .docx file to a .png image (first page) using LibreOffice.
 */
export async function convertDocxToImage(inputPath: string, outputDir: string): Promise<string> {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${filename}.png`);

  try {
    // LibreOffice command: --headless --convert-to png --outdir <outputDir> <inputPath>
    const command = `${LIBREOFFICE_PATH} --headless --convert-to png --outdir "${outputDir}" "${inputPath}"`;
    
    console.log(`[LibreOffice] Running: ${command}`);
    await execPromise(command);

    if (!fs.existsSync(outputPath)) {
      throw new Error(`Image conversion failed: Output file not found at ${outputPath}`);
    }

    return outputPath;
  } catch (error) {
    console.error('[LibreOffice] Image conversion error:', error);
    throw new Error('Failed to convert document to image.');
  }
}

/**
 * Creates a unique temporary directory for processing a file.
 */
export function createTempDir(): string {
  const tempDir = path.join(os.tmpdir(), `vc-preview-${Date.now()}-${Math.round(Math.random() * 1e9)}`);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

/**
 * Cleans up a directory and all its contents.
 */
export function cleanupDir(dirPath: string): void {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  } catch (err) {
    console.warn(`[Cleanup] Failed to delete temp dir ${dirPath}:`, err);
  }
}
