import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import path from "path";

const app = express();
const port = 3000;

app.use(express.json());

const uri =
  "mongodb+srv://ivanjambresic:gOUKpOa3zjrfPiMr@cluster0.3h9h6dr.mongodb.net/?retryWrites=true&w=majority";
export const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "..", "public")));

client.connect();

export const data = {
  countryMap: new Map(),
  yearMap: new Map(),
  coinMap: new Map(),
  issueMap: new Map(),
  countryList: [],
  yearList: [],
};

const setup = async () => {
  const cmpFirst = (a, b) => {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
  };

  const database = client.db("2Euro");
  const countryCollection = database.collection("Countries");
  const yearCollection = database.collection("Years");
  const coinCollection = database.collection("Coins");
  const issueCollection = database.collection("Issues");

  const countryList = await countryCollection.find().toArray();
  let index = 0;
  for (const country of countryList) {
    data.countryList.push([country.name, country._id.toString()]);
    country.index = index;
    data.countryMap.set(country._id.toString(), country);
    index++;
  }
  data.countryList.sort(cmpFirst);

  const yearList = await yearCollection.find().toArray();
  index = 0;
  for (const year of yearList) {
    data.yearList.push([year.name, year._id.toString()]);
    year.index = index;
    data.yearMap.set(year._id.toString(), year);
    index++;
  }
  data.yearList.sort(cmpFirst);

  const issueList = await issueCollection.find().toArray();
  for (const issue of issueList) {
    data.issueMap.set(issue._id.toString(), issue);
  }

  const coinList = await coinCollection.find().toArray();
  for (const coin of coinList) {
    coin.src = `images/coins/${coin.code}.jpg`;
    data.coinMap.set(coin._id.toString(), coin);
    for (const issueId of coin.issueIds) {
      data.issueMap.get(issueId.toString()).coinId = coin._id.toString();
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

app.use("/", indexRouter);
app.use("/coins/", coinsRouter);
app.use("/edit/", editRouter);
app.use("/addCoin/", addCoinRouter);
app.use("/addIssue/", addIssueRouter);
app.use("/editIssue/", editIssueRouter);
app.use("/order/", orderRouterPost);
app.use("/order/", orderRouterPut);
app.use("/orders/", ordersRoute);
app.use("/cart/", cartRouter);
app.use("/analytics/", analyticsRouter);

// za prave developere odjeljak
app.get("/dev/browse", (req, res) => {
  res.render("browseItems", { yearList: data.yearList, countryList: data.countryList });
});
app.get("/home", (req, res) => {
  res.render("adminHome");
});
app.post("/getAdminPrivileges", (req, res) => {
  console.log(req.headers.cookie.split(";"));

  const { adminPassword } = req.body;
  console.log(adminPassword);

  // set cookie
  res.cookie(
    "admin",
    "dobarPosaoČovjećeTiSiSadaAdminNadamSeDaNitkoNePogodiOvuTajnuVrijednost",
    { expires: new Date("2025-01-01"), httpOnly: true }
  );
  res.json({ message: "You are an admin" });
  return;
});

setup().then(
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  })
);
