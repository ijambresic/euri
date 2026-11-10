import express, { Request, Response } from "express";
import { asyncHandler } from "../../asyncHandler";
import { ObjectId } from "mongodb";
export const router = express.Router();

import { data } from "../../app";
import { collections } from "../../db";

const getDayMonth = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const ddmmyyyy = `${day < 10 ? "0" : ""}${day}${month < 10 ? "0" : ""}${month}${year}`;
  const mmyyyy = `${month < 10 ? "0" : ""}${month}${year}`;

  return [ddmmyyyy, mmyyyy] as const;
};

const updateOrder = async (req: Request, res: Response, status: "accepted" | "declined") => {
  const { id } = req.body;

  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return res.status(400).send("Bad request, missing or invalid order id");
  }

  const orders = collections.orders();
  const issues = collections.issues();
  const sells = collections.sells();
  const accepted = status === "accepted";

  try {
    const order = await orders.findOne({ _id: new ObjectId(id) });

    if (!order || order.status !== "pending") {
      return res.status(400).send("Order isn't pending");
    }

    const items = Object.entries(order.order).map(([issueId, amount]) => ({
      issueId,
      amount: Number(amount),
      coinId: data.issueMap.get(issueId)?.coinId,
    }));

    const [day, month] = getDayMonth(new Date());

    if (accepted) {
      // Sales are recorded per coin, so every issue has to lead to a known coin
      // before anything is written.
      const coinIds = new Set<string>();
      for (const item of items) {
        if (!item.coinId || !data.coinMap.has(item.coinId)) {
          return res.status(400).send(`Order contains an unknown issue: ${item.issueId}`);
        }
        coinIds.add(item.coinId);
      }

      await Promise.all(
        [...coinIds].flatMap((coinId) => [
          ensureSalesRecordExists(day, coinId).catch(console.error),
          ensureSalesRecordExists(month, coinId).catch(console.error),
        ]),
      );
    }

    await orders.updateOne({ _id: order._id }, { $set: { status } });

    const failedIssues: string[] = [];

    await Promise.all(
      items.map(async ({ issueId, amount, coinId }) => {
        try {
          const result = await issues.updateOne(
            { _id: new ObjectId(issueId) },
            { $inc: { pending: -amount, amount: accepted ? -amount : 0 } },
          );
          if (result.modifiedCount === 0) failedIssues.push(issueId);

          const cached = data.issueMap.get(issueId);
          if (cached) {
            cached.pending -= amount;
            if (accepted) cached.amount = String(Number(cached.amount) - amount);
          } else {
            failedIssues.push(issueId);
          }
        } catch (error) {
          console.error(`Error updating order ${issueId}:`, error);
          failedIssues.push(issueId);
        }

        if (accepted && coinId) {
          for (const timePeriod of [day, month]) {
            try {
              const result = await sells.updateOne(
                { timePeriod, coinId: new ObjectId(coinId) },
                { $inc: { [`issueSells.${issueId}`]: amount } },
              );
              if (result.matchedCount === 0) console.error("Coin not found!");
            } catch (err) {
              console.error(err);
            }
          }
        }
      }),
    );

    if (failedIssues.length > 0) {
      return res.status(400).json({ message: "Failed to update orders", failedIssues });
    }

    console.log(`Order ${id} ${status} successfully`);

    return res.send("All orders updated successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).send(`Failed to ${status}!`);
  }
};

router.put("/accept", asyncHandler((req, res) => updateOrder(req, res, "accepted")));

router.put("/decline", asyncHandler((req, res) => updateOrder(req, res, "declined")));

router.put("/changeName", asyncHandler(async (req, res) => {
  const { id, name } = req.body;

  if (id === undefined || name === undefined) {
    return res.status(400).send("Bad request, missing parameters id or name");
  }
  if (typeof id !== "string" || !ObjectId.isValid(id) || typeof name !== "string") {
    return res.status(400).send("Bad request, invalid parameters id or name");
  }

  try {
    const result = await collections
      .orders()
      .updateOne({ _id: new ObjectId(id) }, { $set: { name } });
    return res.send(`${result.modifiedCount} orders updated successfully!`);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Failed to change name!");
  }
}));

// Functions
async function ensureSalesRecordExists(timePeriod: string, coinId: string) {
  const sells = collections.sells();
  const record = await sells.findOne({ timePeriod, coinId: new ObjectId(coinId) });
  if (record === null) {
    await sells.insertOne({
      timePeriod,
      coinId: new ObjectId(coinId),
      issueSells: {},
    });
  }
}
