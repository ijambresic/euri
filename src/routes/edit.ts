import express from "express";
import { asyncHandler } from "../asyncHandler";
import { ObjectId } from "mongodb";
import { data } from "../app";
import { collections } from "../db";
import { isAdmin } from "./auth";
import { router as addPurchaseRouter } from "./posts/addPurchase";
import type { Coin } from "../../types";

type CoinWithSubgroup = Coin & { subgroup: string };

export const router = express.Router();

router.use(addPurchaseRouter);

router.get("/issues/:issueId/purchases", isAdmin, asyncHandler(async (req, res) => {
  const { issueId } = req.params;
  if (!data.issueMap.has(issueId)) {
    return res.status(404).json({ message: "Issue not found." });
  }

  try {
    const history = await collections
      .issuePurchases()
      .findOne({ _id: new ObjectId(issueId) });
    const purchases = history?.purchases.reverse() ?? [];
    purchases.sort((a, b) => b.date.localeCompare(a.date));
    return res.set("Cache-Control", "no-store").json(purchases);
  } catch (error) {
    console.error("Failed to load purchase history.", error);
    return res.status(500).json({ message: "Could not load purchase history." });
  }
}));

router.get("/", isAdmin, (req, res) => {
  let groupBy = req.query.group_by;
  if (groupBy === undefined) groupBy = "countries";

  const coinList = [];

  const cmpSubgroup = (coin1: CoinWithSubgroup, coin2: CoinWithSubgroup) => {
    if (coin1.subgroup < coin2.subgroup) return -1;
    if (coin1.subgroup > coin2.subgroup) return 1;
    return 0;
  };

  if (groupBy === "countries") {
    for (const country of data.countryList) {
      const coins = {
        group: country,
        coins: [] as CoinWithSubgroup[],
      };
      const countryId = country[1];

      for (const coinId of data.countryMap.get(countryId)?.coinIds ?? []) {
        const coin = data.coinMap.get(coinId.toString());
        if (coin === undefined) continue;
        const subgroup = data.yearMap.get(coin.yearId.toString())?.name ?? "";
        coins.coins.push({ ...coin, subgroup });
      }
      coins.coins.sort(cmpSubgroup);
      coinList.push(coins);
    }
  }

  if (groupBy === "years") {
    for (const year of data.yearList) {
      const coins = {
        group: year,
        coins: [] as CoinWithSubgroup[],
      };
      const yearId = year[1];
      for (const coinId of data.yearMap.get(yearId)?.coinIds ?? []) {
        const coin = data.coinMap.get(coinId.toString());
        if (coin === undefined) continue;
        const subgroup = data.countryMap.get(coin.countryId.toString())?.name ?? "";
        coins.coins.push({ ...coin, subgroup });
      }
      coins.coins.sort(cmpSubgroup);
      coinList.push(coins);
    }
  }

  const countryList = data.countryList;
  const yearList = data.yearList;
  const issueMap = data.issueMap;
  const groupByList = groupBy === "countries" ? countryList : yearList;

  return res.render("edit", { coinList, countryList, yearList, issueMap, groupByList });
});
