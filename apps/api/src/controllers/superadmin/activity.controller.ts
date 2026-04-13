import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import Activity from '../../models/Activity';
import Organization from '../../models/Organization';
import User from '../../models/User';

export const getAdminActivity = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { 
      search, 
      organization, 
      type, 
      startDate, 
      endDate 
    } = req.query;

    const query: any = {};

    // Filter by organization
    if (organization && organization !== 'all') {
      query.organization = organization;
    }

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

    // Search by user name or email (needs a complex query since we populate)
    // We can't use .find() on Activity directly with User filters easily without aggregation 
    // unless we first find matching Users.
    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search as string, $options: 'i' } },
          { email: { $regex: search as string, $options: 'i' } }
        ]
      }).select('_id');
      query.userId = { $in: matchingUsers.map(u => u._id) };
    }

    const activities = await Activity.find(query)
      .populate('userId', 'name email status')
      .populate('organization', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Activity.countDocuments(query);

    // Get all organizations for the filter dropdown
    const orgsForFilter = await Organization.find({ status: 'active' })
      .select('name _id')
      .sort({ name: 1 })
      .lean();

    res.json({
      activities,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      organizations: orgsForFilter
    });
  } catch (error) {
    console.error('Error fetching admin activity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

