import { Cart } from "../cart.js";

// Global variables
const cart = new Cart();
cart.load().then(() => {
  updateNavSelectedItemsWorth(cart.getPrice());
});

// DOM elements
const iconButtons = document.querySelectorAll(".iconButton");
const sendOrderButton = document.querySelector(".sendOrderButton");
const clearOrderButton = document.querySelector(".clearOrderButton");

// Event listeners
window.addEventListener("resize", () => {
  // if()
  setItemTextInfoMaxWidth();
});
iconButtons.forEach((iconButton) => {
  iconButton.addEventListener("click", handleIconButtonClick);
});
sendOrderButton.addEventListener("click", async () => {
  if (cart.getItems().length === 0) {
    console.log("Cart is empty");
    return;
  }

  const error = await cart.sendOrder();

  if (error) {
    console.error("Error while sending the order");
    return;
  }

  console.log("Order sent successfully");
  cart.clear();
  // refresh page
  window.location.reload();
});
clearOrderButton.addEventListener("click", () => {
  cart.clear();
  // refresh page
  window.location.reload();
});

// Event handlers

// Handle button click, call the appropriate function based on the button type
function handleIconButtonClick(event) {
  const iconButton = event.target.closest(".iconButton");
  const itemContainer = iconButton.closest(".itemContainer");

  if (itemContainer === null) return;

  const coinItem = itemContainer.querySelector(".item");

  // Get the data about the coin and its issues
  const { coin, issues } = getCoinAndIssuesFromHtmlElement(coinItem);

  // Figure out if the button is an add || remove || dropdown type
  const buttonType = iconButton.dataset.buttonType;
  console.log("buttonType:", buttonType);

  if (buttonType === "add") {
    const issueElement = issues.length > 1 ? iconButton.closest(".issue") : undefined;
    const issueId = issueElement ? issueElement.id : issues[0].id;

    const issue = issues.find((issue) => issue.id === issueId);

    cart.add(coin, issue);

    // Update the UI
    updateItemUiToMatchCart(issueElement || coinItem, issue.id);

    // Update the total price in the nav
    updateNavSelectedItemsWorth(cart.getPrice());
  } else if (buttonType === "remove") {
    // Malo je cudno napravljeno jer se ovdje issue stavlja u .item, i id je id o issue-a, a ne coin-a
    const issueId = coinItem.dataset.issueId;

    if (issueId === undefined) {
      console.error("Issue id not found on the item");
      return;
    }

    const issue = issues.find((issue) => issue.id === issueId);

    const hasSomeLeft = cart.remove(issue);

    if (!hasSomeLeft) {
      // delete the item from the DOM
      itemContainer.remove();
    } else {
      // Update the values on the element
      updateItemUiToMatchCart(coinItem, issue.id);
    }

    // Update the total price in the nav
    updateNavSelectedItemsWorth(cart.getPrice());
  } else if (buttonType === "dropdown") {
    const issuesContainer = itemContainer.querySelector(".issues");

    if (issuesContainer.innerHTML !== "") {
      issuesContainer.innerHTML = "";
    } else {
      // Create coin issue elements
      for (let i = 0; i < issues.length; i++) {
        const issue = createIssueHtmlElement(issues[i]);

        issuesContainer.appendChild(issue);

        if (i === issues.length - 1) issue.style.marginBottom = "1rem";
      }
    }
  }
}
function handlePrimaryTagClick(event) {
  const tag = event.target.closest(".primary");
  const tagText = tag.textContent;

  const { id: tagFilterId, type: tagFilterType } = getTagInfo(tagText);

  updateCoinListBasedOnFilter(tagFilterType, tagFilterId);
}

// Functions
function getCoinAndIssuesFromHtmlElement(coinItemHtmlElement) {
  if (fetchedData === null) {
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
  } else {
    const itemInCart = cart.getItems().find((item) => item.coin._id === itemId);

    if (itemInCart === undefined) {
      console.error("Coin not found in the fetched data or in the cart");
      return { coin: undefined, issues: undefined };
    }

    const issues = [itemInCart.issue];
    return { coin: itemInCart.coin, issues };
  }
}

function setItemTextInfoMaxWidth() {
  const selectedPage = document.querySelector(".selected a").id;

  const itemsContainer = document.querySelector(
    selectedPage === "browseHref" ? "#itemsList" : "#cartList"
  );

  const itemTextInfo = itemsContainer.querySelectorAll(".itemTextInfo");
  const itemTextInfoArray = Array.from(itemTextInfo);

  const item = itemsContainer.querySelector(".item");

  if (item === null) return;

  const itemImage = item.querySelector(".itemImage");
  const iconButton = item.querySelector(".iconButton");

  const itemWidth = item.clientWidth;
  const itemImageWidth = itemImage.clientWidth;
  const iconButtonWidth = iconButton.clientWidth;
  const maxWidth = itemWidth - itemImageWidth - iconButtonWidth - 64;

  console.log("maxWidth:", maxWidth);
  itemTextInfoArray.forEach((item) => (item.style.maxWidth = `${maxWidth}px`));
}
