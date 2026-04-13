import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Organization from '../../models/Organization';
import User from '../../models/User';
import { sendCredentialsEmail } from '../../services/email.service';
import Template from '../../models/Template';
import Document from '../../models/Document';
export const createOrganization = async (req: Request, res: Response) => {
  try {
    console.log('[CreateOrg] Start:', req.body);
    const { 
      orgName, 
      orgSlug, 
      ownerName, 
      ownerEmail, 
      ownerPassword,
      logo
    } = req.body;

    // Basic validation
    if (!orgName || !orgSlug || !ownerName || !ownerEmail || !ownerPassword) {
      console.log('[CreateOrg] Missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if organization already exists
    console.log('[CreateOrg] Checking existing org...');
    const existingOrg = await Organization.findOne({ slug: orgSlug.toLowerCase() });
    if (existingOrg) {
      console.log('[CreateOrg] Org already exists:', orgSlug);
      return res.status(400).json({ message: 'Organization with this slug already exists' });
    }

    // Check if user already exists
    console.log('[CreateOrg] Checking existing user...');
    const existingUser = await User.findOne({ email: ownerEmail.toLowerCase() });
    if (existingUser) {
      console.log('[CreateOrg] User already exists:', ownerEmail);
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    console.log('[CreateOrg] Hashing password...');
    const hashedPassword = await bcrypt.hash(ownerPassword, 12);

    // 1. Create the Owner User
    console.log('[CreateOrg] Creating owner user...');
    const ownerUser = new User({
      name: ownerName,
      email: ownerEmail.toLowerCase(),
      password: hashedPassword,
      role: 'user', 
      orgRole: 'owner', 
      status: 'active',
    });

    await ownerUser.save();
    console.log('[CreateOrg] Owner user saved:', ownerUser._id);

    // 2. Create the Organization
    console.log('[CreateOrg] Creating organization...');
    const organization = new Organization({
      name: orgName,
      slug: orgSlug.toLowerCase(),
      owner: ownerUser._id,
      status: 'active',
      ...(logo && { logo })
    });

    await organization.save();
    console.log('[CreateOrg] Organization saved:', organization._id);

    // 3. Link User back to Organization
    console.log('[CreateOrg] Linking user to org...');
    ownerUser.organization = organization._id as any;
    await ownerUser.save();
    console.log('[CreateOrg] Link saved');

    // Trigger email notification (non-blocking)
    sendCredentialsEmail(ownerEmail, ownerName, ownerPassword, orgName)
      .then(sent => {
        if (!sent) console.error('[Email] Failed to notify owner of their credentials.');
      })
      .catch(err => console.error('[Email] Error in dispatching credentials:', err));

    console.log('[CreateOrg] Success');
    res.status(201).json({
      message: 'Organization and owner created successfully',
      organization,
      owner: {
        id: ownerUser._id,
        name: ownerUser.name,
        email: ownerUser.email,
        orgRole: ownerUser.orgRole,
      }
    });
    return;
  } catch (error) {
    console.error('[CreateOrg] Error:', error);
    return res.status(500).json({ message: 'Failed to create organization' });
  }
};

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const organizations = await Organization.find()
      .populate('owner', 'name email status')
      .sort({ createdAt: -1 })
      .lean();
      
    // Fetch aggregated statistics and member lists for each organization
    const orgsWithStats = await Promise.all(
      organizations.map(async (org) => {
        const [membersList, templatesCount, certificatesCount] = await Promise.all([
          User.find({ organization: org._id }).select('name email orgRole status').lean(),
          Template.countDocuments({ organization: org._id }),
          Document.countDocuments({ organization: org._id }),
        ]);

        return {
          ...org,
          membersList,
          stats: {
            members: membersList.length,
            templates: templatesCount,
            certificates: certificatesCount,
          }
        };
      })
    );
      
    return res.json(orgsWithStats);
  } catch (error) {
    console.error('Failed to fetch organizations with stats:', error);
    return res.status(500).json({ message: 'Failed to fetch organizations' });
  }
};

export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, status } = req.body;

    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (name) organization.name = name;
    if (slug) organization.slug = slug.toLowerCase();
    if (status) organization.status = status;

    await organization.save();
    return res.json(organization);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update organization' });
  }
};

export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Delete the organization
    await Organization.findByIdAndDelete(id);
    
    // Optionally delete the user too (if requested in flow)
    // await User.findByIdAndDelete(organization.owner);

    return res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete organization' });
  }
};