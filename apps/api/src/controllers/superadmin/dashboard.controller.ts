import { Request, Response } from 'express';
import Organization from '../../models/Organization';
import Template from '../../models/Template';
import DocumentModel from '../../models/Document';
import Activity from '../../models/Activity';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalOrgs,
      totalTemplates,
      totalCertificates,
      recentActivity
    ] = await Promise.all([
      Organization.countDocuments(),
      Template.countDocuments(),
      DocumentModel.countDocuments(),
      Activity.find()
        .populate('organization', 'name')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const stats = {
      totalOrgs,
      totalTemplates,
      totalCertificates,
      recentActivity
    };

    console.log('[Dashboard] Sending stats:', stats);
    return res.json(stats);
  } catch (error) {
    console.error('[Dashboard] Error:', error);
    return res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};
