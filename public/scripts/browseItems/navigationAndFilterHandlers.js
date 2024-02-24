const navSelectedItemsWorth = document.querySelector(".navSelectedItemsWorth");
const cartSum = document.querySelector(".cartSum");
const navigationButtons = document.querySelectorAll("nav a");
const filterDropdowns = document.querySelectorAll(".filtersContainer select");

const itemsList = document.getElementById("itemsList");
const cartList = document.getElementById("cartList");

navigationButtons.forEach((button) => {
  button.addEventListener("click", handleNavigationButtonClick);
});
filterDropdowns.forEach((dropdown) => {
  dropdown.addEventListener("change", handleFilterDropdownChange);
});

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

  const selectedPage = targetA.id === "browseHref" ? "browse" : "cart";

  if (selectedPage === "browse") {
    itemsList.style.display = "flex";
    cartList.style.display = "none";
  } else {
    itemsList.style.display = "none";
    cartList.style.display = "flex";

    renderCartListFromCart();
  }

  setItemTextInfoMaxWidth();
}
function handleFilterDropdownChange(event) {
  const dropdownElement = event.target;

  if (dropdownElement.value === "") return;

  const filterType = dropdownElement.id === "countryDropdown" ? "country" : "year";
  const filterValue = dropdownElement.value;

  console.log("filterType:", filterType);
  console.log("filterValue:", filterValue);

  updateCoinListBasedOnFilter(filterType, filterValue);
}

// FUNCTIONS
async function updateCoinListBasedOnFilter(filterType, filterValue) {
  // fetch the data from the server
  fetchedData = await fetchCoins(filterType, filterValue);
  console.log(fetchedData);

  // Clear the itemsList
  itemsList.innerHTML = "";

  // Add the new items
  fetchedData.coinList.forEach((coin) => {
    const coinData = {
      id: coin._id,
      imgSrc: coin.src,
      name: coin.name,
      subgroup: coin.title,
      issueList: coin.issueIds.map((issueId) => fetchedData.issues.get(issueId)),
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

async function fetchCoins(filterType, filterValue) {
  const response = await fetch(`/coins/${filterType}/${filterValue}`);

  if (!response.ok) {
    throw new Error("Failed to fetch the data");
  }

  const data = await response.json();

  // Convert the issues object to a Map
  data.issues = new Map(Object.entries(data.issues));

  return data;
}

function updateNavSelectedItemsWorth(value) {
  navSelectedItemsWorth.textContent = `€${value}`;
  cartSum.textContent = `€${value}`;
}

function renderCartListFromCart() {
  const cartItems = cart.getItems();

  cartList.innerHTML = "";

  cartItems.forEach((cartItem) => {
    const coinCountry = countryList
      .find((country) => country[1] === cartItem.coin.countryId)
      .at(0);
    const coinYear = yearList
      .find((yearData) => yearData[1] === cartItem.coin.yearId)
      .at(0);

    const data = {
      id: cartItem.coin._id,
      imgSrc: cartItem.coin.src,
      name: cartItem.coin.name,
      subgroup: [coinCountry, coinYear],
      issueList: [cartItem.issue],
    };

    const cartItemHtmlElement = createCoinHtmlElement(data);

    if (cartItemHtmlElement !== undefined) {
      // Update the UI to match the cart values (qty and sum)
      updateItemUiToMatchCart(cartItemHtmlElement, cartItem.issue.id);

      // Append the cartItemHtmlElement to the cartList
      cartList.appendChild(cartItemHtmlElement);
    }
  });
}

function setDropdownValues(filterType, filterValue) {
  // set the selected dropdown to the selected value
  const selectedDropdownId =
    filterType === "country" ? "countryDropdown" : "yearDropdown";
  const selectedDropdownElement = document.getElementById(selectedDropdownId);
  selectedDropdownElement.value = filterValue;

  // Set the other dropdown to the default value
  const otherDropdownId = filterType === "country" ? "yearDropdown" : "countryDropdown";
  const otherDropdownElement = document.getElementById(otherDropdownId);
  otherDropdownElement.value = "";
}
