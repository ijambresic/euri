import type { ObjectId } from "mongodb";
import { client } from "./app";
import type { Coin, Country, IssuePurchaseHistory, Order, Year } from "../types";

// Documents as stored in MongoDB. Issues keep price/amount as numbers in the
// database, while the in-memory cache (`data.issueMap`) keeps them as strings.
type CoinDoc = Omit<Coin, "_id">;
type CountryDoc = Omit<Country, "_id" | "index">;
type YearDoc = Omit<Year, "_id" | "index">;
type IssueDoc = { name: string; price: number; amount: number; pending: number };
type OrderDoc = Omit<Order, "_id">;
type SellDoc = {
  timePeriod: string;
  coinId: ObjectId;
  issueSells: { [issueId: string]: number };
};

// Looked up on every call so that this module never touches `client` at import
// time (app.ts and the route modules import each other).
const db = () => client.db("2Euro");

export const collections = {
  coins: () => db().collection<CoinDoc>("Coins"),
  countries: () => db().collection<CountryDoc>("Countries"),
  years: () => db().collection<YearDoc>("Years"),
  issues: () => db().collection<IssueDoc>("Issues"),
  orders: () => db().collection<OrderDoc>("Orders"),
  sells: () => db().collection<SellDoc>("Sells"),
  issuePurchases: () => db().collection<IssuePurchaseHistory>("IssuePurchases"),
};
