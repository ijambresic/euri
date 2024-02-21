const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();

const { data, client } = require('../../app');

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

router.post("/add", (req, res) => {
    const { order } = req.body;

    const db = client.db("2Euro");
    const orders = db.collection("Orders");

    let total = 0;

    for (let [issueId, amount] of Object.entries(order)) {
        total += data.issueMap.get(issueId).price * amount;
    }

    const date = new Date();
    const name = formatDate(date);

    orders.insertOne({
        name,
        date,
        status: 'pending',
        order,
        total
    }).then(orderItem => {
        res.sendStatus(200);
    }).catch((err) => {
        console.log(err);
        res.status(500).send("Failed to send order!");
    });

});

module.exports = router;