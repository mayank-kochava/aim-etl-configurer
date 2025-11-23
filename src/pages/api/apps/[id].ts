import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise;
    const db = client.db("aim_test");
    const collection = db.collection("apps");

    if (req.method === "GET") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const doc = await collection.findOne({ IdAsString: id });

      if (!doc) {
        return res.status(404).json({ message: "Not found" });
      }

      return res.status(200).json(doc);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: any) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
