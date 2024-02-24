const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();

const { data, client } = require('../../app');

function updateOrder(req, res, status) {
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
                updateOrderPromises.push(
                    issues.updateOne(
                        { _id: new ObjectId(issueId) },  // ovo je zakomentirano za sad da se ne skida kolicina issuea iz baze kad se accepta order
                        { $inc: { pending: -amount/*, amount: status==='accepted'?-amount:0*/ } }
                    ).then(result => {
                        if (result.modifiedCount === 0) {
                            failedIssues.push(issueId);
                        }
                    }).catch(error => {
                        console.error(`Error updating order ${issueId}:`, error);
                        failedIssues.push(issueId);
                    })
                );
            }

            Promise.all(updateOrderPromises)
                .then(() => {
                    if (failedIssues.length === 0) {
                        res.status(200).send('All orders updated successfully');
                    } else {
                        res.status(400).json({ message: 'Failed to update orders', failedIssues });
                    }
                })
                .catch(error => {
                    console.error('Error updating orders:', error);
                    res.status(500).send('Internal server error');
                });
        }).catch(err => {
            console.error(err);
            res.status(500).send(`Failed to ${status}!`);
        });
    }).catch(err => {
        console.error(err);
        res.status(500).send(`Failed to ${status}!`);
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
        res.sendStatus(200);
    }).catch(err => {
        console.log(err);
        res.status(500).send("Failed to change name!");
    });
});

module.exports = router;