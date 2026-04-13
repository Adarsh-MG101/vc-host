import mongoose from 'mongoose';

export async function connectToDatabase(): Promise<typeof mongoose> {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME ?? 'skrapo';

  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing. Add it in apps/api/.env');
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      dbName: dbName,
    });
    return connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw error;
  }
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function closeDatabaseConnection(): Promise<void> {
  await mongoose.connection.close();
}
