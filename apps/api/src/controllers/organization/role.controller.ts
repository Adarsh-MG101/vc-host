import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import Role from '../../models/Role';

// GET /api/organization/roles — list all roles for user's organization
export const getRoles = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.organization;
    if (!orgId) return res.status(403).json({ message: 'No organization linked' });

    const roles = await Role.find({ organization: orgId })
      .populate('createdBy', 'name email')
      .sort({ isSystem: -1, createdAt: 1 });

    return res.json(roles);
  } catch (error) {
    console.error('[Roles] Get error:', error);
    return res.status(500).json({ message: 'Failed to fetch roles' });
  }
};

// POST /api/organization/roles — create a new custom role
export const createRole = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.organization;
    if (!orgId) return res.status(403).json({ message: 'No organization linked' });

    const { name, permissions } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Role name is required' });
    }

    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({ message: 'At least one permission is required' });
    }

    // Check if role name already exists in this org
    const existing = await Role.findOne({ organization: orgId, name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'A role with this name already exists' });
    }

    const role = new Role({
      organization: orgId,
      name: name.trim(),
      permissions,
      isSystem: false,
      createdBy: req.user!._id,
    });

    await role.save();
    return res.status(201).json(role);
  } catch (error) {
    console.error('[Roles] Create error:', error);
    return res.status(500).json({ message: 'Failed to create role' });
  }
};

// PUT /api/organization/roles/:roleId — update a custom role
export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.organization;
    if (!orgId) return res.status(403).json({ message: 'No organization linked' });

    const { roleId } = req.params;
    const { name, permissions } = req.body;

    const role = await Role.findOne({ _id: roleId, organization: orgId });
    if (!role) return res.status(404).json({ message: 'Role not found' });

    if (role.isSystem) {
      return res.status(403).json({ message: 'System roles cannot be modified' });
    }

    if (name && name.trim()) {
      // Check uniqueness if name is changing
      if (name.trim() !== role.name) {
        const duplicate = await Role.findOne({ organization: orgId, name: name.trim() });
        if (duplicate) {
          return res.status(400).json({ message: 'A role with this name already exists' });
        }
      }
      role.name = name.trim();
    }

    if (permissions && Array.isArray(permissions)) {
      role.permissions = permissions;
    }

    await role.save();
    return res.json(role);
  } catch (error) {
    console.error('[Roles] Update error:', error);
    return res.status(500).json({ message: 'Failed to update role' });
  }
};

// DELETE /api/organization/roles/:roleId — delete a custom role
export const deleteRole = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.organization;
    if (!orgId) return res.status(403).json({ message: 'No organization linked' });

    const { roleId } = req.params;

    const role = await Role.findOne({ _id: roleId, organization: orgId });
    if (!role) return res.status(404).json({ message: 'Role not found' });

    if (role.isSystem) {
      return res.status(403).json({ message: 'System roles cannot be deleted' });
    }

    await Role.findByIdAndDelete(roleId);
    return res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('[Roles] Delete error:', error);
    return res.status(500).json({ message: 'Failed to delete role' });
  }
};
