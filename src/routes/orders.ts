import express from "express";
import { asyncHandler } from "../asyncHandler";
import type { Document, WithId } from "mongodb";
import { isAdmin } from "./auth";
export const router = express.Router();

import { data } from "../app";
import { collections } from "../db";
import type { Coin, Order } from "../../types";

type OrderItemView = {
  coin: Coin & { country: string; year: string };
  issue: string;
  price: string;
  amount: number;
  total: number;
};

const getList = (orderRaw: WithId<Omit<Order, "_id">>[]) => {
  const orderList = [];
  for (const order of orderRaw) {
    const items: OrderItemView[] = [];

    for (const [issueId, amount] of Object.entries(order.order)) {
      const issue = data.issueMap.get(issueId);
      const coin = issue && data.coinMap.get(issue.coinId);

      // An order can outlive the issue or coin it points to; show the rest of it.
      if (!issue || !coin) {
        console.error(`Order ${order._id.toString()}: unknown issue ${issueId}, skipped.`);
        continue;
      }

      items.push({
        coin: {
          ...coin,
          country: data.countryMap.get(coin.countryId.toString())?.name ?? "",
          year: data.yearMap.get(coin.yearId.toString())?.name ?? "",
        },
        issue: issue.name,
        price: issue.price,
        amount,
        total: Number(issue.price) * amount,
      });
    }

    orderList.push({
      id: order._id.toString(),
      name: order.name,
      date: order.date,
      status: order.status,
      total: order.total,
      items,
    });
  }
  return orderList;
};

router.get("/", isAdmin, asyncHandler(async (req, res) => {
  const { status, offset } = req.query;

  const statusArray = Array.isArray(status) ? status : [status];

  const pipeline: Document[] = [];
  if (status) pipeline.push({ $match: { status: { $in: statusArray } } });
  pipeline.push({ $sort: { date: -1 } });
  if (typeof offset === "string" && Number(offset) >= 0) {
    pipeline.push({ $skip: Number(offset) });
  }
  pipeline.push({ $limit: 10 }); // namjesti kolko ce bit displayano odjednom

  try {
    const orderRaw = await collections
      .orders()
      .aggregate<WithId<Omit<Order, "_id">>>(pipeline)
      .toArray();
    const orderList = getList(orderRaw);
    return res.render("orders", { status, orderList });
  } catch (error) {
    console.error("Greška pri dohvaćanju narudžbi:", error);
    return res.status(500).send("Failed to load orders!");
  }
}));
