import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import { connectToDatabase } from '../config/db';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();

    const adminName = process.env.ADMIN_NAME;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPass = process.env.ADMIN_PASS;

    if (!adminName || !adminEmail || !adminPass) {
      console.error('ADMIN_NAME, ADMIN_EMAIL or ADMIN_PASS is missing in .env');
      process.exit(1);
    }

    console.log(`Checking for existing superadmin: ${adminEmail}`);
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Superadmin already exists. Updating password...');
      const hashedPassword = await bcrypt.hash(adminPass, 12);
      existingAdmin.password = hashedPassword;
      existingAdmin.name = adminName;
      existingAdmin.role = 'superadmin';
      await existingAdmin.save();
      console.log('Superadmin updated successfully.');
    } else {
      console.log('Creating new superadmin...');
      const hashedPassword = await bcrypt.hash(adminPass, 12);
      
      const superadmin = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'superadmin',
        status: 'active',
      });

      await superadmin.save();
      console.log('Superadmin created successfully.');
    }

    console.log('Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
