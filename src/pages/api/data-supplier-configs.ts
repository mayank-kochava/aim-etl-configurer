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

    const client = await clientPromise;
    const db = client.db("aim_test");

    const collection = db.collection("data_supplier_configs");

    const results = await collection
      .find({ Deleted: { $ne: true } })
      .project({
        ConnectionName: 1,
        Active: 1,
        ConnectorType: 1,
        IdAsString: 1,
        AdvertiserName: 1,
        _id: 0,
      })
      .toArray();

    return res.status(200).json(results);
  } catch (err: any) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
