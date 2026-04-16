import createReport from 'docx-templates';
import {
  convertDocxToPdf,
  createTempDir,
  cleanupDir,
} from '../services/preview.service';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import crypto from 'crypto';
import PizZip from 'pizzip';

const normalizeDocxPlaceholders = (buffer: Buffer): Buffer => {
  const zip = new PizZip(buffer);
  const docXml = zip.file('word/document.xml')?.asText();

  if (docXml) {
    // 1. Remove XML tags INSIDE any {{...}} placeholder and normalize to UPPERCASE
    let normalizedXml = docXml.replace(
      /\{\{([\s\S]*?)\}\}/g,
      (match, tag) => {
        // Strip inner XML tags and convert to uppercase
        const cleanTag = tag.replace(/<[^>]+>/g, '').trim().toUpperCase();
        return `{{${cleanTag}}}`;
      }
    );

    // 2. Map system tags again just in case (e.g., {{QR}} -> {{IMAGE QR}})
    normalizedXml = normalizedXml.replace(/\{\{QR\}\}/g, '{{IMAGE QR}}');

    zip.file('word/document.xml', normalizedXml);
  }

  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
};

export const certificateGenerator = {
  /**
   * Generates a single certificate PDF from a DOCX template
   */
  generate: async (
    templateBuffer: Buffer,
    data: Record<string, any>,
    options: { verificationBaseUrl: string }
  ) => {
    // 0. Normalize incoming data keys to uppercase
    const normalizedUserData: Record<string, any> = {};
    Object.keys(data).forEach(key => {
      normalizedUserData[key.toUpperCase()] = data[key];
    });

    // 1. Prepare unique ID and QR code
    const uniqueId = `CERT-${new Date().getFullYear()}-${crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase()}`;
    const verificationUrl = `${options.verificationBaseUrl}/${uniqueId}`;

    // Generate QR Code as data URI
    const qrDataUri = await QRCode.toDataURL(verificationUrl);

    // Build the base data object with provided data and system tags
    const baseData: Record<string, any> = {
      ...normalizedUserData,
      CERTIFICATE_ID: uniqueId,
      'CERTIFICATE ID': uniqueId,
      DATE: normalizedUserData.DATE || new Date().toLocaleDateString(),
      QR_CODE: {
        data: qrDataUri.split(',')[1],
        extension: '.png',
        width: 3,
        height: 3,
      },
      QR: {
        data: qrDataUri.split(',')[1],
        extension: '.png',
        width: 3,
        height: 3,
      },
    };

    // Normalize placeholders and fix XML splitting (AND CONVERT TO UPPERCASE IN XML)
    const processedBuffer = normalizeDocxPlaceholders(templateBuffer);

    // Extract all placeholders from the normalized XML
    const zip = new PizZip(processedBuffer);
    const xml = zip.file('word/document.xml')?.asText() || '';
    const cleanText = xml.replace(/<[^>]+>/g, '');
    const finalData = { ...baseData };

    // Find all {{TAG}} patterns and ensure they exist in finalData
    const tagRegex = /\{\{([\s\S]*?)\}\}/g;
    let tagMatch;
    while ((tagMatch = tagRegex.exec(cleanText)) !== null) {
      const tag = tagMatch[1].trim(); // Already uppercase from normalizeDocxPlaceholders
      if (!(tag in finalData)) {
        // Keep the tag verbatim in the PDF if it's unknown
        finalData[tag] = `{{${tag}}}`;
      }
    }

    // 2. Setup temp directory for processing
    const tempDir = createTempDir();
    const tempDocxPath = path.join(tempDir, `${uniqueId}.docx`);

    try {
      // 3. Generate filled DOCX buffer
      const buffer = await createReport({
        template: processedBuffer,
        data: finalData,
        cmdDelimiter: ['{{', '}}'],
      });

      fs.writeFileSync(tempDocxPath, buffer);

      // 4. Convert DOCX to PDF via LibreOffice (Preview Service logic)
      const generatedPdfPath = await convertDocxToPdf(tempDocxPath, tempDir);

      // 5. Read final PDF into memory Buffer
      const pdfBuffer = fs.readFileSync(generatedPdfPath);

      return {
        uniqueId,
        pdfBuffer,
        verificationUrl,
        data: finalData,
      };
    } catch (err) {
      console.error('Certificate Generation Error:', err);
      throw err;
    } finally {
      // Clean up all temp files
      cleanupDir(tempDir);
    }
  },
};
