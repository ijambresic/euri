import express from "express";
import { ObjectId } from "mongodb";
import { client, data } from "../../app";
import type { IssuePurchaseHistory } from "../../../types";
import { isAdmin } from "../auth";

export const router = express.Router();

router.post("/issues/:issueId/purchases", isAdmin, async (req, res) => {
  const { issueId } = req.params;
  if (!data.issueMap.has(issueId)) {
    return res.status(404).json({ message: "Issue not found." });
  }

  const { id, seller, quantity, unitPrice, date } = req.body ?? {};
  if (typeof id !== "string" || !/^[a-f0-9]{24}$/.test(id)) {
    return res.status(400).json({ message: "Invalid purchase ID." });
  }
  if (typeof seller !== "string" || !seller.trim() || seller.trim().length > 200) {
    return res.status(400).json({ message: "Enter a seller name of up to 200 characters." });
  }
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be a positive whole number." });
  }
  if (typeof unitPrice !== "string" || !/^\d+(?:[.,]\d{1,2})?$/.test(unitPrice)) {
    return res.status(400).json({ message: "Enter a price with up to two decimal places." });
  }
  const [euros, cents = ""] = unitPrice.split(/[.,]/);
  const unitPriceCents = Number(euros + cents.padEnd(2, "0"));
  if (!Number.isSafeInteger(unitPriceCents)) {
    return res.status(400).json({ message: "Price is too large." });
  }
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: "Enter a valid purchase date." });
  }
  const purchaseDate = new Date(date);
  if (Number.isNaN(purchaseDate.getTime()) || purchaseDate.toISOString().slice(0, 10) !== date) {
    return res.status(400).json({ message: "Enter a valid purchase date." });
  }

  try {
    const purchase = { id, seller: seller.trim(), quantity, unitPriceCents, date };
    // The same submission can be retried without adding another entry.
    await client.db("2Euro").collection<IssuePurchaseHistory>("IssuePurchases").updateOne(
      { _id: new ObjectId(issueId) },
      { $addToSet: { purchases: purchase } },
      { upsert: true }
    );
    return res.status(204).end();
  } catch (error) {
    console.error("Failed to save purchase.", error);
    return res.status(500).json({ message: "Could not save the purchase. Try again." });
  }
});
