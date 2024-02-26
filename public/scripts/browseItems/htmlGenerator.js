function createCoinHtmlElement({ id, imgSrc, name, subgroup, issueList }) {
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
  if (subgroup.length > 1) {
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
  } else if (issueList.length === 1) {
    if (subgroup.length === 1) {
      iconButton.dataset.buttonType = "add";
      icon.src = "/images/icons/plus.svg";
      icon.alt = "Add item to cart";
    } else {
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

  return itemContainer;
}

function createIssueHtmlElement(issueData) {
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

  return issue;
}
