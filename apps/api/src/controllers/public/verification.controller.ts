import { Request, Response } from 'express';
import Document from '../../models/Document';

/**
 * Publicly verify a certificate by its uniqueId
 */
export const verifyCertificate = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const certificate = await Document.findOne({ uniqueId: id })
      .populate('organization', 'name logo slug')
      .populate('template', 'name')
      .lean();

    if (!certificate) {
      return res.status(404).json({ 
        verified: false,
        message: 'No certificate found with this ID' 
      });
    }

    return res.json({
      verified: true,
      certificate: {
        _id: certificate._id,
        uniqueId: certificate.uniqueId,
        recipient: certificate.data.name || certificate.data.RECIPIENT_NAME || 'Unknown',
        issuedAt: certificate.createdAt,
        organization: certificate.organization,
        templateName: (certificate.template as any)?.name,
        // We include common fields that might be useful for verification
        details: certificate.data
      }
    });
  } catch (err) {
    console.error('Verification Error:', err);
    return res.status(500).json({ message: 'Internal server error during verification' });
  }
};
