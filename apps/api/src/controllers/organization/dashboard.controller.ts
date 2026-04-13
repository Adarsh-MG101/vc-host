import { Response } from 'express';
import Template from '../../models/Template';
import Document from '../../models/Document';
import { AuthRequest } from '../../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { user } = req;
    const orgId = user.organization;

    if (!orgId) {
      return res.status(400).json({ message: 'User does not belong to an organization' });
    }

    // 1. Total Templates
    const totalTemplates = await Template.countDocuments({ organization: orgId });

    // 2. Total Certificates
    const totalCertificates = await Document.countDocuments({ organization: orgId });

    // 3. Certificates Generated this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyCertificates = await Document.countDocuments({ 
      organization: orgId,
      createdAt: { $gte: startOfMonth }
    });

    // 4. Last generated time
    const lastCert = await Document.findOne({ organization: orgId })
      .sort({ createdAt: -1 })
      .select('createdAt');

    // 5. Recent Certificates (last 10)
    const recentCertificates = await Document.find({ organization: orgId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('template', 'name')
      .populate('createdBy', 'name');

    return res.status(200).json({
      stats: {
        totalTemplates,
        totalCertificates,
        monthlyCertificates,
        lastGeneratedAt: lastCert?.createdAt || null
      },
      recentCertificates
    });
  } catch (error) {
    console.error('Organization Dashboard Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
