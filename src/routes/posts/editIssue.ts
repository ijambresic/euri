import express from "express";
import { asyncHandler } from "../../asyncHandler";
export const router = express.Router();

import { data } from "../../app";
import { collections } from "../../db";

router.post("/", asyncHandler(async (req, res) => {
  const { issueId, name } = req.body;
  const price = parseInt(req.body.price);
  const amount = parseInt(req.body.amount);

  const issue = typeof issueId === "string" ? data.issueMap.get(issueId) : undefined;

  if (!issue) {
    return res.status(400).send("Unknown issue!");
  }
  if (typeof name !== "string" || isNaN(price) || isNaN(amount)) {
    return res.status(400).send("Issue needs a name, a price and an amount!");
  }

  try {
    await collections
      .issues()
      .updateOne({ _id: issue._id }, { $set: { name, price, amount } });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Failed to edit issue!");
  }

  issue.name = name;
  issue.price = String(price);
  issue.amount = String(amount);

  console.log(`Edited issue in DB: ${name} (qty: ${amount})`);

  return res.sendStatus(200);
}));
