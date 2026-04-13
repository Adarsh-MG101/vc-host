import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import Activity from '../../models/Activity';
import User from '../../models/User';

export const getOrganizationActivity = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || !req.user.organization) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { 
      search, 
      type, 
      startDate, 
      endDate 
    } = req.query;

    const query: any = {
      organization: req.user.organization
    };

    // Filter by activity type
    if (type && type !== 'all') {
      query.type = type;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Search by user name or email (within the organization)
    if (search) {
      const matchingUsers = await User.find({
        organization: req.user.organization,
        $or: [
          { name: { $regex: search as string, $options: 'i' } },
          { email: { $regex: search as string, $options: 'i' } }
        ]
      }).select('_id');
      query.userId = { $in: matchingUsers.map(u => u._id) };
    }

    const activities = await Activity.find(query)
      .populate('userId', 'name email status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Activity.countDocuments(query);

    return res.json({
      activities,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching organization activity:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
