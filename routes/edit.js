const express = require('express');
const router = express.Router();

const { data } = require('../app');

router.get("/", (req, res) => {
    let groupBy = req.query.group_by;
    if (groupBy === undefined) groupBy = "countries";
    const coinList = [];

    const cmpSubgroup = (coin1, coin2) => {
        if (coin1.subgroup < coin2.subgroup) return -1;
        if (coin1.subgroup > coin2.subgroup) return 1;
        return 0;
    }

    if (groupBy === "countries") {
        for (country of data.countryList) {
            const coins = {
                group: country,
                coins: [],
            };
            const countryId = country[1];
            for (coinId of data.countryMap.get(countryId).coinIds) {
                const coin = data.coinMap.get(coinId.toString());
                coin.subgroup = data.yearMap.get(coin.yearId.toString()).name;
                coins.coins.push(coin);
            }
            coins.coins.sort(cmpSubgroup);
            coinList.push(coins);
        }
    }

    if (groupBy === "years") {
        for (year of data.yearList) {
            const coins = {
                group: year,
                coins: [],
            };
            const yearId = year[1];
            for (coinId of data.yearMap.get(yearId).coinIds) {
                const coin = data.coinMap.get(coinId.toString());
                coin.subgroup = data.countryMap.get(coin.countryId.toString()).name;
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

module.exports = router;