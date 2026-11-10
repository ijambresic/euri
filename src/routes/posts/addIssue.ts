import express from "express";
import { asyncHandler } from "../../asyncHandler";
import { ObjectId } from "mongodb";
export const router = express.Router();

import { data } from "../../app";
import { collections } from "../../db";

router.post("/", asyncHandler(async (req, res) => {
  const { coinId, name } = req.body;
  const price = parseInt(req.body.price);
  const amount = parseInt(req.body.amount);

  const coin = typeof coinId === "string" ? data.coinMap.get(coinId) : undefined;

  if (!coin) {
    return res.status(400).send("Unknown coin!");
  }
  if (typeof name !== "string" || isNaN(price) || isNaN(amount)) {
    return res.status(400).send("Issue needs a name, a price and an amount!");
  }

  let issueId: ObjectId;
  try {
    issueId = (await collections.issues().insertOne({ name, price, amount, pending: 0 }))
      .insertedId;
  } catch (err) {
    console.log(err);
    return res.status(500).send("Failed to add issue!");
  }

  try {
    await collections
      .coins()
      .updateOne({ _id: new ObjectId(coinId) }, { $push: { issueIds: issueId } });
  } catch (err) {
    console.log(err);
    return res.status(501).send("Added issue but didn't add its id to coin issue id list!");
  }

  data.issueMap.set(issueId.toString(), {
    _id: issueId,
    name,
    price: String(price),
    amount: String(amount),
    coinId,
    pending: 0,
  });
  coin.issueIds.push(issueId);

  console.log(`Added issue to DB: ${name} (qty: ${amount})`);

  return res.json({ newId: issueId });
}));
