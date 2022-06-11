import mongoose from "mongoose";
//@ts-ignore
import { MongoMemoryServer } from "mongodb-memory-server";

export async function initializeMongoServer() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: "verifyMASTER" });
}
