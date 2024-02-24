function createCoinHtmlElement({ id, imgSrc, name, subgroup, issueList }) {
  if (issueList.length === 0) {
    console.error("No issues for this coin - ", name);
    return;
  }

  if (!Array.isArray(subgroup)) {
    subgroup = [subgroup];
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
  // for each subgroup create a tag
  subgroup.forEach((subgroup) => {
    const tag = document.createElement("div");
    tag.classList.add("tag", "primary");
    tag.textContent = subgroup;
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
    icon.src = "/images/icons/down-arrow.svg";
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
