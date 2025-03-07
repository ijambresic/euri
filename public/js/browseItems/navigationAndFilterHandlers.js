var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createCoinHtmlElement, renderCartListFromCart } from "./htmlGenerator.js";
import { setItemTextInfoMaxWidth } from "./browseItemsScript.js";
import { getCountryFromId, getYearFromId } from "./utils.js";
const adminNavigation = document.querySelector(".adminNavigation");
const titleButton = document.querySelector(".titleButton");
const navigationButtons = document.querySelectorAll("nav a");
const navSelectedItemsWorth = document.querySelector(".navSelectedItemsWorth");
const priceAndSendButton = document.getElementById("priceAndSendButton");
const cartSum = priceAndSendButton.querySelector(".cartSum");
const filterDropdowns = document.querySelectorAll(".filtersContainer select");
const itemsList = document.getElementById("itemsList");
const cartList = document.getElementById("cartList");
export let fetchedData = null;
titleButton.addEventListener("click", showAdminNavigation);
navigationButtons.forEach((button) => {
    button.addEventListener("click", handleNavigationButtonClick);
});
filterDropdowns.forEach((dropdown) => {
    dropdown.addEventListener("click", handleFilterDropdownChange);
});
function showAdminNavigation() {
    adminNavigation.classList.toggle("hidden");
}
function handleNavigationButtonClick(event) {
    const targetA = event.target;
    navigationButtons.forEach((button) => {
        const parentLi = button.closest("li");
        if (button === targetA) {
            parentLi.classList.add("selected");
        }
        else {
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
    }
    else {
        itemsList.style.display = "none";
        cartList.style.display = "flex";
        priceAndSendButton.style.display = "flex";
        renderCartListFromCart();
    }
    setItemTextInfoMaxWidth();
}
function handleFilterDropdownChange(event) {
    const dropdownElement = event.target;
    if (dropdownElement.value === "")
        return;
    const filterType = dropdownElement.id === "countryDropdown" ? "country" : "year";
    const filterValue = dropdownElement.value;
    updateCoinListBasedOnFilter(filterType, filterValue);
}
// FUNCTIONS
export function updateCoinListBasedOnFilter(filterType, filterValue) {
    return __awaiter(this, void 0, void 0, function* () {
        // fetch the data from the server
        fetchedData = yield fetchCoins(filterType, filterValue);
        console.log(fetchedData);
        // Clear the itemsList
        itemsList.innerHTML = "";
        // Parse the new items and prepare for creating HTML elements
        const coinElementData = fetchedData.coinList
            .map((coin) => {
            const subgroup = filterType === "year"
                ? getCountryFromId(coin.countryId)
                : getYearFromId(coin.yearId);
            if (subgroup === undefined) {
                console.error("Subgroup not found");
                return null;
            }
            return {
                id: coin._id,
                imgSrc: coin.src,
                name: coin.name,
                subgroup: subgroup,
                issueList: coin.issueIds.map((issueId) => fetchedData === null || fetchedData === void 0 ? void 0 : fetchedData.issues.get(issueId)),
            };
        })
            .filter((coinData) => coinData !== null)
            .sort((a, b) => a.subgroup.localeCompare(b.subgroup));
        // Add the new items
        coinElementData.forEach((coinData) => {
            const coinItemHtmlElement = createCoinHtmlElement(coinData);
            if (coinItemHtmlElement !== undefined) {
                itemsList.appendChild(coinItemHtmlElement);
            }
        });
        // set the filter dropdown to match the selected value
        setDropdownValues(filterType, filterValue);
        // Set the max width of the itemTextInfo elements
        setItemTextInfoMaxWidth();
    });
}
function fetchCoins(filterType, filterValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`/coins/${filterType}/${filterValue}`);
        if (!response.ok) {
            throw new Error("Failed to fetch the data");
        }
        const data = yield response.json();
        // Convert the issues object to a Map
        data.issues = new Map(Object.entries(data.issues));
        return data;
    });
}
export function updateNavSelectedItemsWorth(value) {
    navSelectedItemsWorth.textContent = `€${value}`;
    cartSum.textContent = `Total: €${value}`;
}
function setDropdownValues(filterType, filterValue) {
    // set the selected dropdown to the selected value
    const selectedDropdownId = filterType === "country" ? "countryDropdown" : "yearDropdown";
    const selectedDropdownElement = document.getElementById(selectedDropdownId);
    selectedDropdownElement.value = filterValue;
    // Set the other dropdown to the default value
    const otherDropdownId = filterType === "country" ? "yearDropdown" : "countryDropdown";
    const otherDropdownElement = document.getElementById(otherDropdownId);
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
//# sourceMappingURL=navigationAndFilterHandlers.js.map