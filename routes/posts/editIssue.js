const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();

const { data, client } = require('../../app');

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
                    price,
                    amount,
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
                pending
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to add issue!");
        });
});

module.exports = router;