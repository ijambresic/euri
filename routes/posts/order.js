const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();

const { data, client } = require('../../app');

router.post("/", (req, res) => {
    const { order } = req.body;

    const db = client.db("2Euro");
    const orders = db.collection("Orders");

    let total = 0;

    console.log(order);

    orders.insertOne({
        date: new Date(),
        status: 'prending',
        order
    }).then(orderItem => {
        for (let [issueId, amount] of Object.entries(order)) {
            total += data.issueMap.get(issueId).price*amount;
        }
        console.log('ovaj order kosta:', total);
    }).catch((err) => {
        console.log(err);
        res.status(500).send("Failed to send order!");
    });

});

module.exports = router;