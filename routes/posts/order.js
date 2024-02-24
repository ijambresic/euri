const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();

const { data, client } = require("../../app");

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

router.post("/add", async (req, res) => {
  const { order } = req.body;

  const db = client.db("2Euro");
  const orders = db.collection("Orders");
  const issues = db.collection("Issues");

  let total = 0;
  const invalid = [];
  const promises = [];

  let cnt = 0;

  for (let [issueId, amount] of Object.entries(order)) {
    cnt++;
    promises.push(
      issues.findOne({ _id: new ObjectId(issueId) })
      .then(issue => {
        if (issue.amount-issue.pending < amount) invalid.push(issueId);
      }).catch(err => {
        invalid.push(issueId);
      })
    );
  }

  if (cnt === 0) {
    res
        .status(502)
        .json({ error: true, message: `Empty order!` });
  }

  await Promise.all(promises);
  if (invalid.length > 0) {
    res
        .status(501)
        .json({ error: true, issueIds: invalid });
  }

  for (let [issueId, amount] of Object.entries(order)) {
    issues.updateOne({ _id: new ObjectId(issueId) }, { $inc: { pending: amount } });
    total += data.issueMap.get(issueId).price * amount;
  }

  const date = new Date();
  const name = formatDate(date);

  orders
    .insertOne({
      name,
      date,
      status: "pending",
      order,
      total,
    })
    .then((orderItem) => {
      res.json({ error: false, message: "Order sent successfully" });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json({ error: true, message: "Error while inserting order into database" });
    });
});

module.exports = router;
