import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const client = await clientPromise;
    const db = client.db("aim_test");

    const collection = db.collection("advertisers");

    const results = await collection
      .find({ Deleted: { $ne: true }, Active: true })
      .project({
        IdAsString: 1,
        DisplayName: 1,
        AdvertiserName: 1,
        Regions: 1,
        _id: 0,
      })
      .sort({ DisplayName: 1 })
      .toArray();

    return res.status(200).json(results);
  } catch (err: any) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
