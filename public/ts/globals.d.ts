import type { Chart as ChartJs } from "chart.js";
import type { CoinOnClient, CountryList, YearList } from "../../types";

// Values that the EJS templates define in an inline <script> before the modules
// load, plus Chart.js, which edit.ejs loads from a CDN.
declare global {
  const countryList: CountryList;
  const yearList: YearList;

  // edit.ejs only
  const issueMap: Map<string, { name: string; price: string; amount: string }>;
  const groupList: { group: [string, string]; coins: CoinOnClient[] }[];
  const Chart: typeof ChartJs;
}
