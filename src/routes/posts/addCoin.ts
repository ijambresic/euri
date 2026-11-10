import express from "express";
import { asyncHandler } from "../../asyncHandler";
import { ObjectId } from "mongodb";
export const router = express.Router();

import { data } from "../../app";
import { collections } from "../../db";

router.post("/", asyncHandler(async (req, res) => {
  const { countryId, yearId, name, src } = req.body;

  const country = typeof countryId === "string" ? data.countryMap.get(countryId) : undefined;
  const year = typeof yearId === "string" ? data.yearMap.get(yearId) : undefined;

  if (!country || !year) {
    return res.status(400).send("Unknown country or year!");
  }
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).send("Coin name is required!");
  }

  const code = country.TLA + (country.coinIds.length + 1);
  const coin = {
    code,
    name,
    src,
    countryId: new ObjectId(countryId),
    yearId: new ObjectId(yearId),
    issueIds: [],
  };

  let coinId: ObjectId;
  try {
    coinId = (await collections.coins().insertOne({ ...coin })).insertedId;
  } catch (err) {
    console.log(err);
    return res.status(500).send("Failed to add coin!");
  }

  try {
    await Promise.all([
      collections
        .countries()
        .updateOne({ _id: coin.countryId }, { $push: { coinIds: coinId } }),
      collections.years().updateOne({ _id: coin.yearId }, { $push: { coinIds: coinId } }),
    ]);
  } catch (err) {
    console.log(err);

    return res
      .status(501)
      .send("Added coin but didn't add its id to year and/or country coin id list!");
  }

  data.coinMap.set(coinId.toString(), { _id: coinId, ...coin });
  country.coinIds.push(coinId);
  year.coinIds.push(coinId);

  console.log(`Added coin to DB: ${name}`);

  return res.sendStatus(200);
}));
