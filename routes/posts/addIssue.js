const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();

const { data, client } = require('../../app');

router.post("/", (req, res) => {
    const { coinId, name, price, amount } = req.body;
    // console.log(coinId);

    const db = client.db("2Euro");
    const coins = db.collection("Coins");
    const issues = db.collection("Issues");

    issues
        .insertOne({
            name,
            price,
            amount,
            pending: 0
        })
        .then((issue) => {
            coins
                .updateOne(
                    { _id: new ObjectId(coinId) },
                    { $push: { issueIds: issue.insertedId } }
                )
                .then(() => {
                    data.issueMap.set(issue.insertedId.toString(), {
                        _id: issue.insertedId,
                        name,
                        price,
                        amount,
                        coinId,
                        pending: 0
                    });
                    data.coinMap.get(coinId).issueIds.push(issue.insertedId.toString());
                    res.status(200).json({
                        newId: issue.insertedId,
                    });
                })
                .catch((err) => {
                    console.log(err);
                    return res
                        .status(501)
                        .send("Added issue but didn't add its id to coin issue id list!");
                });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send("Failed to add issue!");
        });
});

module.exports = router;