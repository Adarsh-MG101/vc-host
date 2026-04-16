import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

export async function setupDatabase() {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }

  console.log('[setup-db] Initializing collections and indexes...');

  const dbName = mongoose.connection.name;
  console.log(`[setup-db] Connected to database: ${dbName}`);

  // Get existing collections
  const existingHeaders = await db.listCollections().toArray();
  const existingNames = existingHeaders.map((c) => c.name);

  const collections = [
    { name: 'users', indexes: [{ spec: { email: 1 }, options: { unique: true } }] },
    { name: 'organizations', indexes: [{ spec: { slug: 1 }, options: { unique: true } }] },
    { name: 'templates', indexes: [{ spec: { organization: 1, name: 1 }, options: { unique: true } }] },
    { name: 'documents', indexes: [{ spec: { uniqueId: 1 }, options: { unique: true } }] },
    { name: 'activities', indexes: [{ spec: { organization: 1, createdAt: -1 }, options: {} }] },
    { name: 'orgotps', indexes: [] },
    { name: 'adminsessions', indexes: [{ spec: { userId: 1, loginTime: -1 }, options: {} }] },
    { name: 'roles', indexes: [{ spec: { organization: 1, name: 1 }, options: { unique: true } }] },
  ];

  for (const col of collections) {
    if (!existingNames.includes(col.name)) {
      await db.createCollection(col.name);
      console.log(`[setup-db] ✅ Created collection: ${col.name}`);
    } else {
      console.log(`[setup-db] ⏭️  Collection already exists: ${col.name}`);
    }

    for (const index of col.indexes) {
      await db.collection(col.name).createIndex(index.spec as any, index.options as any);
      console.log(`[setup-db]    Index ensured for ${col.name}: ${JSON.stringify(index.spec)}`);
    }
  }

  // ── Seed Superadmin ──────────────────────────────────────────
  console.log('[setup-db] Checking for superadmin...');
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASS;
  const adminName = process.env.ADMIN_NAME || 'Super Admin';

  if (!adminEmail || !adminPass) {
    console.warn('[setup-db] ⚠️  ADMIN_EMAIL or ADMIN_PASS missing in .env. Skipping admin seed.');
    return;
  }

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log(`[setup-db] Superadmin exists (${adminEmail}).`);
  } else {
    console.log(`[setup-db] Creating superadmin: ${adminEmail}`);
    const hashedPassword = await bcrypt.hash(adminPass, 12);
    await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'superadmin',
      status: 'active',
    });
    console.log('[setup-db] ✅ Superadmin created successfully.');
  }

  console.log('[setup-db] Database setup complete.');
}
