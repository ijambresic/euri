const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();

const { data, client } = require('../../app');

router.post("/editIssue", (req, res) => {
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
            data.issueMap.set(issueId, {
                _id: new ObjectId(issueId),
                name,
                price,
                amount,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to add issue!");
        });
});

module.exports = router;