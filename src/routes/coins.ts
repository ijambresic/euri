import express from "express";
export const router = express.Router();

import { data } from "../app";

const cmpTitle = (a, b) => {
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
};

const getDataByFilter = (filter, map, key) => {
  for (const item of map.values()) {
    if (item[key] === filter) {
      return item;
    }
  }
};

const getIssues = (coinList) => {
  const issues = {};
  for (const coin of coinList) {
    for (const issueId of coin.issueIds) {
      const issue = data.issueMap.get(issueId.toString());
      issues[issueId.toString()] = {
        id: issueId.toString(),
        name: issue.name,
        price: issue.price,
        limit: Math.min(10, issue.amount - issue.pending),
      };
    }
  }

  return issues;
};

const getCoins = (coinIds) => {
  const coinList = [];
  for (const id of coinIds) {
    const coin = data.coinMap.get(id.toString());
    coinList.push(coin);
  }
  coinList.sort(cmpTitle);
  return coinList;
};

router.get("/country/:countryTLA", (req, res) => {
  // BILJEŠKA: meni je tu lakse koristit odma id jer to dobijem iz countryList
  // ovo sam sad promjenio rucno samo da mogu testirat, mozes ti vratit na TLA

  const TLA = req.params.countryTLA;
  // let country = getDataByFilter(TLA, data.countryMap, 'TLA');
  let country = data.countryMap.get(TLA);
  const coinIds = country.coinIds;

  const coinList = getCoins(coinIds);
  //   isto da javim da dobijem uvijek {} za issues kad fetcham, nisam gledo zasto
  //    ali coinList.issueIds bude popunjen
  const issues = getIssues(coinList);

  return res.send({ filter: country.name, coinList, issues });
});

router.get("/year/:year", (req, res) => {
  const name = req.params.year;
  //   const year = getDataByFilter(name, data.yearMap, "name");
  const year = data.yearMap.get(name);
  const coinIds = year.coinIds;

  const coinList = getCoins(coinIds);
  const issues = getIssues(coinList);

  return res.send({ filter: year.name, coinList, issues });
});
