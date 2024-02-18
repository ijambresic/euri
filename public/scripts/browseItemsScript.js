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
    addCoinToCart(coinItem);
  }
}

// Add the selected coin to the cart and recalculate the total price
function addCoinToCart(coinItemHtmlElement) {
  const itemId = coinItemHtmlElement.id;
  const itemPriceElementContent =
    coinItemHtmlElement.querySelector(".price")?.textContent;

  if (!itemPriceElementContent) return;

  const itemPrice = parseFloat(itemPriceElementContent.replace("€", ""));

  console.log("itemId:", itemId);
  console.log("itemPrice:", itemPrice);

  const item = {
    id: itemId,
    price: itemPrice,
  };

  cart.push(item);
  updateItemUiToMatchCart(coinItemHtmlElement);
  recalculateTotalPrice();
}

// Recalculate the total price of the items in the cart and update the UI
function recalculateTotalPrice() {
  const priceSum = cart.reduce((acc, item) => acc + item.price, 0);

  navSelectedItemsWorth.textContent = `€${priceSum}`;
}

function updateItemUiToMatchCart(coinItemHtmlElement) {
  const itemId = coinItemHtmlElement.id;

  const itemsInCart = cart.filter((item) => item.id === itemId);

  // get DOM elements
  const qty = coinItemHtmlElement.querySelector(".qty");
  const sum = coinItemHtmlElement.querySelector(".rightSide");
  const priceAndQtyContainer = coinItemHtmlElement.querySelector(".priceAndQtyContainer");

  // Calculate the values
  const qtyValue = itemsInCart.length;
  const sumValue = itemsInCart.reduce((acc, item) => acc + item.price, 0);

  // Update the DOM
  qty.textContent = `${qtyValue} kom`;
  sum.textContent = `= ${sumValue} €`;

  if (itemsInCart.length === 0) {
    priceAndQtyContainer.classList.add("noneSelected");
  } else {
    priceAndQtyContainer.classList.remove("noneSelected");
  }
}
