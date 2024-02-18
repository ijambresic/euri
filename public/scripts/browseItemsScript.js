// Global variables
const cart = new Cart();

// DOM elements
const navSelectedItemsWorth = document.querySelector(".navSelectedItemsWorth");
const navigationButtons = document.querySelectorAll("nav a");
const iconButtons = document.querySelectorAll(".iconButton");

// Event listeners
iconButtons.forEach((iconButton) => {
  iconButton.addEventListener("click", handleIconButtonClick);
});
navigationButtons.forEach((button) => {
  button.addEventListener("click", handleNavigationButtonClick);
});

// Event handlers
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
function handleNavigationButtonClick(event) {
  const targetA = event.target;

  navigationButtons.forEach((button) => {
    const parentLi = button.closest("li");
    if (button === targetA) {
      parentLi.classList.add("selected");
    } else {
      parentLi.classList.remove("selected");
    }
  });
}

// Functions
// ovo ne znam jel ispravno koristenje
function getCoinAndIssueFromHtmlElement(coinItemHtmlElement) {
  const itemId = coinItemHtmlElement.id;

  // nabaviti coin and issue od poslanih podataka kojih trenutno nemam

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

function createCoinHtmlElement() {
  // Create the coin element based on this EJS snippet
  /*
    <div class="item" id="<%= item.id %>">
        <img class="itemImage" src="<%= item.imgUrl %>" alt="and">
        <div class="itemTextInfo">

            <p class="title"><%= item.title %></p>
            <div class="tagsContainer">
                <div class="tag"><%= item.subgroup %></div>
                <div class="tag"><%= item.issue %></div>
            </div>
            <div class="priceAndQtyContainer noneSelected">
                <div class="leftSide">
                    <p class="price">€ <%= item.price %></p>
                    <p class="times">x</p>
                    <p class="qty">0 kom</p>
                </div>
                <div class="rightSide">= 0 €</div>
            </div>

        </div>
        <div class="iconButton" data-button-type="add">
            <img src="/images/icons/plus.svg" alt="Add item to cart">
        </div>
    </div>
  */

  // Create the elements
  const item = document.createElement("div");
  const img = document.createElement("img");
  const itemTextInfo = document.createElement("div");

  const title = document.createElement("p");
  const tagsContainer = document.createElement("div");
  const tag1 = document.createElement("div");
  const tag2 = document.createElement("div");
  const priceAndQtyContainer = document.createElement("div");
  const leftSide = document.createElement("div");
  const price = document.createElement("p");
  const times = document.createElement("p");
  const qty = document.createElement("p");
  const rightSide = document.createElement("div");
  const iconButton = document.createElement("div");
  const icon = document.createElement("img");

  // Add classes
  // item.id = "1";
  item.classList.add("item");
  img.classList.add("itemImage");
  itemTextInfo.classList.add("itemTextInfo");
  tagsContainer.classList.add("tagsContainer");
  tag1.classList.add("tag");
  tag2.classList.add("tag");
  priceAndQtyContainer.classList.add("priceAndQtyContainer", "noneSelected");
  leftSide.classList.add("leftSide");
  price.classList.add("price");
  times.classList.add("times");
  qty.classList.add("qty");
  rightSide.classList.add("rightSide");
  iconButton.classList.add("iconButton");

  // Add attributes
  img.src = "/images/coins/AUT1.jpg";
  iconButton.dataset.buttonType = "add";
  icon.src = "/images/icons/plus.svg";
  icon.alt = "Add item to cart";

  // Append elements
  item.appendChild(img);
  item.appendChild(itemTextInfo);
  item.appendChild(iconButton);
  itemTextInfo.appendChild(title);
  itemTextInfo.appendChild(tagsContainer);
  itemTextInfo.appendChild(priceAndQtyContainer);
  tagsContainer.appendChild(tag1);
  tagsContainer.appendChild(tag2);
  priceAndQtyContainer.appendChild(leftSide);
  priceAndQtyContainer.appendChild(rightSide);
  leftSide.appendChild(price);
  leftSide.appendChild(times);
  leftSide.appendChild(qty);
  iconButton.appendChild(icon);

  // Set the text content
  title.textContent = "Trstanski zmaj";
  tag1.textContent = "2007";
  tag2.textContent = "Coincard";
  price.textContent = "€ 12";
  times.textContent = "x";
  qty.textContent = "0 kom";
  rightSide.textContent = "= 0 €";

  // Add event listener to the iconButton
  iconButton.addEventListener("click", handleIconButtonClick);

  return item;
}
