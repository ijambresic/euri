import express from "express";
import { MongoClient, ObjectId } from "mongodb";
export const router = express.Router();

import { data, client } from "../../app";

router.post("/", (req, res) => {
  const { issueId, name, price, amount } = req.body;

  const db = client.db("2Euro");
  const issues = db.collection("Issues");

  issues
    .updateOne(
      { _id: new ObjectId(issueId) },
      {
        $set: {
          name,
          price: parseInt(price),
          amount: parseInt(amount),
        },
      }
    )
    .then((issue) => {
      const coinId = data.issueMap.get(issueId).coinId;
      const pending = data.issueMap.get(issueId).pending;
      data.issueMap.set(issueId, {
        _id: new ObjectId(issueId),
        name,
        price,
        amount,
        coinId,
        pending,
      });
      return res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send("Failed to add issue!");
    });
});
