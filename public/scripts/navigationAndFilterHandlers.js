const navSelectedItemsWorth = document.querySelector(".navSelectedItemsWorth");
const navigationButtons = document.querySelectorAll("nav a");
const filterDropdowns = document.querySelectorAll(".filtersContainer select");

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
  fetchedData = await fetchCoins(filterType, filterValue);
  console.log(fetchedData);

  // Update the UI
  const itemsList = document.getElementById("itemsList");

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

  // Set the max width of the itemTextInfo elements
  setItemTextInfoMaxWidth();
}

// FUNCTIONS
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
}
