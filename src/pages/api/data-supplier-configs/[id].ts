// pages/api/data-supplier-configs/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME as string);
    const collection = db.collection("data_supplier_configs");

    // GET - Fetch single supplier
    if (req.method === "GET") {
      const result = await collection.findOne({
        IdAsString: id,
        Deleted: { $ne: true },
      });

      if (!result) {
        return res.status(404).json({ error: "Supplier not found" });
      }

      return res.status(200).json(result);
    }

    // PUT - Update supplier
    if (req.method === "PUT") {
      const updateData = { ...req.body };
      delete updateData._id; // Remove _id if present

      const result = await collection.updateOne(
        { IdAsString: id, Deleted: { $ne: true } },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Supplier not found" });
      }

      return res
        .status(200)
        .json({ success: true, updated: result.modifiedCount });
    }

    // DELETE - Soft delete supplier
    if (req.method === "DELETE") {
      const result = await collection.updateOne(
        { IdAsString: id, Deleted: { $ne: true } },
        { $set: { Deleted: true } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Supplier not found" });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
