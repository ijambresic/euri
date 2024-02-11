const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());

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
        data.issueMap.set(issue._id.toString(), issue);
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

app.get('/coins/year/:year', (req, res) => {
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

app.get('/edit', (req, res) => {

    let groupBy = req.query.group_by;
    if (groupBy === undefined) groupBy = 'countries';
    const coinList = [];

    if (groupBy === 'countries') {
        for (country of data.countryList) {
            const coins = {
                group: country,
                coins: [],
            };
            const countryId = country[1];
            for (coinId of data.countryMap.get(countryId).coinIds) {
                const coin = data.coinMap.get(coinId.toString());
                coin.subgroup = data.yearMap.get(coin.yearId.toString()).name;
                coins.coins.push(coin);
            }
            coinList.push(coins);
        }
    }

    if (groupBy === 'years') {
        for (year of data.yearList) {
            const coins = {
                group: year,
                coins: [],
            };
            const yearId = year[1];
            for (coinId of data.yearMap.get(yearId).coinIds) {
                const coin = data.coinMap.get(coinId.toString());
                coin.subgroup = data.countryMap.get(coin.countryId.toString()).name;
                coins.coins.push(coin);
            }
            coinList.push(coins);
        }
    }

    const countryList = data.countryList;
    const yearList = data.yearList;
    const issueMap = data.issueMap;

    res.render('edit', { coinList, countryList, yearList, issueMap });
});

app.post('/addCoin', (req, res) => {

    const { countryId, yearId, name, src } = req.body;
    
    const country = data.countryMap.get(countryId);
    const code = country.TLA + (country.coinIds.length + 1);

    const db = client.db('2Euro');
    const coins = db.collection('Coins');
    const countries = db.collection('Countries');
    const years = db.collection('Years');

    coins.insertOne({
        code,
        name,
        src,
        countryId,
        yearId,
        issueIds: []
    }).then(coin => {
        Promise.all([
            countries.updateOne({_id:new ObjectId(countryId)}, {$push: {coinIds: coin.insertedId}}),
            years.updateOne({_id:new ObjectId(yearId)}, {$push: {coinIds: coin.insertedId}})
        ]).then(() => {
            data.coinMap.set(coin.insertedId.toString(), {
                _id: coin.insertedId,
                code,
                name,
                src,
                countryId,
                yearId,
                issueIds: []
            });
            data.countryMap.get(countryId).coinIds.push(coin.insertedId.toString());
            data.yearMap.get(yearId).coinIds.push(coin.insertedId.toString());
            res.sendStatus(200);
        }).catch(err => {
            console.log(err);
            res.status(501).send('Added coin but didn\'t add its id to year and/or country coin id list!');
        });
    }).catch(err => {
        console.log(err);
        res.status(500).send('Failed to add coin!');
    });

});

app.post('/addIssue', (req, res) => {

    const { coinId, name, price, amount } = req.body;

    const db = client.db('2Euro');
    const coins = db.collection('Coins');
    const issues = db.collection('Issues');

    issues.insertOne({
        name,
        price,
        amount
    }).then(issue => {
        coins.updateOne({_id:new ObjectId(coinId)}, {$push: {issueIds: issue.insertedId}})
        .then(() => {
            data.issueMap.set(issue.insertedId.toString(), {
                _id: issue.insertedId,
                name,
                price,
                amount
            });
            data.coinMap.get(coinId).issueIds.push(issue.insertedId.toString());
            res.status(200).json({
                newId: issue.insertedId
            });
        }).catch(err => {
            console.log(err);
            res.status(501).send('Added issue but didn\'t add its id to coin issue id list!');
        });
    }).catch(err => {
        console.log(err);
        res.status(500).send('Failed to add issue!');
    });

});

app.post('/editIssue', (req, res) => {

    const { issueId, name, price, amount } = req.body;

    const db = client.db('2Euro');
    const issues = db.collection('Issues');

    issues.updateOne({_id: new ObjectId(issueId)}, { $set: {
        name,
        price,
        amount
    }}).then(issue => {
        data.issueMap.set(issueId, {
            _id: new ObjectId(issueId),
            name,
            price,
            amount
        });
    }).catch(err => {
        console.log(err);
        res.status(500).send('Failed to add issue!');
    });

});

setup()
    .then(
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        })
    );