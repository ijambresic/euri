// Global variables
const cart = new Cart();

// DOM elements

const iconButtons = document.querySelectorAll(".iconButton");

// Event listeners
window.addEventListener("resize", setItemTextInfoMaxWidth);
iconButtons.forEach((iconButton) => {
  iconButton.addEventListener("click", handleIconButtonClick);
});

// Event handlers

// Handle button click, call the appropriate function based on the button type
function handleIconButtonClick(event) {
  const iconButton = event.target.closest(".iconButton");

  const itemContainer = iconButton.closest(".itemContainer");
  const coinItem = itemContainer.querySelector(".item");

  if (coinItem === null) return;

  // Figure out if the button is an add || remove || dropdown type
  const buttonType = iconButton.dataset.buttonType;

  console.log("buttonType:", buttonType);

  const { coin, issues } = getCoinAndIssuesFromHtmlElement(coinItem);

  if (buttonType === "add") {
    const issueElement = iconButton.closest(".issue");
    const issueId = issueElement.id;
    const issue = issues.find((issue) => issue.id === issueId);
    cart.add(coin, issue);

    // print cart items
    console.log(cart.getItems());

    // Update the UI
    updateItemUiToMatchCart(issueElement);

    // Update the total price in the nav
    updateNavSelectedItemsWorth(cart.getPrice());
  } else if (buttonType === "remove") {
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

// Functions
// ovo ne znam jel ispravno koristenje
function getCoinAndIssuesFromHtmlElement(coinItemHtmlElement) {
  if (fetchedData === null) {
    console.error("No fetched data");
    return { coin: undefined, issues: undefined };
  }

  const itemId = coinItemHtmlElement.id;

  const coin = fetchedData.coinList.find((coin) => coin._id === itemId);

  if (coin === undefined) {
    console.error("Coin not found in the fetched data");
    return { coin: undefined, issues: undefined };
  }

  const issueIds = coin.issueIds;
  const issues = issueIds.map((issueId) => fetchedData.issues.get(issueId));

  return { coin, issues };
}

function updateItemUiToMatchCart(HtmlElement) {
  // trenutno radi za issue, ako ce coin dobit plus nece radit dobro

  const itemId = HtmlElement.id;

  const issue = cart.getIssue(itemId);

  // get DOM elements
  const qty = HtmlElement.querySelector(".qty");
  const sum = HtmlElement.querySelector(".rightSide");
  const priceAndQtyContainer = HtmlElement.querySelector(".priceAndQtyContainer");

  // Get the values
  const qtyValue = issue?.amount || 0;
  const sumValue = issue?.total || 0;

  // Update the DOM
  qty.textContent = `${qtyValue} kom`;
  sum.textContent = `= ${sumValue} €`;

  // Toggle the priceAndQtyContainer .noneSelected class
  if (issue === undefined) {
    priceAndQtyContainer.classList.add("noneSelected");
  } else {
    priceAndQtyContainer.classList.remove("noneSelected");
  }
}
function setItemTextInfoMaxWidth() {
  const itemTextInfo = document.querySelectorAll(".itemTextInfo");
  const itemTextInfoArray = Array.from(itemTextInfo);

  const item = document.querySelector(".item");
  const itemImage = item.querySelector(".itemImage");
  const iconButton = item.querySelector(".iconButton");

  const itemWidth = item.clientWidth;
  const itemImageWidth = itemImage.clientWidth;
  const iconButtonWidth = iconButton.clientWidth;
  const maxWidth = itemWidth - itemImageWidth - iconButtonWidth - 64;

  console.log("maxWidth:", maxWidth);
  itemTextInfoArray.forEach((item) => (item.style.maxWidth = `${maxWidth}px`));
}
