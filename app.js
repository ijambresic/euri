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

  const coinList = await coinCollection.find().toArray();
  for (coin of coinList) {
    coin.src = `images/coins/${coin.code}.jpg`;
    data.coinMap.set(coin._id.toString(), coin);
  }

  const issueList = await issueCollection.find().toArray();
  for (issue of issueList) {
    data.issueMap.set(issue._id.toString(), issue);
  }
};

module.exports = {
   data,
   client
};

const indexRouter = require('./routes/index');
const coinsRouter = require('./routes/coins');
const editRouter = require('./routes/edit');
const addCoinRouter = require('./routes/posts/addCoin');
const addIssueRouter = require('./routes/posts/addIssue');
const editIssueRouter = require('./routes/posts/editIssue');

app.use('/', indexRouter);
app.use('/coins/', coinsRouter);
app.use('/edit/', editRouter);
app.use('/addCoin', addCoinRouter);
app.use('/addIssue', addIssueRouter);
app.use('editIssue', editIssueRouter);

app.post("/addIssue", (req, res) => {
  const { coinId, name, price, amount } = req.body;
 // console.log(coinId);

  const db = client.db("2Euro");
  const coins = db.collection("Coins");
  const issues = db.collection("Issues");

  issues
    .insertOne({
      name,
      price,
      amount,
    })
    .then((issue) => {
      coins
        .updateOne(
          { _id: new ObjectId(coinId) },
          { $push: { issueIds: issue.insertedId } }
        )
        .then(() => {
          data.issueMap.set(issue.insertedId.toString(), {
            _id: issue.insertedId,
            name,
            price,
            amount,
          });
          data.coinMap.get(coinId).issueIds.push(issue.insertedId.toString());
          res.status(200).json({
            newId: issue.insertedId,
          });
        })
        .catch((err) => {
          console.log(err);
          res
            .status(501)
            .send("Added issue but didn't add its id to coin issue id list!");
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to add issue!");
    });
});

app.post("/editIssue", (req, res) => {
  const { issueId, name, price, amount } = req.body;

  const db = client.db("2Euro");
  const issues = db.collection("Issues");

  issues
    .updateOne(
      { _id: new ObjectId(issueId) },
      {
        $set: {
          name,
          price,
          amount,
        },
      }
    )
    .then((issue) => {
      data.issueMap.set(issueId, {
        _id: new ObjectId(issueId),
        name,
        price,
        amount,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to add issue!");
    });
});

setup().then(
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  })
);
