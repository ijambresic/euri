import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import path from "path";
import type { Coin, Country, CountryList, Issue, Year, YearList } from "../types";

const app = express();
const port = 3000;

const MONGO_URI =
  "mongodb+srv://ivanjambresic:gOUKpOa3zjrfPiMr@cluster0.3h9h6dr.mongodb.net/?retryWrites=true&w=majority";

export const client = new MongoClient(MONGO_URI);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

client
  .connect()
  .then(() => {
    console.log("Connected to the database.");
  })
  .catch((err) => {
    console.log("Failed to connect to the database.", err);
  });

export const data = {
  countryMap: new Map() as Map<string, Country>,
  yearMap: new Map() as Map<string, Year>,
  coinMap: new Map() as Map<string, Coin>,
  issueMap: new Map() as Map<string, Issue>,
  countryList: [] as CountryList,
  yearList: [] as YearList,
};

const setup = async () => {
  const cmpFirst = (a: [string, string], b: [string, string]) => a[0].localeCompare(b[0]);

  const database = client.db("2Euro");
  const countryCollection = database.collection("Countries");
  const yearCollection = database.collection("Years");
  const coinCollection = database.collection("Coins");
  const issueCollection = database.collection("Issues");

  const countryList = (await countryCollection.find().toArray()) as Country[];
  let index = 0;
  for (const country of countryList) {
    data.countryList.push([country.name, country._id.toString()]);
    country.index = index;
    data.countryMap.set(country._id.toString(), country);
    index++;
  }
  data.countryList.sort(cmpFirst);

  const yearList = (await yearCollection.find().toArray()) as Year[];
  index = 0;
  for (const year of yearList) {
    data.yearList.push([year.name, year._id.toString()]);
    year.index = index;
    data.yearMap.set(year._id.toString(), year);
    index++;
  }
  data.yearList.sort(cmpFirst);

  const issueList = (await issueCollection.find().toArray()) as Issue[];
  for (const issue of issueList) {
    data.issueMap.set(issue._id.toString(), issue);
  }

  const coinList = (await coinCollection.find().toArray()) as Coin[];
  for (const coin of coinList) {
    coin.src = `images/coins/${coin.code}.jpg`;
    data.coinMap.set(coin._id.toString(), coin);
    for (const issueId of coin.issueIds) {
      const issue = data.issueMap.get(issueId.toString());
      if (issue) issue.coinId = coin._id.toString();
    }
  }
};

import { router as indexRouter } from "./routes/index";
import { router as coinsRouter } from "./routes/coins";
import { router as editRouter } from "./routes/edit";
import { router as ordersRoute } from "./routes/orders";
import { router as addCoinRouter } from "./routes/posts/addCoin";
import { router as addIssueRouter } from "./routes/posts/addIssue";
import { router as editIssueRouter } from "./routes/posts/editIssue";
import { router as orderRouterPost } from "./routes/posts/order";
import { router as orderRouterPut } from "./routes/puts/order";
import { router as cartRouter } from "./routes/posts/cart";
import { router as analyticsRouter } from "./routes/analytics";
import { router as loginRouter } from "./routes/auth";

// view routes
app.get("/", (req, res) => {
  res.render("browseItems", { yearList: data.yearList, countryList: data.countryList });
});
app.use("/edit", editRouter);
app.use("/orders", ordersRoute);
app.use("/old", indexRouter);
app.use("/login", loginRouter);

// API routes
app.use("/coins", coinsRouter);
app.use("/addCoin", addCoinRouter);
app.use("/addIssue", addIssueRouter);
app.use("/editIssue", editIssueRouter);
app.use("/order", orderRouterPost);
app.use("/order", orderRouterPut);
app.use("/cart", cartRouter);
app.use("/analytics", analyticsRouter);

setup().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
