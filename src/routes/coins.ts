import express from "express";
export const router = express.Router();

import { data } from "../app";
import { Coin } from "../../types";
import { ObjectId } from "mongodb";

const cmpTitle = (a: Coin, b: Coin) => {
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
};

const getIssues = (coinList: Coin[]) => {
  const issues = {} as {
    [issueId: string]: { id: string; name: string; price: string; limit: number };
  };

  for (const coin of coinList) {
    for (const issueId of coin.issueIds) {
      const issue = data.issueMap.get(issueId.toString());
      if (issue === undefined) continue;

      issues[issueId.toString()] = {
        id: issueId.toString(),
        name: issue.name,
        price: issue.price,
        limit: Math.min(10, Number(issue.amount) - issue.pending),
      };
    }
  }

  return issues;
};

const getCoins = (coinIds: ObjectId[]) => {
  const coinList = [] as Coin[];

  for (const id of coinIds) {
    const coin = data.coinMap.get(id.toString());
    if (coin !== undefined) coinList.push(coin);
  }
  coinList.sort(cmpTitle);
  return coinList;
};

router.get("/country/:countryId", (req, res) => {
  const countryId = req.params.countryId;

  const country = data.countryMap.get(countryId);

  if (country === undefined) {
    return res.send({ filter: countryId, coinList: [], issues: {} });
  }

  const coinIds = country.coinIds;

  const coinList = getCoins(coinIds);

  const issues = getIssues(coinList);

  return res.send({ filter: country.name, coinList, issues });
});

router.get("/year/:yearId", (req, res) => {
  const yearId = req.params.yearId;

  const year = data.yearMap.get(yearId);

  if (year === undefined) {
    return res.send({ filter: yearId, coinList: [], issues: {} });
  }
  const coinIds = year.coinIds;

  const coinList = getCoins(coinIds);
  const issues = getIssues(coinList);

  return res.send({ filter: year.name, coinList, issues });
});
