import express, { Request, Response } from "express";
import { Collection, MongoClient, ObjectId } from "mongodb";
export const router = express.Router();

import { data, client } from "../../app";
import { Issue } from "../../../types";

const getDayMonth = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const ddmmyyyy = `${day < 10 ? "0" : ""}${day}${month < 10 ? "0" : ""}${month}${year}`;
  const mmyyyy = `${month < 10 ? "0" : ""}${month}${year}`;

  return [ddmmyyyy, mmyyyy];
};

const updateOrder = (req: Request, res: Response, status: string) => {
  const { id } = req.body;
  const db = client.db("2Euro");
  const orders = db.collection("Orders");
  const issues = db.collection("Issues");
  const sells = db.collection("Sells");

  orders
    .findOne({ _id: new ObjectId(id) })
    .then(async (order) => {
      if (!order || order.status !== "pending") {
        return res.status(400).send("Order isn't pending");
      }

      const date = new Date();
      const [day, month] = getDayMonth(date);

      if (status === "accepted") {
        const promises = [];
        const coinIds: Set<string> = new Set();

        for (let issueId in order.order) {
          const issue = data.issueMap.get(issueId) as Issue;
          coinIds.add(issue!.coinId);
        }

        for (let coinId of coinIds) {
          const localCoinId = coinId;

          promises.push(
            ensureSalesRecordExists(day, localCoinId, sells).catch(console.error)
          );
          promises.push(
            ensureSalesRecordExists(month, localCoinId, sells).catch(console.error)
          );
        }

        await Promise.all(promises);
      }

      const updateOrderPromises = [];
      const failedIssues = [];

      orders
        .updateOne({ _id: new ObjectId(id) }, { $set: { status } })
        .then(async () => {
          for (let [issueId, amount] of Object.entries(order.order)) {
            const localIssueId = issueId;
            const localAmount = amount;
            updateOrderPromises.push(
              issues
                .updateOne(
                  { _id: new ObjectId(localIssueId) }, // ovo je zakomentirano za sad da se ne skida kolicina issuea iz baze kad se accepta order
                  {
                    $inc: {
                      pending: -localAmount,
                      amount: status === "accepted" ? -localAmount : 0,
                    },
                  }
                )
                .then((result) => {
                  if (result.modifiedCount === 0) {
                    failedIssues.push(localIssueId);
                  }
                  const li = data.issueMap.get(localIssueId);
                  li!.pending -= localAmount;
                  li!.amount -= status === "accepted" ? localAmount : 0;
                  data.issueMap.set(issueId, li);
                })
                .catch((error) => {
                  console.error(`Error updating order ${localIssueId}:`, error);
                  failedIssues.push(localIssueId);
                })
            );
            if (status == "accepted") {
              const issue = data.issueMap.get(localIssueId);
              const coin = data.coinMap.get(issue.coinId);

              sells
                .findOne({ timePeriod: day, coinId: coin._id })
                .then((result) => {
                  if (result === null) {
                    console.error("Coin not found!");
                  } else {
                    sells.updateOne(
                      { timePeriod: day, coinId: coin._id },
                      { $inc: { [`issueSells.${localIssueId}`]: localAmount } }
                    );
                  }
                })
                .catch((err) => {
                  console.error(err);
                });

              sells
                .findOne({ timePeriod: month, coinId: coin._id })
                .then((result) => {
                  if (result === null) {
                    console.error("Coin not found!");
                  } else {
                    sells.updateOne(
                      { timePeriod: month, coinId: coin._id },
                      { $inc: { [`issueSells.${localIssueId}`]: localAmount } }
                    );
                  }
                })
                .catch((err) => {
                  console.error(err);
                });
            }
          }

          Promise.all(updateOrderPromises)
            .then(() => {
              if (failedIssues.length === 0) {
                console.log(`Order ${id} ${status} successfully`);

                return res.send("All orders updated successfully");
              } else {
                return res
                  .status(400)
                  .json({ message: "Failed to update orders", failedIssues });
              }
            })
            .catch((error) => {
              console.error("Error updating orders:", error);
              return res.status(500).send("Internal server error");
            });
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).send(`Failed to ${status}!`);
        });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).send(`Failed to ${status}!`);
    });
};

router.put("/accept", async (req, res) => {
  updateOrder(req, res, "accepted");
});

router.put("/decline", async (req, res) => {
  updateOrder(req, res, "declined");
});

router.put("/changeName", (req, res) => {
  const { id, name } = req.body;

  if (id === undefined || name === undefined) {
    return res.status(400).send("Bad request, missing parameters id or name");
  }

  const db = client.db("2Euro");
  const orders = db.collection("Orders");

  orders
    .updateOne({ _id: new ObjectId(id) }, { $set: { name: name } })
    .then((result) => {
      return res.send(`${result.modifiedCount} orders updated successfully!`);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send("Failed to change name!");
    });
});

// Functions
async function ensureSalesRecordExists(timePeriod: string, coinId: string, sells: any) {
  const record = await sells.findOne({ timePeriod, coinId: new ObjectId(coinId) });
  if (record === null) {
    await sells.insertOne({
      timePeriod,
      coinId: new ObjectId(coinId),
      issueSells: {},
    });
  }
}
