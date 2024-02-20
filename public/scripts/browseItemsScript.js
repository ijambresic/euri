// Global variables
const cart = new Cart();
let fetchedData = null;

// DOM elements
const navSelectedItemsWorth = document.querySelector(".navSelectedItemsWorth");
const navigationButtons = document.querySelectorAll("nav a");
const iconButtons = document.querySelectorAll(".iconButton");
const filterDropdowns = document.querySelectorAll(".filtersContainer select");

// Event listeners
window.addEventListener("resize", setItemTextInfoMaxWidth);
iconButtons.forEach((iconButton) => {
  iconButton.addEventListener("click", handleIconButtonClick);
});
navigationButtons.forEach((button) => {
  button.addEventListener("click", handleNavigationButtonClick);
});
filterDropdowns.forEach((dropdown) => {
  dropdown.addEventListener("change", handleFilterDropdownChange);
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

    // print cart
    console.log(cart.getPrice());
    console.log(cart.getItems());

    // Update the UI
    updateItemUiToMatchCart(issueElement);

    // Update the total price in the nav
    navSelectedItemsWorth.textContent = `€${cart.getPrice()}`;
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

        if (i === issues.length - 1) {
          issue.style.marginBottom = "1rem";
        }
      }
    }
  }
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
async function handleFilterDropdownChange(event) {
  const dropdownElement = event.target;

  if (dropdownElement.value === "") return;

  const filterType = dropdownElement.id === "countryDropdown" ? "country" : "year";
  const filterValue = dropdownElement.value;

  console.log("filterType:", filterType);
  console.log("filterValue:", filterValue);

  // Set the other dropdown to the default value
  const otherDropdownId = filterType === "country" ? "yearDropdown" : "countryDropdown";
  const otherDropdownElement = document.getElementById(otherDropdownId);
  otherDropdownElement.value = "";

  // fetch the data from the server
  const response = await fetch(`/coins/${filterType}/${filterValue}`);

  if (!response.ok) {
    console.error("Error fetching the data");
    return;
  }

  const data = await response.json();
  data.issues = new Map(Object.entries(data.issues));

  fetchedData = data;
  console.log(fetchedData);

  // Update the UI
  const itemsList = document.getElementById("itemsList");

  // Clear the itemsList
  itemsList.innerHTML = "";

  // Add the new items
  data.coinList.forEach((coin) => {
    const coinData = {
      id: coin._id,
      imgSrc: coin.src,
      name: coin.name,
      subgroup: coin.title,
      issueList: coin.issueIds.map((issueId) => data.issues.get(issueId)),
    };

    const coinItemHtmlElement = createCoinHtmlElement(coinData);

    if (coinItemHtmlElement !== undefined) {
      itemsList.appendChild(coinItemHtmlElement);
    }
  });

  // Set the max width of the itemTextInfo elements
  setItemTextInfoMaxWidth();
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

function createCoinHtmlElement({ id, imgSrc, name, subgroup, issueList }) {
  if (issueList.length === 0) {
    console.error("No issues for this coin - ", name);
    return;
  }

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
  const itemContainer = document.createElement("div");
  const issues = document.createElement("div");
  const item = document.createElement("div");
  const img = document.createElement("img");
  const itemTextInfo = document.createElement("div");

  const title = document.createElement("p");
  const tagsContainer = document.createElement("div");
  const tag1 = document.createElement("div");
  // const tag2 = document.createElement("div");
  const priceAndQtyContainer = document.createElement("div");
  const leftSide = document.createElement("div");
  const price = document.createElement("p");
  const times = document.createElement("p");
  const qty = document.createElement("p");
  const rightSide = document.createElement("div");
  const iconButton = document.createElement("div");
  const icon = document.createElement("img");

  // Add classes
  item.id = id;
  itemContainer.classList.add("itemContainer");
  issues.classList.add("issues");
  title.classList.add("title");
  item.classList.add("item");
  img.classList.add("itemImage");
  itemTextInfo.classList.add("itemTextInfo");
  tagsContainer.classList.add("tagsContainer");
  tag1.classList.add("tag");
  // tag2.classList.add("tag");
  priceAndQtyContainer.classList.add("priceAndQtyContainer", "noneSelected");
  leftSide.classList.add("leftSide");
  price.classList.add("price");
  times.classList.add("times");
  qty.classList.add("qty");
  rightSide.classList.add("rightSide");
  iconButton.classList.add("iconButton");

  // Add attributes
  img.src = `/${imgSrc}`;
  iconButton.dataset.buttonType = "dropdown";
  icon.src = "/images/icons/down-arrow.svg";
  icon.alt = "Add item to cart";

  // Append elements
  itemContainer.appendChild(item);
  itemContainer.appendChild(issues);
  item.appendChild(img);
  item.appendChild(itemTextInfo);
  item.appendChild(iconButton);
  itemTextInfo.appendChild(title);
  itemTextInfo.appendChild(tagsContainer);
  itemTextInfo.appendChild(priceAndQtyContainer);
  tagsContainer.appendChild(tag1);
  // tagsContainer.appendChild(tag2);
  priceAndQtyContainer.appendChild(leftSide);
  priceAndQtyContainer.appendChild(rightSide);
  leftSide.appendChild(price);
  leftSide.appendChild(times);
  leftSide.appendChild(qty);
  iconButton.appendChild(icon);

  // Set the text content
  title.textContent = name;
  tag1.textContent = subgroup;
  // tag2.textContent = issueList.map((issue) => issue.name).join(", ");
  const issuePrices = issueList.map((issue) => issue.price);
  price.textContent =
    issuePrices.length > 1
      ? `€ ${Math.min(...issuePrices)} - € ${Math.max(...issuePrices)}`
      : `€ ${issuePrices[0]}`;
  times.textContent = "x";
  qty.textContent = "0 kom";
  rightSide.textContent = "= 0 €";

  // Add event listener to the iconButton
  iconButton.addEventListener("click", handleIconButtonClick);

  return itemContainer;
}

function createIssueHtmlElement(issueData) {
  // Create the issue element based on this EJS snippet
  /*
    <div class="issue">
        <div class="issueTextInfo">
            <div class="tagsContainer">
                <div class="tag">Coincard</div>
            </div>

            <div class="priceAndQtyContainer noneSelected">
                <div class="leftSide">
                    <p class="price">€ 42</p>
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
  const issue = document.createElement("div");
  const issueTextInfo = document.createElement("div");
  const tagsContainer = document.createElement("div");
  const tag = document.createElement("div");
  const priceAndQtyContainer = document.createElement("div");
  const leftSide = document.createElement("div");
  const price = document.createElement("p");
  const times = document.createElement("p");
  const qty = document.createElement("p");
  const rightSide = document.createElement("div");
  const iconButton = document.createElement("div");
  const icon = document.createElement("img");

  // Add classes
  issue.id = issueData.id;
  issue.classList.add("issue");
  issueTextInfo.classList.add("issueTextInfo");
  tagsContainer.classList.add("tagsContainer");
  tag.classList.add("tag");
  priceAndQtyContainer.classList.add("priceAndQtyContainer", "noneSelected");
  leftSide.classList.add("leftSide");
  price.classList.add("price");
  times.classList.add("times");
  qty.classList.add("qty");
  rightSide.classList.add("rightSide");
  iconButton.classList.add("iconButton");

  // Add attributes
  iconButton.dataset.buttonType = "add";
  icon.src = "/images/icons/plus.svg";
  icon.alt = "Add item to cart";

  // Append elements
  issue.appendChild(issueTextInfo);
  issue.appendChild(iconButton);
  issueTextInfo.appendChild(tagsContainer);
  issueTextInfo.appendChild(priceAndQtyContainer);
  tagsContainer.appendChild(tag);
  priceAndQtyContainer.appendChild(leftSide);
  priceAndQtyContainer.appendChild(rightSide);
  leftSide.appendChild(price);
  leftSide.appendChild(times);
  leftSide.appendChild(qty);
  iconButton.appendChild(icon);

  // Set the text content
  tag.textContent = issueData.name;
  price.textContent = `€ ${issueData.price || "Nan"}`;
  times.textContent = "x";
  qty.textContent = "0 kom";
  rightSide.textContent = "= 0 €";

  // Add event listener to the iconButton
  iconButton.addEventListener("click", handleIconButtonClick);

  return issue;
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
