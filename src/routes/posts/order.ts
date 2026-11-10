import express from "express";
import { asyncHandler } from "../../asyncHandler";
import { ObjectId } from "mongodb";
export const router = express.Router();

import { data } from "../../app";
import { collections } from "../../db";

// Function to format a date into a specific string format
function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// POST route handler for adding an order. It validates the order, updates the pending amount for each issue in the order, and inserts the order into the database.
router.post("/add", asyncHandler(async (req, res) => {
  const rawOrder: unknown = req.body?.order;

  // If the order is missing or empty, return an error
  if (
    typeof rawOrder !== "object" ||
    rawOrder === null ||
    Object.keys(rawOrder).length === 0
  ) {
    return res.status(502).json({ error: true, message: `Empty order!` });
  }

  const issues = collections.issues();
  const orders = collections.orders();

  // The order as it will be stored: issue id -> whole, positive amount.
  // Filled in up front so the keys keep the order the cart sent them in.
  const order: { [issueId: string]: number } = {};
  for (const [issueId, rawAmount] of Object.entries(rawOrder)) {
    order[issueId] = Number(rawAmount);
  }
  const invalid: string[] = [];

  // Validate the order: check if each issue exists and has enough amount available
  await Promise.all(
    Object.entries(order).map(async ([issueId, amount]) => {
      if (
        !Number.isInteger(amount) ||
        amount <= 0 ||
        !ObjectId.isValid(issueId) ||
        !data.issueMap.has(issueId)
      ) {
        invalid.push(issueId);
        return;
      }

      try {
        const issue = await issues.findOne({ _id: new ObjectId(issueId) });
        if (!issue || issue.amount - issue.pending < amount) invalid.push(issueId);
      } catch (err) {
        console.error(err);
        invalid.push(issueId);
      }
    }),
  );

  // If there are any invalid issues, return an error
  if (invalid.length > 0) {
    return res.status(501).json({ error: true, issueIds: invalid });
  }

  // Update the pending amount for each issue in the order and calculate the total price
  let total = 0;
  try {
    for (const [issueId, amount] of Object.entries(order)) {
      await issues.updateOne({ _id: new ObjectId(issueId) }, { $inc: { pending: amount } });

      // Keep the cache in step with the database, like accept/decline do.
      const cached = data.issueMap.get(issueId);
      if (cached) cached.pending += amount;

      total += Number(cached?.price) * amount;
    }

    // Format the current date and time
    const date = new Date();
    const name = formatDate(date);

    // Insert the order into the database
    await orders.insertOne({ name, date, status: "pending", order, total });

    console.log(
      `Order succesfully sent to the server. Order summary: ${date.toLocaleString(
        "en-en",
      )} - ${total}€ - ${Object.keys(order).length} issues`,
    );
    return res.json({ error: false, message: "Order sent successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: true, message: "Error while inserting order into database" });
  }
}));
