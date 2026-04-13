import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../../models/User';
import Activity from '../../models/Activity';
import { AuthRequest } from '../../middleware/auth';

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name;
    await user.save();

    // Log Activity
    await Activity.create({
      userId: user._id,
      organization: user.organization,
      type: 'PROFILE_UPDATED',
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] as string,
    });

    return res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password || '');
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    // Log Activity
    await Activity.create({
      userId: user._id,
      organization: user.organization,
      type: 'PASSWORD_CHANGED',
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] as string,
    });

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Failed to change password' });
  }
};