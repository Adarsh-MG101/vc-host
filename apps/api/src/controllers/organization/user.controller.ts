import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../../middleware/auth';
import User from '../../models/User';
import Organization from '../../models/Organization';
import { sendCredentialsEmail } from '../../services/email.service';

// GET /api/organization/users — list all users in the organization
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.organization;
    if (!orgId) return res.status(403).json({ message: 'No organization linked' });

    const users = await User.find({ organization: orgId })
      .select('-password')
      .populate('customRole', 'name')
      .sort({ orgRole: 1, createdAt: -1 });

    return res.json(users);
  } catch (error) {
    console.error('[Users] Get error:', error);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// POST /api/organization/users — create a new user in the organization
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.organization;
    if (!orgId) return res.status(403).json({ message: 'No organization linked' });

    // Only owner and admin can create users
    const callerRole = req.user?.orgRole;
    if (callerRole !== 'owner' && callerRole !== 'admin') {
      return res.status(403).json({ message: 'Only owners and admins can create users' });
    }

    const { name, email, password, orgRole, customRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Validate orgRole
    const validRoles = ['admin', 'member'];
    const assignedRole = validRoles.includes(orgRole) ? orgRole : 'member';

    // Prevent non-owners from creating admins
    if (assignedRole === 'admin' && callerRole !== 'owner') {
      return res.status(403).json({ message: 'Only owners can create admin users' });
    }

    // Check if user email already exists globally
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user',
      orgRole: assignedRole,
      customRole: customRole || undefined,
      organization: orgId,
      status: 'active',
    });

    await newUser.save();
    
    // Send welcome email with credentials
    try {
      const org = await Organization.findById(orgId);
      if (org) {
        await sendCredentialsEmail(
          newUser.email,
          newUser.name,
          password, // plain password from req.body
          org.name
        );
      }
    } catch (emailError) {
      console.error('[Users] Failed to send welcome email:', emailError);
      // We don't fail the request because the user was created successfully
    }

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json(userResponse);
  } catch (error) {
    console.error('[Users] Create error:', error);
    return res.status(500).json({ message: 'Failed to create user' });
  }
};

// PUT /api/organization/users/:userId/role — change a user's orgRole
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.organization;
    if (!orgId) return res.status(403).json({ message: 'No organization linked' });

    const callerRole = req.user?.orgRole;
    if (callerRole !== 'owner' && callerRole !== 'admin') {
      return res.status(403).json({ message: 'Only owners and admins can change roles' });
    }

    const { userId } = req.params;
    const { orgRole, customRole } = req.body;

    const validRoles = ['admin', 'member'];
    if (!validRoles.includes(orgRole)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin or member' });
    }

    // Prevent non-owners from promoting to admin
    if (orgRole === 'admin' && callerRole !== 'owner') {
      return res.status(403).json({ message: 'Only owners can promote users to admin' });
    }

    const user = await User.findOne({ _id: userId, organization: orgId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Can't change owner's role
    if (user.orgRole === 'owner') {
      return res.status(403).json({ message: 'Cannot change the owner role' });
    }

    if (orgRole) user.orgRole = orgRole;
    if (customRole !== undefined) user.customRole = customRole || undefined;
    
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.json(userResponse);
  } catch (error) {
    console.error('[Users] UpdateRole error:', error);
    return res.status(500).json({ message: 'Failed to update user role' });
  }
};

// PUT /api/organization/users/:userId/status — activate/deactivate a user
export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.organization;
    if (!orgId) return res.status(403).json({ message: 'No organization linked' });

    const callerRole = req.user?.orgRole;
    if (callerRole !== 'owner' && callerRole !== 'admin') {
      return res.status(403).json({ message: 'Only owners and admins can change user status' });
    }

    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be active or inactive' });
    }

    const user = await User.findOne({ _id: userId, organization: orgId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Can't deactivate owner
    if (user.orgRole === 'owner') {
      return res.status(403).json({ message: 'Cannot change the owner status' });
    }

    // Admin can't deactivate other admins
    if (callerRole === 'admin' && user.orgRole === 'admin') {
      return res.status(403).json({ message: 'Admins cannot change status of other admins' });
    }

    user.status = status;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.json(userResponse);
  } catch (error) {
    console.error('[Users] UpdateStatus error:', error);
    return res.status(500).json({ message: 'Failed to update user status' });
  }
};

// DELETE /api/organization/users/:userId — remove a user from the organization
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.organization;
    if (!orgId) return res.status(403).json({ message: 'No organization linked' });

    const callerRole = req.user?.orgRole;
    if (callerRole !== 'owner' && callerRole !== 'admin') {
      return res.status(403).json({ message: 'Only owners and admins can delete users' });
    }

    const { userId } = req.params;

    const user = await User.findOne({ _id: userId, organization: orgId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Can't delete owner
    if (user.orgRole === 'owner') {
      return res.status(403).json({ message: 'Cannot delete the organization owner' });
    }

    // Admin can't delete other admins
    if (callerRole === 'admin' && user.orgRole === 'admin') {
      return res.status(403).json({ message: 'Admins cannot delete other admins' });
    }

    await User.findByIdAndDelete(userId);

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('[Users] Delete error:', error);
    return res.status(500).json({ message: 'Failed to delete user' });
  }
};
