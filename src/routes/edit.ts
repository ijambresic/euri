import express from "express";
export const router = express.Router();

import { data } from "../app";
import { Coin } from "../../types";

router.get("/", (req, res) => {
  let groupBy = req.query.group_by;
  if (groupBy === undefined) groupBy = "countries";

  const coinList = [];

  const cmpSubgroup = (coin1, coin2) => {
    if (coin1.subgroup < coin2.subgroup) return -1;
    if (coin1.subgroup > coin2.subgroup) return 1;
    return 0;
  };

  if (groupBy === "countries") {
    for (const country of data.countryList) {
      const coins = {
        group: country,
        coins: [] as Coin[],
      };
      const countryId = country[1];

      for (const coinId of data.countryMap.get(countryId)!.coinIds) {
        const coin = data.coinMap.get(coinId.toString());
        if (coin === undefined) continue;
        coin.subgroup = data.yearMap.get(coin.yearId.toString())!.name;
        coins.coins.push(coin);
      }
      coins.coins.sort(cmpSubgroup);
      coinList.push(coins);
    }
  }

  if (groupBy === "years") {
    for (const year of data.yearList) {
      const coins = {
        group: year,
        coins: [] as Coin[],
      };
      const yearId = year[1];
      for (const coinId of data.yearMap.get(yearId)!.coinIds) {
        const coin = data.coinMap.get(coinId.toString());
        if (coin === undefined) continue;
        coin.subgroup = data.countryMap.get(coin.countryId.toString())!.name;
        coins.coins.push(coin);
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
