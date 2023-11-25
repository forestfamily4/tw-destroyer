import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.DATABASE_URI??"");
const db = client.db("twBot");

export async function connectDb() {
  await client.connect();
}

export const subscriptionCollection = db.collection<{
  channelId: string;
  userId: string;
  twitterUserId: string;
}>("openaikey");
