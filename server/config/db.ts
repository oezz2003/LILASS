import mongoose from "mongoose";

export async function connectToDatabase(mongoUri?: string) {
  const uri = mongoUri ?? process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment");
  }

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB_NAME || undefined,
  });

  return mongoose.connection;
}

export function disconnectFromDatabase() {
  return mongoose.disconnect();
}



