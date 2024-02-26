import { createCoinHtmlElement, renderCartListFromCart } from "./htmlGenerator.js";
import { setItemTextInfoMaxWidth } from "./browseItemsScript.js";
import { getCountryFromId, getYearFromId } from "./utils.js";
import { Coin, IssueOnClient } from "../../../types.js";

const navigationButtons = document.querySelectorAll("nav a")!;
const navSelectedItemsWorth = document.querySelector(".navSelectedItemsWorth")!;
const priceAndSendButton = document.getElementById("priceAndSendButton")!;
const cartSum = priceAndSendButton.querySelector(".cartSum")!;
const filterDropdowns = document.querySelectorAll(
  ".filtersContainer select"
)! as NodeListOf<HTMLSelectElement>;

const itemsList = document.getElementById("itemsList")!;
const cartList = document.getElementById("cartList")!;

export let fetchedData: {
  filter: string;
  coinList: Coin[];
  issues: Map<string, IssueOnClient>;
} | null = null;

navigationButtons.forEach((button) => {
  button.addEventListener("click", handleNavigationButtonClick);
});
filterDropdowns.forEach((dropdown) => {
  dropdown.addEventListener("change", handleFilterDropdownChange);
});

function handleNavigationButtonClick(event: Event) {
  const targetA = event.target as HTMLAnchorElement;

  navigationButtons.forEach((button) => {
    const parentLi = button.closest("li") as HTMLLIElement;

    if (button === targetA) {
      parentLi.classList.add("selected");
    } else {
      parentLi.classList.remove("selected");
    }
  });

  const selectedPage = targetA.id === "browseHref" ? "browse" : "cart";

  if (selectedPage === "browse") {
    itemsList.style.display = "flex";
    cartList.style.display = "none";
    priceAndSendButton.style.display = "none";

    const { filterType, filterValue } = getCurrentFilterFromDropdowns();

    if (!["year", "country"].includes(filterType) || filterValue === "") {
      console.error("Invalid filter type or value");
      return;
    }

    updateCoinListBasedOnFilter(filterType, filterValue);
  } else {
    itemsList.style.display = "none";
    cartList.style.display = "flex";
    priceAndSendButton.style.display = "flex";

    renderCartListFromCart();
  }

  setItemTextInfoMaxWidth();
}
function handleFilterDropdownChange(event: Event) {
  const dropdownElement = event.target as HTMLSelectElement;

  if (dropdownElement.value === "") return;

  const filterType = dropdownElement.id === "countryDropdown" ? "country" : "year";
  const filterValue = dropdownElement.value;

  updateCoinListBasedOnFilter(filterType, filterValue);
}

// FUNCTIONS
export async function updateCoinListBasedOnFilter(
  filterType: "year" | "country",
  filterValue: string
) {
  // fetch the data from the server
  fetchedData = await fetchCoins(filterType, filterValue);
  console.log(fetchedData);

  // Clear the itemsList
  itemsList.innerHTML = "";

  // Add the new items
  fetchedData.coinList.forEach((coin) => {
    const subgroup =
      filterType === "year"
        ? getCountryFromId(coin.countryId)
        : getYearFromId(coin.yearId);

    if (subgroup === undefined) {
      console.error("Subgroup not found");
      return;
    }

    const coinData = {
      id: coin._id as string,
      imgSrc: coin.src,
      name: coin.name,
      subgroup: subgroup,
      issueList: coin.issueIds.map((issueId) =>
        fetchedData?.issues.get(issueId)
      ) as IssueOnClient[],
    };

    const coinItemHtmlElement = createCoinHtmlElement(coinData);

    if (coinItemHtmlElement !== undefined) {
      itemsList.appendChild(coinItemHtmlElement);
    }
  });

  // set the filter dropdown to match the selected value
  setDropdownValues(filterType, filterValue);

  // Set the max width of the itemTextInfo elements
  setItemTextInfoMaxWidth();
}

async function fetchCoins(filterType: "year" | "country", filterValue: string) {
  const response = await fetch(`/coins/${filterType}/${filterValue}`);

  if (!response.ok) {
    throw new Error("Failed to fetch the data");
  }

  const data = await response.json();

  // Convert the issues object to a Map
  data.issues = new Map(Object.entries(data.issues));

  return data as {
    filter: string;
    coinList: Coin[];
    issues: Map<string, IssueOnClient>;
  };
}

export function updateNavSelectedItemsWorth(value: number) {
  navSelectedItemsWorth.textContent = `€${value}`;
  cartSum.textContent = `Total: €${value}`;
}

function setDropdownValues(filterType: "year" | "country", filterValue: string) {
  // set the selected dropdown to the selected value
  const selectedDropdownId =
    filterType === "country" ? "countryDropdown" : "yearDropdown";

  const selectedDropdownElement = document.getElementById(
    selectedDropdownId
  ) as HTMLSelectElement;

  selectedDropdownElement.value = filterValue;

  // Set the other dropdown to the default value
  const otherDropdownId = filterType === "country" ? "yearDropdown" : "countryDropdown";
  const otherDropdownElement = document.getElementById(
    otherDropdownId
  ) as HTMLSelectElement;

  otherDropdownElement.value = "";
}

function getCurrentFilterFromDropdowns() {
  const dropdown = [...filterDropdowns].find((dropdown) => dropdown.value);

  if (dropdown) {
    const filterType = dropdown.id === "countryDropdown" ? "country" : "year";
    const filterValue = dropdown.value;
    return { filterType, filterValue };
  }

  return { filterType: "", filterValue: "" };
}
