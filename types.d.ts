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

type Coin = {
  _id: ObjectId;
  code: string;
  name: string;
  src: string;
  countryId: ObjectId;
  yearId: ObjectId;
  issueIds: ObjectId[];
  coinIds: ObjectId[];
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
