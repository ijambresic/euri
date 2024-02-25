const express = require('express');
const router = express.Router();

const { data } = require('../../app');

router.post("/", (req, res) => {

    const local = req.body.localStorage;
    let price = 0;
    const cart = {};

    for ([issueId, amount] of Object.entries(local)) {
        const issueRaw = data.issueMap.get(issueId);
        const issue = {
            id: issueRaw._id.toString(),
            name: issueRaw.name,
            price: issueRaw.price,
            limit: Math.min(10, issueRaw.amount - issueRaw.pending)
        };
        const coin = data.coinMap.get(issueRaw.coinId);
        if (amount > issue.limit) amount = issue.limit;
        if (amount === 0) continue;
        cart[issueId] = {
            coin,
            issue,
            amount,
            total: amount * issue.price
        };

        price += amount * issue.price;
    }

    return res.status(200).send({list: cart, price});

});

module.exports = router;