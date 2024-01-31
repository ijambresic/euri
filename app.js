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
    }

    const database = client.db('2Euro');
    const countryCollection = database.collection('Countries');
    const yearCollection = database.collection('Years');
    const coinCollection = database.collection('Coins');
    const issueCollection = database.collection('Issues');

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
        data.coinMap.set(coin._id.toString(), coin);
    }

    const issueList = await issueCollection.find().toArray();
    for (issue of issueList) {
        data.issueList.set(issue._id.toString(), issue);
    }

}

app.get('/', (req, res) => {
    const countries = [];
    for (country of data.countryList) countries.push(data.countryMap.get(country[1]));
    res.render('countries', { countries })
});

app.get('/years', (req, res) => {
    const years = [];
    for (year of data.yearList) years.push(data.yearMap.get(year[1]));
    res.render('years', { years });
});

const cmpTitle = (a, b) => {
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
    return 0;
}

app.get('/coins/country/:countryTLA', (req, res) => {
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

    res.render('coins', { filter: country.name, coinList });
});

app.get('/coins/year/:year', async (req, res) => {
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

    res.render('coins', { filter: year.name, coinList });
});

setup()
    .then(
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        })
    );