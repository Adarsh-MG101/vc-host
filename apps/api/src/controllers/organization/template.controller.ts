import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import Template from '../../models/Template';
import Activity from '../../models/Activity';
import {
  uploadToFolder,
  deleteFile,
  replaceFile,
  getPublicUrl,
  getFileBuffer,
} from '../../services/s3.service';
import { convertDocxToPdf, convertDocxToImage, createTempDir, cleanupDir } from '../../services/preview.service';
import fs from 'fs';
import path from 'path';

import PizZip from 'pizzip';

// Regex to find {{placeholder}} patterns in text content
const PLACEHOLDER_REGEX = /\{\{(.*?)\}\}/g;
const SYSTEM_TAGS = ['QR_CODE', 'CERTIFICATE_ID', 'CERTIFICATE ID', 'DATE', 'QR', 'IMAGE_QR'];

/**
 * Extract placeholders from a .docx file buffer using PizZip.
 * It reads the internal XML, strips tags to handle split placeholders,
 * and extracts custom tags while excluding system/reserved ones.
 */
function extractPlaceholdersFromBuffer(buffer: Buffer): string[] {
  try {
    const zip = new PizZip(buffer);
    const xmlContent = zip.file('word/document.xml')?.asText();
    
    if (!xmlContent) return [];

    // XML Stripping: removes tags that might split placeholders (e.g., {{ <tag>NAME</tag> }})
    const cleanText = xmlContent.replace(/<[^>]+>/g, '');
    
    const placeholders = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = PLACEHOLDER_REGEX.exec(cleanText)) !== null) {
      const tag = match[1].trim();
      if (!tag) continue;
      
      const upperTag = tag.toUpperCase();
      
      // Filter out system tags and image tags (except QR)
      if (!SYSTEM_TAGS.includes(upperTag) && !upperTag.startsWith('IMAGE ')) {
        placeholders.add(upperTag);
      }
    }

    return Array.from(placeholders);
  } catch (err) {
    console.error('Error extracting placeholders (PizZip):', err);
    return [];
  }
}

/** GET /organization/templates — list all templates for the org */
export const getTemplates = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || !req.user.organization) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { search, status } = req.query;
    const query: any = { organization: req.user.organization };

    if (status === 'active') query.enabled = true;
    if (status === 'inactive') query.enabled = false;

    if (search) {
      query.name = { $regex: search as string, $options: 'i' };
    }

    const templates = await Template.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Attach public URLs for convenience
    const templatesWithUrls = templates.map((t) => ({
      ...t,
      fileUrl: getPublicUrl(t.filePath),
    }));

    return res.json(templatesWithUrls);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/** POST /organization/templates — upload a new template */
