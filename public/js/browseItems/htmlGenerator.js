import { cart } from "../cart.js";
import { handlePrimaryTagClick, handleIconButtonClick } from "./browseItemsScript.js";
import { getCountryFromId, getYearFromId } from "./utils.js";
export function createCoinHtmlElement({ id, imgSrc, name, subgroup, issueList }) {
    if (issueList.length === 0) {
        console.error("No issues for this coin - ", name);
        return;
    }
    if (!Array.isArray(subgroup)) {
        subgroup = [subgroup];
    }
    // Create the elements
    const itemContainer = document.createElement("div");
    const issues = document.createElement("div");
    const item = document.createElement("div");
    const img = document.createElement("img");
    const itemTextInfo = document.createElement("div");
    const title = document.createElement("p");
    const tagsContainer = document.createElement("div");
    // for each subgroup create a tag
    subgroup.forEach((subgroup) => {
        const tag = document.createElement("div");
        tag.classList.add("tag", "primary");
        tag.textContent = subgroup;
        tag.addEventListener("click", handlePrimaryTagClick);
        tagsContainer.appendChild(tag);
    });
    const secondaryTag = document.createElement("div");
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
    if (subgroup.length > 1 || issueList.length === 1) {
        item.dataset.issueId = issueList.at(0).id;
    }
    itemContainer.classList.add("itemContainer");
    issues.classList.add("issues");
    title.classList.add("title");
    item.classList.add("item");
    img.classList.add("itemImage");
    itemTextInfo.classList.add("itemTextInfo");
    tagsContainer.classList.add("tagsContainer");
    secondaryTag.classList.add("tag", "secondary");
    priceAndQtyContainer.classList.add("priceAndQtyContainer", "noneSelected");
    leftSide.classList.add("leftSide");
    price.classList.add("price");
    times.classList.add("times");
    qty.classList.add("qty");
    rightSide.classList.add("rightSide");
    iconButton.classList.add("iconButton");
    // Add attributes
    img.src = `/${imgSrc}`;
    if (issueList.length > 1) {
        iconButton.dataset.buttonType = "dropdown";
        iconButton.classList.add("secondary");
        icon.src = "/images/icons/down-arrow-black.svg";
        icon.alt = "Show all issues";
    }
    else if (issueList.length === 1) {
        if (subgroup.length === 1) {
            iconButton.dataset.buttonType = "add";
            icon.src = "/images/icons/plus.svg";
            icon.alt = "Add item to cart";
        }
        else {
            iconButton.dataset.buttonType = "remove";
            iconButton.classList.add("redButton");
            icon.src = "/images/icons/minus.svg";
            icon.alt = "Remove item from cart";
        }
    }
    // Append elements
    itemContainer.appendChild(item);
    itemContainer.appendChild(issues);
    item.appendChild(img);
    item.appendChild(itemTextInfo);
    item.appendChild(iconButton);
    itemTextInfo.appendChild(title);
    itemTextInfo.appendChild(tagsContainer);
    itemTextInfo.appendChild(priceAndQtyContainer);
    tagsContainer.appendChild(secondaryTag);
    priceAndQtyContainer.appendChild(leftSide);
    priceAndQtyContainer.appendChild(rightSide);
    leftSide.appendChild(price);
    leftSide.appendChild(times);
    leftSide.appendChild(qty);
    iconButton.appendChild(icon);
    // Set the text content
    title.textContent = name;
    secondaryTag.textContent =
        issueList.length > 1 ? `${issueList.length} issues` : issueList[0].name;
    const issuePrices = issueList.map((issue) => issue.price);
    price.textContent =
        issuePrices.length > 1
            ? `€${Math.min(...issuePrices)} - €${Math.max(...issuePrices)}`
            : `€${issuePrices[0]}`;
    times.textContent = "x";
    qty.textContent = "0 kom";
    rightSide.textContent = "= 0€";
    // Add event listener to the iconButton
    iconButton.addEventListener("click", handleIconButtonClick);
    if (issueList.length === 1) {
        updateItemUiToMatchCart(itemContainer, issueList[0].id);
    }
    return itemContainer;
}
export function createIssueHtmlElement(issueData) {
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
    tag.classList.add("tag", "secondary");
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
    updateItemUiToMatchCart(issue, issueData.id);
    return issue;
}
export function renderCartListFromCart() {
    // Retrieve all the items from the cart
    const cartItems = cart.getItems();
    // Clear the current cart list
    cartList.innerHTML = "";
    // For each item in the cart, create a new item and append it to the cartList
    cartItems.forEach((cartItem) => {
        const coinCountry = getCountryFromId(cartItem.coin.countryId);
        const coinYear = getYearFromId(cartItem.coin.yearId);
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
export function updateItemUiToMatchCart(HtmlElement, issueId) {
    const issueInCart = cart.getIssue(issueId);
    // get DOM elements
    const qty = HtmlElement.querySelector(".qty");
    const sum = HtmlElement.querySelector(".rightSide");
    const priceAndQtyContainer = HtmlElement.querySelector(".priceAndQtyContainer");
    if (issueInCart === undefined) {
        priceAndQtyContainer.classList.add("noneSelected");
        return;
    }
    // Get the values
    const qtyValue = issueInCart.amount;
    const sumValue = issueInCart.total;
    // Update the DOM
    qty.textContent = `${qtyValue} kom`;
    sum.textContent = `= ${sumValue} €`;
    // Toggle the priceAndQtyContainer .noneSelected class
    priceAndQtyContainer.classList.remove("noneSelected");
}
//# sourceMappingURL=htmlGenerator.js.map