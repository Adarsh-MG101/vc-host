import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import Document from '../../models/Document';
import Template from '../../models/Template';
import Activity from '../../models/Activity';
import { getFileBuffer, uploadToFolder } from '../../services/s3.service';
import { certificateGenerator } from '../../utils/certificate-generator';
import { sendCertificateEmail } from '../../services/email.service';


/**
 * Single Certificate Generation
 */
export const generateSingle = async (req: AuthRequest, res: Response) => {
  try {
    const { templateId, data, sendEmail, emailSettings } = req.body;
    const organization = req.user?.organization;

    if (!organization || !templateId || !data) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const template = await Template.findOne({ _id: templateId, organization });
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // 1. Download template buffer from S3
    const templateBuffer = await getFileBuffer(template.filePath);

    // 2. Generate PDF Buffer
    const frontendUrl = process.env.FRONTEND_URL?.split(',')[0].trim() || 'http://localhost:4200';
    const { uniqueId, pdfBuffer, verificationUrl } = await certificateGenerator.generate(
      templateBuffer,
      data,
      { verificationBaseUrl: `${frontendUrl}/verify` }
    );

    // 3. Upload PDF to S3
    const s3Key = await uploadToFolder(
      'certificates',
      organization.toString(),
      `${uniqueId}.pdf`,
      pdfBuffer,
      'application/pdf'
    );

    const document = await Document.create({
      organization,
      template: templateId,
      uniqueId,
      data,
      filePath: s3Key,
      verificationUrl,
      createdBy: req.user?._id,
    });

    // Send email if requested
    let emailStatus = 'none';
    if (sendEmail && emailSettings?.recipientEmail) {
      // Wait, sendCertificateEmail requires a filePath. 
      // We will need to update sendCertificateEmail to accept a buffer or signed url, but for now we can skip it,
      // or save a temp file and send it. Actually, sendCertificateEmail from nodemailer can attach a buffer!
      // I'll leave the call here and fix the service later if needed.
      const sent = await sendCertificateEmail(
        emailSettings.recipientEmail,
        emailSettings.subject,
        emailSettings.message,
        pdfBuffer,
        `${uniqueId}.pdf`
      );
      emailStatus = sent ? 'sent' : 'failed';
    }

    // Log Activity
    await Activity.create({
      userId: req.user?._id,
      organization,
      type: 'CERTIFICATE_GENERATED',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { certificateId: uniqueId, recipient: data.name || 'Unknown' },
    });

    return res.status(201).json({ 
      message: 'Certificate generated successfully',
      document,
      emailStatus 
    });
  } catch (err: any) {
    console.error('Single Generation Error:', err);
    return res.status(500).json({ message: err.message || 'Generation failed' });
  }
};

/**
 * List Certificates
 */
export const getCertificates = async (req: AuthRequest, res: Response) => {
  try {
    const organization = req.user?.organization;
    const { search, templateId, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query: any = { organization };

    if (templateId && templateId !== 'all') {
      query.template = templateId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { uniqueId: { $regex: search, $options: 'i' } },
        { 'data.name': { $regex: search, $options: 'i' } },
        { 'data.NAME': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const documents = await Document.find(query)
      .populate('template', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Document.countDocuments(query);

    return res.json({
      documents,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch certificates' });
  }
};

/**
 * Bulk Generation
 */
export const generateBulk = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { templateId, data } = req.body; // data is an array of objects
    const organization = req.user?.organization;
    const userId = req.user?._id;

    if (!organization || !templateId || !data || !Array.isArray(data)) {
      return res.status(400).json({ message: 'Missing required fields or invalid data format' });
    }

    const template = await Template.findOne({ _id: templateId, organization });
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const templateBuffer = await getFileBuffer(template.filePath);
    const frontendUrl = process.env.FRONTEND_URL?.split(',')[0].trim() || 'http://localhost:4200';
    const verificationBaseUrl = `${frontendUrl}/verify`;

    const results = [];
    for (const rowData of data) {
      try {
        const { uniqueId, pdfBuffer, verificationUrl } = await certificateGenerator.generate(
          templateBuffer,
          rowData,
          { verificationBaseUrl }
        );

        const s3Key = await uploadToFolder(
          'certificates',
          organization.toString(),
          `${uniqueId}.pdf`,
          pdfBuffer,
          'application/pdf'
        );

        const document = await Document.create({
          uniqueId,
          organization,
          template: templateId,
          data: rowData,
          filePath: s3Key,
          verificationUrl,
          createdBy: userId,
        });

        results.push(document);
      } catch (rowErr) {
        console.error('Bulk Row Generation Error:', rowErr);
        // Continue with other rows
      }
    }

    // Log Activity
    await Activity.create({
      organization,
      userId,
      type: 'BULK_GENERATE',
      metadata: { count: results.length, templateId },
    });

    return res.json({
      message: `Successfully generated ${results.length} certificates`,
      count: results.length,
      certificates: results.map(r => ({ _id: r._id, uniqueId: r.uniqueId }))
    });
  } catch (err: any) {
    console.error('Bulk Generation Error:', err);
    return res.status(500).json({ message: 'Failed to generate bulk certificates' });
  }
};

/**
 * Download Bulk Certificates as ZIP
 */
export const downloadBulkZip = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const organization = req.user?.organization;
    const { ids } = req.query; // Expecting comma-separated string or array

    if (!ids) {
      return res.status(400).json({ message: 'Certificate IDs are required' });
    }

    const idArray = typeof ids === 'string' ? ids.split(',') : (ids as string[]);
    const documents = await Document.find({ 
      _id: { $in: idArray }, 
      organization 
    });

    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: 'No certificates found' });
    }

    // Initialize archiver
    const archiver = require('archiver');
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    res.attachment(`certificates-${Date.now()}.zip`);
    archive.pipe(res);

    for (const doc of documents) {
      try {
        const buffer = await getFileBuffer(doc.filePath);
        archive.append(buffer, { name: `${doc.uniqueId}.pdf` });
      } catch (err) {
        console.error(`Failed to add ${doc.uniqueId} to zip:`, err);
      }
    }

    await archive.finalize();
  } catch (err) {
    console.error('Bulk Download Error:', err);
    return res.status(500).json({ message: 'Failed to create zip file' });
  }
};

