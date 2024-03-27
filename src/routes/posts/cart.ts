import express from "express";
export const router = express.Router();

import { data } from "../../app";
import type { CartItem, IssueOnClient } from "../../../types";

router.post("/", (req, res) => {
  // Parse the request body as an object with string keys and numeric values
  const local = req.body as { [issueId: string]: number };

  // Validate the input: convert values to numbers and check if they are valid
  for (const [key, value] of Object.entries(local)) {
    const amount = Number(value);

    if (isNaN(amount) || amount < 0) {
      return res.status(400).send("Invalid amount");
    }

    local[key] = amount;
  }

  // Initialize the cart and total price
  let price = 0;
  const cart: { [issueId: string]: CartItem } = {};

  // Populate the cart with items from the input
  for (const [issueId, amount] of Object.entries(local)) {
    // Get the issue from the data map
    const issueRaw = data.issueMap.get(issueId);

    // If the issue doesn't exist, return an error
    if (!issueRaw) {
      return res.status(400).send("Invalid issue");
    }

    // Create an issue object for the client
    const issue: IssueOnClient = {
      id: issueRaw._id.toString(),
      name: issueRaw.name,
      price: issueRaw.price,
      limit: Math.min(10, Number(issueRaw.amount) - issueRaw.pending),
    };

    // Get the coin associated with the issue
    const coin = data.coinMap.get(issueRaw.coinId);
    if (!coin) {
      return res
        .status(400)
        .send("Couldn't find coin from the coinId provided in the issue" + issueId);
    }

    // If the amount exceeds the issue limit, adjust it
    if (amount > issue.limit) local[issueId] = issue.limit;
    if (amount === 0) continue;

    // Add the item to the cart and update the total price
    cart[issueId] = {
      coin,
      issue,
      amount,
      total: amount * Number(issue.price),
    };

    price += amount * Number(issue.price);
  }

  console.log(`Sent cart with ${Object.keys(cart).length} items back to client`);

  // Send the cart and total price as the response
  return res.json({ list: cart, price });
});
