import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

/**
 * This script explicitly creates all collections and indexes in MongoDB
 * so they appear in Compass even before any data is inserted.
 */
async function initCollections() {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME ?? 'vc';

  if (!mongoUri) {
    console.error('MONGODB_URI is missing in .env');
    process.exit(1);
  }

  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri, { dbName });
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    console.log(`Connected to database: ${dbName}`);

    // Get existing collections
    const existing = (await db.listCollections().toArray()).map((c) => c.name);
    console.log(`Existing collections: [${existing.join(', ')}]\n`);

    // ── 1) users ──────────────────────────────────────────────
    if (!existing.includes('users')) {
      await db.createCollection('users');
      console.log('✅ Created collection: users');
    } else {
      console.log('⏭️  Collection already exists: users');
    }
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('   Index: users.email (unique)');

    // ── 2) organizations ──────────────────────────────────────
    if (!existing.includes('organizations')) {
      await db.createCollection('organizations');
      console.log('✅ Created collection: organizations');
    } else {
      console.log('⏭️  Collection already exists: organizations');
    }
    await db.collection('organizations').createIndex({ slug: 1 }, { unique: true });
    console.log('   Index: organizations.slug (unique)');

    // ── 3) templates ──────────────────────────────────────────
    if (!existing.includes('templates')) {
      await db.createCollection('templates');
      console.log('✅ Created collection: templates');
    } else {
      console.log('⏭️  Collection already exists: templates');
    }
    await db.collection('templates').createIndex(
      { organization: 1, name: 1 },
      { unique: true }
    );
    console.log('   Index: templates.organization + name (compound unique)');

    // ── 4) documents ──────────────────────────────────────────
    if (!existing.includes('documents')) {
      await db.createCollection('documents');
      console.log('✅ Created collection: documents');
    } else {
      console.log('⏭️  Collection already exists: documents');
    }
    await db.collection('documents').createIndex({ uniqueId: 1 }, { unique: true });
    console.log('   Index: documents.uniqueId (unique)');

    // ── 5) activities ─────────────────────────────────────────
    if (!existing.includes('activities')) {
      await db.createCollection('activities');
      console.log('✅ Created collection: activities');
    } else {
      console.log('⏭️  Collection already exists: activities');
    }
    await db.collection('activities').createIndex({ organization: 1, createdAt: -1 });
    console.log('   Index: activities.organization + createdAt (compound)');

    // ── 6) orgotps ────────────────────────────────────────────
    if (!existing.includes('orgotps')) {
      await db.createCollection('orgotps');
      console.log('✅ Created collection: orgotps');
    } else {
      console.log('⏭️  Collection already exists: orgotps');
    }

    // ── 7) adminsessions ──────────────────────────────────────
    if (!existing.includes('adminsessions')) {
      await db.createCollection('adminsessions');
      console.log('✅ Created collection: adminsessions');
    } else {
      console.log('⏭️  Collection already exists: adminsessions');
    }
    await db.collection('adminsessions').createIndex({ userId: 1, loginTime: -1 });
    console.log('   Index: adminsessions.userId + loginTime (compound)');

    // ── 8) roles ──────────────────────────────────────────────
    if (!existing.includes('roles')) {
      await db.createCollection('roles');
      console.log('✅ Created collection: roles');
    } else {
      console.log('⏭️  Collection already exists: roles');
    }
    await db.collection('roles').createIndex({ organization: 1, name: 1 }, { unique: true });
    console.log('   Index: roles.organization + name (compound unique)');

    console.log('\n🎉 All collections and indexes initialized successfully!');
    console.log('   Refresh MongoDB Compass to see them.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

initCollections();