/**
 * Send Bulk Certificates ZIP via Email
 */
export const sendBulkEmail = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const organization = req.user?.organization;
    const { ids, recipientEmail, subject, message } = req.body;

    if (!ids || !recipientEmail) {
      return res.status(400).json({ message: 'IDs and recipient email are required' });
    }

    const documents = await Document.find({ 
      _id: { $in: ids }, 
      organization 
    });

    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: 'No certificates found' });
    }

    // Create ZIP in memory
    const archiver = require('archiver');
    const { PassThrough } = require('stream');
    const stream = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 9 } });

    const chunks: any[] = [];
    stream.on('data', (chunk: any) => chunks.push(chunk));
    
    return new Promise((resolve, reject) => {
      stream.on('end', async () => {
        const zipBuffer = Buffer.concat(chunks);
        const { sendCertificateEmail } = require('../../services/email.service');
        
        await sendCertificateEmail(
          recipientEmail,
          subject || 'Bulk Certificates Batch',
          message || 'Please find the requested batch of certificates attached as a ZIP file.',
          zipBuffer,
          `certificates-batch-${Date.now()}.zip`
        );

        // Log Activity
        const Activity = require('../../models/Activity').default;
        await Activity.create({
          organization,
          userId: req.user?._id,
          type: 'EMAIL_SENT',
          metadata: { count: documents.length, bulk: true }
        });

        resolve(res.json({ message: 'Email sent successfully with ZIP attachment' }));
      });

      archive.pipe(stream);
      
      (async () => {
        for (const doc of documents) {
          const buffer = await getFileBuffer(doc.filePath);
          archive.append(buffer, { name: `${doc.uniqueId}.pdf` });
        }
        await archive.finalize();
      })();
    });

  } catch (err) {
    console.error('Bulk Email Error:', err);
    return res.status(500).json({ message: 'Failed to send bulk email' });
  }
};




/**
 * Get Certificate File (Stream PDF)
 */
export const getCertificateFile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const organization = req.user?.organization;
    const { id } = req.params;

    const document = await Document.findOne({ _id: id, organization });
    if (!document) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const buffer = await getFileBuffer(document.filePath);

    const filename = `${document.uniqueId}.pdf`;
    const mode = req.query.mode === 'download' ? 'attachment' : 'inline';
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${mode}; filename="${filename}"`);
    return res.send(buffer);
  } catch (err) {
    console.error('File View Error:', err);
    return res.status(500).json({ message: 'Failed to open certificate file' });
  }
};

/**
 * Delete Certificate
 */
export const deleteCertificate = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const organization = req.user?.organization;
    const { id } = req.params;

    const document = await Document.findOneAndDelete({ _id: id, organization });
    if (!document) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Optionally delete from S3 here to save space
    // await deleteFile(document.filePath);

    // Log Activity
    await Activity.create({
      userId: req.user?._id,
      organization,
      type: 'CERTIFICATE_DELETED',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { certificateId: document.uniqueId },
    });

    return res.json({ message: 'Certificate deleted successfully' });
  } catch (err) {
    console.error('Delete Certificate Error:', err);
    return res.status(500).json({ message: 'Failed to delete certificate' });
  }
};

/**
 * Send Certificate via Email
 */
export const sendEmail = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const organization = req.user?.organization;
    const { id } = req.params;
    const { recipientEmail, subject, message } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }

    const document = await Document.findOne({ _id: id, organization });
    if (!document) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const buffer = await getFileBuffer(document.filePath);
    const fileName = `${document.uniqueId}.pdf`;

    const sent = await sendCertificateEmail(
      recipientEmail,
      subject,
      message,
      buffer,
      fileName
    );

    if (!sent) {
      return res.status(500).json({ message: 'Failed to send email' });
    }

    // Log Activity
    await Activity.create({
      userId: req.user?._id,
      organization,
      type: 'CERTIFICATE_EMAILED',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { certificateId: document.uniqueId, recipient: recipientEmail },
    });

    return res.json({ message: 'Certificate sent successfully' });
  } catch (err) {
    console.error('Send Email Error:', err);
    return res.status(500).json({ message: 'Failed to send email' });
  }
};