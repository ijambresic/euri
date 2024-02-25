const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();

const { data, client } = require('../app');

router.get("/days", async (req, res) => {
    let coinId = req.query.coin_id;
    
    const db = client.db("2Euro");
    const sells = db.collection("Sells");

    const today = new Date();
    const date = new Date();
    const labels = [];
    const timePeriods = [];
    date.setDate(today.getDate() - 30);
    do {
        date.setDate(date.getDate() + 1);
        const timePeriod = `${date.getDate()<10?'0':''}${date.getDate()}${date.getMonth()<9?'0':''}${date.getMonth()+1}${date.getFullYear()}`;
        timePeriods.push(timePeriod);
        labels.push(`${date.getDate()}/${date.getMonth()+1}`);  
    } while (date.getDate() !== today.getDate() || date.getMonth() !== today.getMonth());

    const coin = data.coinMap.get(coinId);
    if (!coin) {
        return res.status(404).send({message: 'Coin doesn\'t exist!'});
    }
    const issueIds = coin.issueIds;
    const datasets = [];

    for (issueId of issueIds) {
        const issue = data.issueMap.get(issueId.toString());
        const dataset = {};
        dataset.label = issue.name;
        dataset.data = [];
        for (timePeriod of timePeriods) {
            const item = await sells.findOne({timePeriod, coinId: new ObjectId(coinId)});
            if (item) {
                dataset.data.push(item.issueSells[issueId.toString()]);
            } else {
                dataset.data.push(0);
            }
        }
        datasets.push(dataset);
    }

    return res.status(200).send({ labels, datasets });

});

module.exports = router;