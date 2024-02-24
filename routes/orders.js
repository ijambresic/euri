const express = require("express");
const router = express.Router();

const { data, client } = require("../app");

const getList = orderRaw => {
    const orderList = [];
    for (order of orderRaw) {
        const newItem = {
            name: order.name,
            date: order.date,
            status: order.status,
            total: order.total,
            items: []
        }
        for (issueId in order.order) {
            const issue = data.issueMap.get(issueId);
            newItem.items.push({
                coin: data.coinMap.get(issue.coinId),
                issue: issue.name,
                price: issue.price,
                amount: order.order[issueId],
                total: issue.price*order.order[issueId]
            });
        }
        orderList.push(newItem);
    }
    return orderList;
}

router.get("/", async (req, res) => {
    const { status, offset } = req.params;

    const pipeline = [];
    if (status) pipeline.push({ $match: { status: status } });
    pipeline.push({ $sort: { date: -1 } });
    if (offset) pipeline.push({ $skip: offset });
    pipeline.push({ $limit: 10 }); // namjesti kolko ce bit displayano odjednom

    const db = client.db("2Euro");
    const orders = db.collection("Orders");

    try {
        const orderRaw = await orders.aggregate(pipeline).toArray();
        const orderList = getList(orderRaw);
        res.render("orders", { status, orderList });
    } catch (error) {
        console.error('Greška pri dohvaćanju narudžbi:', error);
        throw error;
    }

});

module.exports = router;
