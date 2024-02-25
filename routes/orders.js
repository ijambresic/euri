const express = require("express");
const router = express.Router();

const { data, client } = require("../app");

const getList = (orderRaw) => {
  const orderList = [];
  for (order of orderRaw) {
    const newItem = {
      id: order._id.toString(),
      name: order.name,
      date: order.date,
      status: order.status,
      total: order.total,
      items: [],
    };
    for (issueId in order.order) {
      const issue = data.issueMap.get(issueId);
      const orderItem = {
        coin: data.coinMap.get(issue.coinId),
        issue: issue.name,
        price: issue.price,
        amount: order.order[issueId],
        total: issue.price * order.order[issueId],
      };
      orderItem.coin.country = data.countryMap.get(
        orderItem.coin.countryId.toString()
      ).name;
      orderItem.coin.year = data.yearMap.get(orderItem.coin.yearId.toString()).name;
      newItem.items.push(orderItem);
    }
    orderList.push(newItem);
  }
  return orderList;
};

router.get("/", async (req, res) => {
  const { status, offset } = req.query;

  const statusArray = Array.isArray(status) ? status : [status];

  const pipeline = [];
  if (status) pipeline.push({ $match: { status: { $in: statusArray } } });
  pipeline.push({ $sort: { date: -1 } });
  if (offset && offset >= 0) pipeline.push({ $skip: Number(offset) });
  pipeline.push({ $limit: 10 }); // namjesti kolko ce bit displayano odjednom

  const db = client.db("2Euro");
  const orders = db.collection("Orders");

  try {
    const orderRaw = await orders.aggregate(pipeline).toArray();
    const orderList = getList(orderRaw);
    return res.render("orders", { status, orderList });
  } catch (error) {
    console.error("Greška pri dohvaćanju narudžbi:", error);
    throw error;
  }
});

module.exports = router;
