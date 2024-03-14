import express from "express";
export const router = express.Router();

import { data } from "../../app";
import { CartItem, IssueOnClient } from "../../../types";

router.post("/", (req, res) => {
  const local = req.body as { [issueId: string]: number }; // zapravo može biti ne broj, ali ga pretovrim u broj

  // go thru every value in local and apply a Number() to it, also check if something is not a number, if so, respond with a 400
  for (const [key, value] of Object.entries(local)) {
    const amount = Number(value);

    if (isNaN(amount)) {
      return res.status(400).send("Invalid amount");
    }

    if (amount < 0) {
      return res.status(400).send("Invalid amount");
    }

    local[key] = amount;
  }

  console.log(local);

  let price = 0;
  const cart: { [issueId: string]: CartItem } = {};

  for (const [issueId, amount] of Object.entries(local)) {
    const issueRaw = data.issueMap.get(issueId);

    if (!issueRaw) {
      return res.status(400).send("Invalid issue");
    }

    const issue: IssueOnClient = {
      id: issueRaw._id.toString(),
      name: issueRaw.name,
      price: issueRaw.price,
      limit: Math.min(10, Number(issueRaw.amount) - issueRaw.pending),
    };

    const coin = data.coinMap.get(issueRaw.coinId);
    if (!coin) {
      return res
        .status(400)
        .send("Couldnt find coin from the coinId provided in the issue" + issueId);
    }

    if (amount > issue.limit) local[issueId] = issue.limit;
    if (amount === 0) continue;

    cart[issueId] = {
      coin,
      issue,
      amount,
      total: amount * Number(issue.price),
    };

    price += amount * Number(issue.price);
  }

  return res.status(200).send({ list: cart, price });
});
