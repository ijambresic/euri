const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());

const uri =
  "mongodb+srv://ivanjambresic:gOUKpOa3zjrfPiMr@cluster0.3h9h6dr.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

client.connect();

const data = {
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
  for (country of countryList) {
    data.countryList.push([country.name, country._id.toString()]);
    country.index = index;
    data.countryMap.set(country._id.toString(), country);
    index++;
  }
  data.countryList.sort(cmpFirst);

  const yearList = await yearCollection.find().toArray();
  index = 0;
  for (year of yearList) {
    data.yearList.push([year.name, year._id.toString()]);
    year.index = index;
    data.yearMap.set(year._id.toString(), year);
    index++;
  }
  data.yearList.sort(cmpFirst);

  const issueList = await issueCollection.find().toArray();
  for (issue of issueList) {
    data.issueMap.set(issue._id.toString(), issue);
  }

  const coinList = await coinCollection.find().toArray();
  for (coin of coinList) {
    coin.src = `images/coins/${coin.code}.jpg`;
    data.coinMap.set(coin._id.toString(), coin);
    for (issueId of coin.issueIds) {
      data.issueMap.get(issueId.toString()).coinId = coin._id.toString();
    }
  }

};

module.exports = {
  data,
  client,
};

const indexRouter = require("./routes/index");
const coinsRouter = require("./routes/coins");
const editRouter = require("./routes/edit");
const addCoinRouter = require("./routes/posts/addCoin");
const addIssueRouter = require("./routes/posts/addIssue");
const editIssueRouter = require("./routes/posts/editIssue");
const orderRouter = require("./routes/posts/order");

app.use("/", indexRouter);
app.use("/coins/", coinsRouter);
app.use("/edit/", editRouter);
app.use("/addCoin/", addCoinRouter);
app.use("/addIssue/", addIssueRouter);
app.use("/editIssue/", editIssueRouter);
app.use("/order/", orderRouter);

// za prave developere odjeljak
app.get("/dev/browse", (req, res) => {
  res.render("browseItems", { yearList: data.yearList, countryList: data.countryList });
});

setup().then(
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  })
);
