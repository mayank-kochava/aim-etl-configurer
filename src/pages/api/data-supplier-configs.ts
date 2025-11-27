// pages/api/data-supplier-configs.ts
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

    const { advertiserId } = req.query;

    if (!advertiserId || typeof advertiserId !== "string") {
      return res.status(400).json({ error: "advertiserId is required" });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME as string);

    const collection = db.collection("data_supplier_configs");

    console.log(
      "Fetching data supplier configs for advertiserId:",
      advertiserId
    );

    const results = await collection
      .find({
        Deleted: { $ne: true },
        AdvertiserId: advertiserId,
      })
      .project({
        ConnectionName: 1,
        Active: 1,
        ConnectorType: 1,
        IdAsString: 1,
        AdvertiserName: 1,
        _id: 0,
      })
      .toArray();

    console.log("Found data supplier configs:", results.length);

    return res.status(200).json(results);
  } catch (err: any) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
