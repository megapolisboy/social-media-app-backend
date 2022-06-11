import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export async function initializeMongoServer() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: "verifyMASTER" });
}
