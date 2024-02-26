import express from "express";
export const router = express.Router();

import { data } from "../app";

router.get("/", (req, res) => {
  const countries = [];
  for (country of data.countryList) countries.push(data.countryMap.get(country[1]));
  return res.render("countries", { countries });
});

router.get("/years", (req, res) => {
  const years = [];
  for (year of data.yearList) years.push(data.yearMap.get(year[1]));
  return res.render("years", { years });
});
