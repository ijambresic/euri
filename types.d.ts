import { ObjectId } from "mongodb";

type YearList = [string, string][];

type CountryList = [string, string][];

type Issue = {
  _id: ObjectId;
  name: string;
  price: string;
  amount: string;
  pending: number;
  coinId: string;
};
type Purchase = {
  id: string;
  seller: string;
  quantity: number;
  unitPriceCents: number;
  date: string;
};
type IssuePurchaseHistory = {
  _id: ObjectId;
  purchases: Purchase[];
};

type Coin = {
  _id: ObjectId;
  code: string;
  name: string;
  src: string;
  countryId: ObjectId;
  yearId: ObjectId;
  issueIds: ObjectId[];
};

type Country = {
  _id: ObjectId;
  name: string;
  TLA: string;
  coinIds: ObjectId[];
  index: number;
};
type Year = {
  _id: ObjectId;
  name: string;
  coinIds: ObjectId[];
  index: number;
};

type CartItem = {
  coin: Coin;
  issue: IssueOnClient;
  amount: number;
  total: number;
};

// Issue without the
type IssueOnClient = {
  id: string;
  limit: number;
  name: string;
  price: string;
};

type Order = {
  _id: ObjectId;
  name: string;
  date: Date;
  status: string;
  total: number;
  order: { [issueId: string]: number };
};

// Shapes as the browser sees them: JSON turns every ObjectId into a string.
type CoinOnClient = Omit<Coin, "_id" | "countryId" | "yearId" | "issueIds"> & {
  _id: string;
  countryId: string;
  yearId: string;
  issueIds: string[];
  subgroup?: string;
};
type CartItemOnClient = Omit<CartItem, "coin"> & { coin: CoinOnClient };
