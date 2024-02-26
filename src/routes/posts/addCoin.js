const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();

const { data, client } = require('../../app');

router.post("/", (req, res) => {
    const { countryId, yearId, name, src } = req.body;

    const country = data.countryMap.get(countryId);
    const code = country.TLA + (country.coinIds.length + 1);

    const db = client.db("2Euro");
    const coins = db.collection("Coins");
    const countries = db.collection("Countries");
    const years = db.collection("Years");

    coins
        .insertOne({
            code,
            name,
            src,
            countryId: new ObjectId(countryId),
            yearId: new ObjectId(yearId),
            issueIds: [],
        })
        .then((coin) => {
            Promise.all([
                countries.updateOne(
                    { _id: new ObjectId(countryId) },
                    { $push: { coinIds: coin.insertedId } }
                ),
                years.updateOne(
                    { _id: new ObjectId(yearId) },
                    { $push: { coinIds: coin.insertedId } }
                ),
            ])
                .then(() => {
                    data.coinMap.set(coin.insertedId.toString(), {
                        _id: coin.insertedId,
                        code,
                        name,
                        src,
                        countryId: countryId,
                        yearId: yearId,
                        issueIds: [],
                    });
                    data.countryMap.get(countryId).coinIds.push(coin.insertedId.toString());
                    data.yearMap.get(yearId).coinIds.push(coin.insertedId.toString());
                    return res.sendStatus(200);
                })
                .catch((err) => {
                    console.log(err);
                    return res
                        .status(501)
                        .send(
                            "Added coin but didn't add its id to year and/or country coin id list!"
                        );
                });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send("Failed to add coin!");
        });
});

module.exports = router;