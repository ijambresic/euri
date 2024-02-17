const express = require('express');
const router = express.Router();

const { data } = require('../app');

router.get("/", (req, res) => {
    const countries = [];
    for (country of data.countryList) countries.push(data.countryMap.get(country[1]));
    res.render("countries", { countries });
});

router.get("/years", (req, res) => {
    const years = [];
    for (year of data.yearList) years.push(data.yearMap.get(year[1]));
    res.render("years", { years });
});

module.exports = router;