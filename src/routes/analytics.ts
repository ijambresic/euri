import express from "express";
import { MongoClient, ObjectId } from "mongodb";
export const router = express.Router();

import { data, client } from "../app";
import type { Coin } from "../../types";

// Define the route for getting data for the past 30 days
router.get("/days", async (req, res) => {
  // Extract coinId from the request query
  let coinId = await validateCoinId(req.query.coin_id as string, res);
  if (typeof coinId !== "string") return;

  // Initialize date variables for the time period of the past 30 days
  const today = new Date();
  const date = new Date();
  const labels: string[] = [];
  const timePeriods: string[] = [];

  date.setDate(today.getDate() - 30);

  // Generate the time periods and labels for the past 30 days
  do {
    date.setDate(date.getDate() + 1);
    const timePeriod = `${date.getDate() < 10 ? "0" : ""}${date.getDate()}${
      date.getMonth() < 9 ? "0" : ""
    }${date.getMonth() + 1}${date.getFullYear()}`;
    timePeriods.push(timePeriod);
    labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
  } while (date.getDate() !== today.getDate() || date.getMonth() !== today.getMonth());

  // Get the coin data
  const coin = data.coinMap.get(coinId) as Coin;

  // Initialize the datasets array
  const datasets = [];

  for (const issueId of coin.issueIds) {
    const issue = data.issueMap.get(issueId.toString());

    if (!issue) {
      continue;
    }

    const dataset = {
      label: issue.name as string,
      data: await getSellData(timePeriods, coinId, issueId.toString()),
    };

    // Add the dataset to the datasets array
    datasets.push(dataset);
  }

  // Send the labels and datasets in the response
  return res.send({ labels, datasets });
});

router.get("/months", async (req, res) => {
  // Validate the coinId from the request query
  let coinId = await validateCoinId(req.query.coin_id as string, res);
  if (typeof coinId !== "string") return;

  // Initialize date variables and arrays for labels and time periods
  const today = new Date();
  const labels = [] as string[];
  const timePeriods = [] as string[];
  let month = today.getMonth();
  let year = today.getFullYear();

  // Generate the time periods and labels for the past 12 months
  year--;
  for (let i = 0; i < 12; i++) {
    month = (month + 1) % 12;
    if (month === 0) year++;
    const timePeriod = `${month < 9 ? "0" : ""}${month + 1}${year}`;
    timePeriods.push(timePeriod);
    labels.push(`${month + 1}/${year.toString().slice(-2)}`);
  }

  // Get the coin data
  const coin = data.coinMap.get(coinId) as Coin;

  // Initialize the datasets array
  const datasets = [];

  // Loop through each issueId and create a dataset for it
  for (const issueId of coin.issueIds) {
    const issue = data.issueMap.get(issueId.toString());

    // Skip if issue is not found
    if (!issue) {
      continue;
    }

    // Create a dataset for the issue
    const dataset = {
      label: issue.name as string,
      data: await getSellData(timePeriods, coinId, issueId.toString()),
    };

    // Add the dataset to the datasets array
    datasets.push(dataset);
  }
  // Send the labels and datasets in the response
  return res.send({ labels, datasets });
});

/*
 *
 *  Functions
 *
 */

// Function to validate coinId
async function validateCoinId(
  coinId: string | string[] | undefined,
  res: express.Response
) {
  if (coinId === undefined) {
    return res.status(400).send({ message: "Coin id is required in the params!" });
  }
  if (Array.isArray(coinId)) {
    return res.status(400).send({ message: "Only one coin id is allowed!" });
  }
  if (data.coinMap.has(coinId) === false) {
    return res.status(404).send({ message: "Coin doesn't exist!" });
  }

  return coinId as string;
}

// Function to get sell data
async function getSellData(timePeriods: string[], coinId: string, issueId: string) {
  const db = client.db("2Euro");
  const sells = db.collection("Sells");

  const datasetData = [];

  for (const timePeriod of timePeriods) datasetData.push(0);

  let index = 0;
  const promises = [];

  for (const timePeriod of timePeriods) {
    const localIndex = index;
    const promise = sells.findOne({ timePeriod, coinId: new ObjectId(coinId) }).then(item => {
      if (item) datasetData[localIndex] = item.issueSells[issueId];
    });
    promises.push(promise);
    index++;
  }

  await Promise.all(promises);

  return datasetData;
}
