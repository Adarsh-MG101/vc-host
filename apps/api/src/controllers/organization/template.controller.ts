import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import Template from '../../models/Template';
import Activity from '../../models/Activity';
import fs from 'fs';

import PizZip from 'pizzip';

// Regex to find {{placeholder}} patterns in text content
const PLACEHOLDER_REGEX = /\{\{(.*?)\}\}/g;
const SYSTEM_TAGS = ['QR_CODE', 'CERTIFICATE_ID', 'DATE', 'QR', 'IMAGE_QR'];

/**
 * Extract placeholders from a .docx file using PizZip.
 * It reads the internal XML, strips tags to handle split placeholders,
 * and extracts custom tags while excluding system/reserved ones.
 */
function extractPlaceholdersFromDocx(filePath: string): string[] {
  try {
    const data = fs.readFileSync(filePath);
    const zip = new PizZip(data);
    const xmlContent = zip.file('word/document.xml')?.asText();
    
    if (!xmlContent) return [];

    // XML Stripping: removes tags that might split placeholders (e.g., {{ <tag>NAME</tag> }})
    const cleanText = xmlContent.replace(/<[^>]+>/g, '');
    
    const placeholders = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = PLACEHOLDER_REGEX.exec(cleanText)) !== null) {
      const tag = match[1].trim().toUpperCase();
      
      // Filter out system tags and image tags (except QR)
      if (tag && !SYSTEM_TAGS.includes(tag) && !tag.startsWith('IMAGE ')) {
        placeholders.add(tag);
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

    return res.json(templates);
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

    // Check for duplicate name within org
    const exists = await Template.findOne({
      organization: req.user.organization,
      name,
    });
    if (exists) {
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      return res.status(409).json({ message: 'A template with this name already exists' });
    }

    // Extract placeholders from the uploaded docx
    const placeholders = extractPlaceholdersFromDocx(file.path);

    const template = await Template.create({
      organization: req.user.organization,
      name,
      filePath: file.path,
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

/** PUT /organization/templates/:id — update template name or status */
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

    // Delete the physical file
    try {
      if (fs.existsSync(template.filePath)) {
        fs.unlinkSync(template.filePath);
      }
    } catch (fsErr) {
      console.warn('Could not delete template file:', fsErr);
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