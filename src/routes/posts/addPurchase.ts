import express from "express";
import { asyncHandler } from "../../asyncHandler";
import { ObjectId } from "mongodb";
import { data } from "../../app";
import { collections } from "../../db";
import { isAdmin } from "../auth";

export const router = express.Router();

const savePurchase = asyncHandler(async (req, res) => {
  const { issueId } = req.params;
  if (!data.issueMap.has(issueId)) {
    return res.status(404).json({ message: "Issue not found." });
  }

  const { seller, quantity, unitPrice, date } = req.body ?? {};
  const id = req.method === "PUT" ? req.params.purchaseId : req.body?.id;
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
    const history = collections.issuePurchases();
    const _id = new ObjectId(issueId);
    if (req.method === "PUT") {
      const result = await history.updateOne(
        { _id, "purchases.id": id },
        { $set: { "purchases.$[purchase]": purchase } },
        { arrayFilters: [{ "purchase.id": id }] }
      );
      if (!result.matchedCount) {
        return res.status(404).json({ message: "Purchase not found. Refresh the history and try again." });
      }
    } else {
      await history.updateOne(
        { _id },
        { $setOnInsert: { purchases: [] } },
        { upsert: true }
      );
      // Deduplicate by ID so retrying an old submission also preserves later edits.
      await history.updateOne(
        { _id, "purchases.id": { $ne: id } },
        { $push: { purchases: purchase } }
      );
    }
    return res.status(204).end();
  } catch (error) {
    console.error("Failed to save purchase.", error);
    return res.status(500).json({ message: "Could not save the purchase. Try again." });
  }
});

router.post("/issues/:issueId/purchases", isAdmin, savePurchase);
router.put("/issues/:issueId/purchases/:purchaseId", isAdmin, savePurchase);

router.delete("/issues/:issueId/purchases/:purchaseId", isAdmin, asyncHandler(async (req, res) => {
  const { issueId, purchaseId } = req.params;
  if (!data.issueMap.has(issueId)) {
    return res.status(404).json({ message: "Issue not found." });
  }
  if (!/^[a-f0-9]{24}$/.test(purchaseId)) {
    return res.status(400).json({ message: "Invalid purchase ID." });
  }

  try {
    await collections.issuePurchases().updateOne(
      { _id: new ObjectId(issueId) },
      { $pull: { purchases: { id: purchaseId } } }
    );
    return res.status(204).end();
  } catch (error) {
    console.error("Failed to delete purchase.", error);
    return res.status(500).json({ message: "Could not delete the purchase. Try again." });
  }
}));
