import express from "express";
import { MongoClient, ObjectId } from "mongodb";
export const router = express.Router();

import { data, client } from "../../app";

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
router.post("/add", async (req, res) => {
  // Extract the order from the request body
  const { order } = req.body;

  // Get the database and collections
  const db = client.db("2Euro");
  const orders = db.collection("Orders");
  const issues = db.collection("Issues");

  // Initialize total price, invalid issues array, and promises array
  let total = 0;
  const invalid = [];
  const promises = [];

  let cnt = 0;

  // Validate the order: check if each issue has enough amount available
  for (let [issueId, amount] of Object.entries(order)) {
    const localIssueId = issueId;
    const localAmount = amount;

    cnt++;

    promises.push(
      issues
        .findOne({ _id: new ObjectId(issueId) })
        .then((issue) => {
          if (issue.amount - issue.pending < localAmount) invalid.push(localIssueId);
        })
        .catch((err) => {
          invalid.push(localIssueId);
        })
    );
  }

  // If the order is empty, return an error
  if (cnt === 0) {
    return res.status(502).json({ error: true, message: `Empty order!` });
  }

  // Wait for all promises to resolve
  await Promise.all(promises);

  // If there are any invalid issues, return an error
  if (invalid.length > 0) {
    return res.status(501).json({ error: true, issueIds: invalid });
  }

  // Update the pending amount for each issue in the order and calculate the total price
  for (let [issueId, amount] of Object.entries(order)) {
    await issues.updateOne(
      { _id: new ObjectId(issueId) },
      { $inc: { pending: parseInt(amount) } }
    );

    total += Number(data.issueMap.get(issueId).price) * amount;
  }

  // Format the current date and time
  const date = new Date();
  const name = formatDate(date);

  // Insert the order into the database
  orders
    .insertOne({
      name,
      date,
      status: "pending",
      order,
      total,
    })
    .then((orderItem) => {
      // If the order was inserted successfully, send a success response
      console.log(
        `Order succesfully sent to the server. Order summary: ${date.toLocaleString(
          "en-en"
        )} - ${total}€ - ${Object.keys(order).length} issues`
      );
      return res.json({ error: false, message: "Order sent successfully" });
    })
    .catch((err) => {
      // If there was an error inserting the order, send an error response
      console.log(err);
      return res
        .status(500)
        .json({ error: true, message: "Error while inserting order into database" });
    });
});
