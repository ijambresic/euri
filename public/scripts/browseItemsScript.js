const cart = new Cart();

const navSelectedItemsWorth = document.querySelector(".navSelectedItemsWorth");
const iconButtons = document.querySelectorAll(".iconButton");

iconButtons.forEach((iconButton) => {
  iconButton.addEventListener("click", handleIconButtonClick);
});

// Handle button click, call the appropriate function based on the button type
function handleIconButtonClick(event) {
  const iconButton = event.target.closest(".iconButton");

  if (iconButton === null) return;

  const coinItem = iconButton.closest(".item");

  if (coinItem === null) return;

  // Figure out if the button is an add || remove || dropdown type
  const buttonType = iconButton.dataset.buttonType;

  console.log("buttonType:", buttonType);

  if (buttonType === "add") {
    const { coin, issue } = getCoinAndIssueFromHtmlElement(coinItem);
    // cart.add(coin, issue);
  } else if (buttonType === "remove") {
  } else if (buttonType === "dropdown") {
  }

  updateItemUiToMatchCart(coinItemHtmlElement);

  // Update the total price in the nav
  navSelectedItemsWorth.textContent = `€${cart.getPrice()}`;
}

// ovo ne znam jel ispravno koristenje
function getCoinAndIssueFromHtmlElement(coinItemHtmlElement) {
  const itemId = coinItemHtmlElement.id;

  // ne znam jel ovo valja..
  const issue = cart.getIssue(itemId);
  const coin = issue.coin;

  return { coin, issue };
}

function updateItemUiToMatchCart(coinItemHtmlElement) {
  const itemId = coinItemHtmlElement.id;

  const issue = cart.getIssue(itemId);

  // get DOM elements
  const qty = coinItemHtmlElement.querySelector(".qty");
  const sum = coinItemHtmlElement.querySelector(".rightSide");
  const priceAndQtyContainer = coinItemHtmlElement.querySelector(".priceAndQtyContainer");

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