export const uploadTemplate = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || !req.user.organization) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const name = req.body.name || file.originalname.replace(/\.docx$/i, '');
    const orgId = req.user.organization.toString();

    // Check for duplicate name within org
    const exists = await Template.findOne({
      organization: req.user.organization,
      name,
    });
    if (exists) {
      return res.status(409).json({ message: 'A template with this name already exists' });
    }

    // Extract placeholders from the buffer before uploading
    const placeholders = extractPlaceholdersFromBuffer(file.buffer);

    // Upload to S3 under templates/<orgId>/
    const s3Key = await uploadToFolder(
      'templates',
      orgId,
      file.originalname,
      file.buffer,
      file.mimetype
    );

    const template = await Template.create({
      organization: req.user.organization,
      name,
      filePath: s3Key,
      placeholders,
      enabled: true,
      createdBy: req.user._id,
    });

    // Log activity
    await Activity.create({
      userId: req.user._id,
      organization: req.user.organization,
      type: 'TEMPLATE_UPLOADED',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { templateId: template._id, templateName: name },
    });

    return res.status(201).json(template);
  } catch (error) {
    console.error('Error uploading template:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/** PUT /organization/templates/:id — update template name, status, or replace its file */
export const updateTemplate = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || !req.user.organization) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;
    const { name, enabled } = req.body;

    const template = await Template.findOne({
      _id: id,
      organization: req.user.organization,
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    if (name !== undefined) {
      // Check for duplicate name
      const exists = await Template.findOne({
        organization: req.user.organization,
        name,
        _id: { $ne: id },
      });
      if (exists) {
        return res.status(409).json({ message: 'A template with this name already exists' });
      }
      template.name = name;
    }

    if (enabled !== undefined) {
      template.enabled = enabled;
    }

    // If a new file was uploaded, replace the old one in S3
    if (req.file) {
      const orgId = req.user.organization.toString();
      const oldKey = template.filePath;

      const newKey = await replaceFile(
        oldKey,
        'templates',
        orgId,
        req.file.originalname,
        req.file.buffer,
        req.file.mimetype
      );

      template.filePath = newKey;

      // Re-extract placeholders from the new file
      template.placeholders = extractPlaceholdersFromBuffer(req.file.buffer);
    }

    await template.save();
    return res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/** DELETE /organization/templates/:id — remove a template */
export const deleteTemplate = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || !req.user.organization) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;

    const template = await Template.findOne({
      _id: id,
      organization: req.user.organization,
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Delete the file from S3
    try {
      await deleteFile(template.filePath);
    } catch (s3Err) {
      console.warn('Could not delete template file from S3:', s3Err);
    }

    await Template.deleteOne({ _id: id });

    // Log activity
    await Activity.create({
      userId: req.user._id,
      organization: req.user.organization,
      type: 'TEMPLATE_DELETED',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { templateName: template.name },
    });

    return res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/** GET /organization/templates/:id/preview — get a PDF preview of the template */
export const getTemplatePreview = async (req: AuthRequest, res: Response): Promise<any> => {
  let tempDir = '';
  try {
    if (!req.user || !req.user.organization) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;
    const template = await Template.findOne({
      _id: id,
      organization: req.user.organization,
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // 1. Download .docx from S3
    const buffer = await getFileBuffer(template.filePath);

    // 2. Setup temp directory
    tempDir = createTempDir();
    const inputPath = path.join(tempDir, 'template.docx');
    fs.writeFileSync(inputPath, buffer);

    // 3. Convert to PDF via LibreOffice
    const pdfPath = await convertDocxToPdf(inputPath, tempDir);

    // 4. Send PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${template.name}.pdf"`);
    
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);

    fileStream.on('end', () => {
      cleanupDir(tempDir);
    });

  } catch (error) {
    console.error('Error generating template preview:', error);
    if (tempDir) cleanupDir(tempDir);
    return res.status(500).json({ message: 'Failed to generate preview' });
  }
};

/** GET /organization/templates/:id/thumbnail — get a PNG preview of the template */
export const getTemplateThumbnail = async (req: AuthRequest, res: Response): Promise<any> => {
  let tempDir = '';
  try {
    if (!req.user || !req.user.organization) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;
    const template = await Template.findOne({
      _id: id,
      organization: req.user.organization,
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // 1. Download .docx from S3
    const buffer = await getFileBuffer(template.filePath);

    // 2. Setup temp directory
    tempDir = createTempDir();
    const inputPath = path.join(tempDir, 'template.docx');
    fs.writeFileSync(inputPath, buffer);

    // 3. Convert to PNG via LibreOffice
    const imagePath = await convertDocxToImage(inputPath, tempDir);

    // 4. Send Image file
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    const fileStream = fs.createReadStream(imagePath);
    fileStream.pipe(res);

    fileStream.on('end', () => {
      cleanupDir(tempDir);
    });

  } catch (error) {
    console.error('Error generating template thumbnail:', error);
    if (tempDir) cleanupDir(tempDir);
    return res.status(500).json({ message: 'Failed to generate thumbnail' });
  }
};