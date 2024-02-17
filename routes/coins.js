const express = require('express');
const router = express.Router();

const { data } = require('../app');

const cmpTitle = (a, b) => {
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
    return 0;
};

router.get("/country/:countryTLA", (req, res) => {
    const TLA = req.params.countryTLA;
    let country;
    for (c of data.countryMap.values()) {
        if (c.TLA === TLA) {
            country = c;
            break;
        }
    }
    const coinIds = country.coinIds;

    const coinList = [];

    for (id of coinIds) {
        const coin = data.coinMap.get(id.toString());
        const year = data.yearMap.get(coin.yearId.toString());
        coin.title = year.name;
        coinList.push(coin);
    }
    coinList.sort(cmpTitle);

    res.render("coins", { filter: country.name, coinList });
});

router.get("/year/:year", (req, res) => {
    const name = req.params.year;

    let year;
    for (y of data.yearMap.values()) {
        if (y.name === name) {
            year = y;
            break;
        }
    }
    const coinIds = year.coinIds;

    const coinList = [];

    for (id of coinIds) {
        const coin = data.coinMap.get(id.toString());
        const country = data.countryMap.get(coin.countryId.toString());
        coin.title = country.name;
        coinList.push(coin);
    }
    coinList.sort(cmpTitle);

    res.render("coins", { filter: year.name, coinList });
});

module.exports = router;