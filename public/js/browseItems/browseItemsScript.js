var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cart } from "../cart.js";
import { updateNavSelectedItemsWorth, fetchedData, updateCoinListBasedOnFilter, } from "./navigationAndFilterHandlers.js";
import { createIssueHtmlElement, updateItemUiToMatchCart } from "./htmlGenerator.js";
import { getTagInfo } from "./utils.js";
// Global variables
cart.load().then(() => {
    updateNavSelectedItemsWorth();
});
// DOM elements
const iconButtons = document.querySelectorAll(".iconButton");
const sendOrderButton = document.querySelector(".sendOrderButton");
const clearOrderButton = document.querySelector(".clearOrderButton");
// Event listeners
window.addEventListener("resize", () => {
    setItemTextInfoMaxWidth();
});
iconButtons.forEach((iconButton) => {
    iconButton.addEventListener("click", handleIconButtonClick);
});
sendOrderButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    if (cart.getItems().length === 0) {
        console.log("Cart is empty");
        return;
    }
    const error = yield cart.sendOrder();
    if (error) {
        alert("Greška prilikom slanja narudžbe. Pokušajte ponovo.");
        return;
    }
    alert("Narudžba uspješno poslana.");
    cart.clear();
    window.location.reload();
}));
clearOrderButton.addEventListener("click", () => {
    cart.clear();
    window.location.reload();
});
// Event handlers
// Handle button click, call the appropriate function based on the button type
export function handleIconButtonClick(event) {
    var _a;
    const target = event.target;
    const iconButton = target.closest(".iconButton");
    const itemContainer = iconButton === null || iconButton === void 0 ? void 0 : iconButton.closest(".itemContainer");
    if (!itemContainer)
        return;
    const coinItem = itemContainer.querySelector(".item");
    // Get the data about the coin and its issues
    const { coin, issues } = getCoinAndIssuesFromHtmlElement(coinItem);
    if (issues === undefined) {
        console.error("Issues not found in the fetched data or in the cart");
        return;
    }
    // Figure out if the button is an add || remove || dropdown type
    const buttonType = iconButton.dataset.buttonType;
    console.log("buttonType:", buttonType);
    if (buttonType === "add") {
        const issueElement = issues.length > 1 ? iconButton.closest(".issue") : null;
        const issueId = issueElement ? issueElement.id : (_a = issues[0]) === null || _a === void 0 ? void 0 : _a.id;
        const issue = issues.find((issue) => issue.id === issueId);
        if (!issue) {
            console.error("No issue found matching the id");
            return;
        }
        cart.add(coin, issue);
        // Update the UI
        updateItemUiToMatchCart(issueElement || coinItem, issue.id);
        // if it contains multiple issues, update the main item as well
        if (issues.length > 1) {
            updateItemUiToMatchCart(coinItem, issue.id);
        }
        // Update the total price in the nav
        updateNavSelectedItemsWorth();
    }
    else if (buttonType === "remove") {
        // Malo je cudno napravljeno jer se ovdje issue stavlja u .item, i id je id o issue-a, a ne coin-a
        const issueId = coinItem.dataset.issueId;
        if (issueId === undefined) {
            console.error("Issue id not found on the item");
            return;
        }
        const issue = issues.find((issue) => issue.id === issueId);
        if (!issue) {
            console.error("No issue found matching the id");
            return;
        }
        const hasSomeLeft = cart.remove(issue);
        if (!hasSomeLeft) {
            // delete the item from the DOM
            itemContainer.remove();
        }
        else {
            // Update the values on the element
            updateItemUiToMatchCart(coinItem, issue.id);
        }
        // Update the total price in the nav
        updateNavSelectedItemsWorth();
    }
    else if (buttonType === "dropdown") {
        const issuesContainer = itemContainer.querySelector(".issues");
        if (!issuesContainer)
            return;
        if (issuesContainer.innerHTML !== "") {
            issuesContainer.innerHTML = "";
        }
        else {
            // Create coin issue elements
            for (let i = 0; i < issues.length; i++) {
                const issue = createIssueHtmlElement(issues[i]);
                issuesContainer.appendChild(issue);
                if (i === issues.length - 1)
                    issue.style.marginBottom = "1rem";
            }
        }
    }
}
export function handlePrimaryTagClick(event) {
    const tag = event.target.closest(".primary");
    const tagText = tag.textContent;
    if (!tagText)
        return;
    const { id: tagFilterId, type: tagFilterType } = getTagInfo(tagText);
    updateCoinListBasedOnFilter(tagFilterType, tagFilterId);
}
// Functions
function getCoinAndIssuesFromHtmlElement(coinItemHtmlElement) {
    if (!fetchedData) {
        console.error("No fetched data");
        return { coin: undefined, issues: undefined };
    }
    const itemId = coinItemHtmlElement.id;
    // Find the coin data in the fetched data or in the cart
    const coinInFetchedData = fetchedData.coinList.find((coin) => coin._id === itemId);
    if (coinInFetchedData !== undefined) {
        const issueIds = coinInFetchedData.issueIds;
        const issues = issueIds.map((issueId) => fetchedData.issues.get(issueId));
        return { coin: coinInFetchedData, issues };
    }
    else {
        const itemInCart = cart.getItems().find((item) => item.coin._id === itemId);
        if (itemInCart === undefined) {
            console.error("Coin not found in the fetched data or in the cart");
            return { coin: undefined, issues: undefined };
        }
        const issues = [itemInCart.issue];
        return { coin: itemInCart.coin, issues };
    }
}
export function setItemTextInfoMaxWidth() {
    var _a;
    const selectedPage = (_a = document.querySelector(".selected a")) === null || _a === void 0 ? void 0 : _a.id;
    if (selectedPage === undefined)
        return;
    const itemsContainer = document.querySelector(selectedPage === "browseHref" ? "#itemsList" : "#cartList");
    const itemTextInfo = itemsContainer.querySelectorAll(".itemTextInfo");
    const itemTextInfoArray = Array.from(itemTextInfo);
    const item = itemsContainer.querySelector(".item");
    if (item === null)
        return;
    const itemImage = item.querySelector(".itemImage");
    const iconButton = item.querySelector(".iconButton");
    const itemWidth = item.clientWidth || 0;
    const itemImageWidth = (itemImage === null || itemImage === void 0 ? void 0 : itemImage.clientWidth) || 0;
    const iconButtonWidth = (iconButton === null || iconButton === void 0 ? void 0 : iconButton.clientWidth) || 0;
    const maxWidth = itemWidth - itemImageWidth - iconButtonWidth - 64;
    console.log("maxWidth:", maxWidth);
    itemTextInfoArray.forEach((item) => (item.style.maxWidth = `${maxWidth}px`));
}
//# sourceMappingURL=browseItemsScript.js.map