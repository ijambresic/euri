const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

const uri = 'mongodb+srv://ivanjambresic:gOUKpOa3zjrfPiMr@cluster0.3h9h6dr.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

client.connect();

app.get('/', async (req, res) => {
    const database = client.db('2Euro');
    const collection = database.collection('Countries');

    const countries = await collection.find().toArray();

    res.render('countries', { countries });
});

app.get('/years', async (req, res) => {
    const database = client.db('2Euro');
    const collection = database.collection('Years');

    const years = await collection.find().toArray();

    res.render('years', { years });
});

app.get('/coins/country/:countryTLA', async (req, res) => {
    const database = client.db('2Euro');
    const collection = database.collection('Countries');
    const yearCollection = database.collection('Years');
    const TLA = req.params.countryTLA;

    const country = await collection.findOne({ TLA: TLA });
    const coinIds = country.coinIds;

    const coinCollection = database.collection('Coins');
    const coinList = [];

    for (id of coinIds) {
        const coin = await coinCollection.findOne({ _id: id });
        const year = await yearCollection.findOne({ _id: coin.yearId});
        coin.title = year.name;
        coinList.push(coin);
    }

    res.render('coins', { filter: country.name, coinList });
});

app.get('/coins/year/:year', async (req, res) => {
    const database = client.db('2Euro');
    const collection = database.collection('Years');
    const countryCollection = database.collection('Countries');
    const year = req.params.year;

    const yr = await collection.findOne({ name: year });
    const coinIds = yr.coinIds;

    const coinCollection = database.collection('Coins');
    const coinList = [];

    for (id of coinIds) {
        const coin = await coinCollection.findOne({ _id: id });
        const country = await countryCollection.findOne({ _id: coin.countryId });
        coin.title = country.name;
        coinList.push(coin);
    }

    res.render('coins', { filter: yr.name, coinList });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});