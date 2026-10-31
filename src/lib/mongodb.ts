import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let lastMongoError: string | null = null;

export function getLastMongoError(): string | null {
  return lastMongoError;
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!isMongoConfigured()) {
    lastMongoError = 'MONGODB_URI environment variable is not defined or empty';
    return null;
  }

  try {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      global._mongoClientPromise = client.connect();
    }
    return await global._mongoClientPromise;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    lastMongoError = msg;
    console.warn('MongoDB connection error:', msg);
    // Reset promise so next invocation can retry
    global._mongoClientPromise = undefined;
    return null;
  }
}

export async function getDb(dbName = 'mindstrip'): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(dbName);
}
