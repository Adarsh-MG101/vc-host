import dotenv from 'dotenv';
import { app } from './app';
import { closeDatabaseConnection, connectToDatabase } from './config/db';

dotenv.config({ path: 'apps/api/.env' });
dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3333;

async function bootstrap() {
  await connectToDatabase();
  console.log(`[db] connected successfully`);

  const server = app.listen(port, host, () => {
    console.log(`[ready] http://${host}:${port}`);
  });

  const shutdown = async () => {
    await closeDatabaseConnection();
    console.log('[db] connection closed');
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[startup-error] ${message}`);
  process.exit(1);
});
