const express = require('express');
const router = express.Router();

const { data } = require('../app');

const cmpTitle = (a, b) => {
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
    return 0;
};

const getDataByFilter = (filter, map, key) => {
    for (item of map.values()) {
        if (item[key] === filter) {
            return item;
        }
    }
}

const getIssues = (coinList) => {
    const issues = new Map();
    for (coin of coinList) {
        for (issueId of coin.issueIds) {
            const issue = data.issueMap.get(issueId.toString());
            issues.set(issueId.toString(), {
                id: issueId.toString(),
                name: issue.name,
                price: issue.price,
                limit: Math.min(10, issue.amount)
            });
        }
    }
    return issues;
}

const getCoins = (coinIds, otherMap, otherId) => {
    const coinList = [];
    for (id of coinIds) {
        const coin = data.coinMap.get(id.toString());
        const title = otherMap.get(coin[otherId].toString());
        coin.title = title.name;
        coinList.push(coin);
    }
    coinList.sort(cmpTitle);
    return coinList;
}

router.get("/country/:countryTLA", (req, res) => {
    const TLA = req.params.countryTLA;
    let country = getDataByFilter(TLA, data.countryMap, 'TLA');
    const coinIds = country.coinIds;

    const coinList = getCoins(coinIds, data.yearMap, "yearId");
    const issues = getIssues(coinList);

    res.send({ filter: country.name, coinList, issues });
});

router.get("/year/:year", (req, res) => {
    const name = req.params.year;
    const year = getDataByFilter(name, data.yearMap, 'name');
    const coinIds = year.coinIds;

    const coinList = getCoins(coinIds, data.countryMap, "countryId");
    const issues = getIssues(coinList);

    res.send({ filter: country.name, coinList, issues });
});

module.exports = router;