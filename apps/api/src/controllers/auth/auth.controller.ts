import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import Activity from '../../models/Activity';
import { AuthRequest } from '../../middleware/auth';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate('organization', 'name logo');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password || '');

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
    const token = jwt.sign(
      { userId: user._id, role: user.role, organizationId: user.organization?._id },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Global Activity Logging
    await Activity.create({
      userId: user._id,
      organization: user.organization?._id,
      type: 'USER_LOGIN',
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] as string,
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
    });
    return;
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      // Global Activity Logging for Logout
      await Activity.create({
        userId: decoded.userId,
        organization: decoded.organizationId,
        type: 'USER_LOGOUT',
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'] as string,
      });
    }
  } catch (err) {
    console.error('Logout logging error:', err);
  }

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).populate('organization', 'name logo');
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};