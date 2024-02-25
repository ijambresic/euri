const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();

const { data, client } = require('../../app');

const getDayMonth = date => {

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const ddmmyyyy = `${day < 10 ? '0' : ''}${day}${month < 10 ? '0' : ''}${month}${year}`;
    const mmyyyy = `${month < 10 ? '0' : ''}${month}${year}`;

    return [ddmmyyyy, mmyyyy];

}

const updateOrder = (req, res, status) => {
    const { id } = req.body;
    const db = client.db("2Euro");
    const orders = db.collection("Orders");
    const issues = db.collection("Issues");

    orders.findOne({ _id: new ObjectId(id) }).then(order => {
        if (!order || order.status !== 'pending') {
            return res.status(400).send('Order isn\'t pending');
        }

        const updateOrderPromises = [];
        const failedIssues = [];

        orders.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status } }
        ).then(() => {
            for (let [issueId, amount] of Object.entries(order.order)) {
                const localIssueId = issueId;
                const localAmount = amount;
                updateOrderPromises.push(
                    issues.updateOne(
                        { _id: new ObjectId(localIssueId) },  // ovo je zakomentirano za sad da se ne skida kolicina issuea iz baze kad se accepta order
                        { $inc: { pending: -localAmount/*, amount: status==='accepted'?-localAmount:0*/ } }
                    ).then(result => {
                        if (result.modifiedCount === 0) {
                            failedIssues.push(localIssueId);
                        }
                    }).catch(error => {
                        console.error(`Error updating order ${localIssueId}:`, error);
                        failedIssues.push(localIssueId);
                    })
                );
                if (status == 'accepted') {
                    const sells = db.collection('Sells');
                    const issue = data.issueMap.get(localIssueId);
                    const coin = data.coinMap.get(issue.coinId);
                    const date = new Date();
                    const [day, month] = getDayMonth(date);

                    sells.findOne({timePeriod: day, coinId: coin._id})
                    .then(result => {
                        if (result === null) {
                            const issueSells = {};
                            issueSells[localIssueId] = localAmount;
                            sells.insertOne({
                                timePeriod: day,
                                coinId: coin._id,
                                issueSells
                            });
                        } else {
                            sells.updateOne(
                                {timePeriod: day, coinId: coin._id},
                                {$inc: { [`issueSells.${localIssueId}`]: localAmount }}
                            )
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });

                    sells.findOne({timePeriod: month, coinId: coin._id})
                    .then(result => {
                        if (result === null) {
                            const issueSells = {};
                            issueSells[localIssueId] = localAmount;
                            sells.insertOne({
                                timePeriod: month,
                                coinId: coin._id,
                                issueSells
                            });
                        } else {
                            sells.updateOne(
                                {timePeriod: month, coinId: coin._id},
                                {$inc: { [`issueSells.${localIssueId}`]: localAmount }}
                            )
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
                }
            }

            Promise.all(updateOrderPromises)
                .then(() => {
                    if (failedIssues.length === 0) {
                        return res.status(200).send('All orders updated successfully');
                    } else {
                        return res.status(400).json({ message: 'Failed to update orders', failedIssues });
                    }
                })
                .catch(error => {
                    console.error('Error updating orders:', error);
                    return res.status(500).send('Internal server error');
                });
        }).catch(err => {
            console.error(err);
            return res.status(500).send(`Failed to ${status}!`);
        });
    }).catch(err => {
        console.error(err);
        return res.status(500).send(`Failed to ${status}!`);
    });
}

router.put("/accept", async (req, res) => {
    updateOrder(req, res, 'accepted');
});

router.put("/decline", async (req, res) => {
    updateOrder(req, res, 'declined');
});

router.put("/changeName", (req, res) => {
    const { id, name } = req.body;

    const db = client.db("2Euro");
    const orders = db.collection("Orders");

    orders.updateOne(
        { _id: new ObjectId(id) },
        { $set: { name: name } }
    ).then(res => {
        return res.sendStatus(200);
    }).catch(err => {
        console.log(err);
        return res.status(500).send("Failed to change name!");
    });
});

module.exports = router;