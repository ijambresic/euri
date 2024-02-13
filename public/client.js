let groupedBy = "";

function handleCoinForm(countryId, yearId, name, src) {
  fetch("/addCoin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ countryId, yearId, name, src }),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Form submitted successfully");
      } else {
        console.error("Form submission failed");
      }
    })
    .catch((error) => {
      console.error("Network error:", error);
    });
}

function handleIssueForm(coinId, name, price, amount) {
  return new Promise((resolve, reject) => {
    fetch("/addIssue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coinId, name, price, amount }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Form submitted successfully");
          response.json().then((data) => resolve(data.newId.toString()));
        } else {
          console.error("Form submission failed");
          reject(new Error("Form submission failed"));
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
        reject(error);
      });
  });
}

async function handleEditIssue(issueId, name, price, amount) {
  fetch("/editIssue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ issueId, name, price, amount }),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Form submitted successfully");
      } else {
        console.error("Form submission failed");
      }
    })
    .catch((error) => {
      console.error("Network error:", error);
    });
}

function attachEditIssueListeners(item) {
  item.addEventListener("click", function () {
    const issueId = item.getAttribute("data-issue-id");
    const form = document.createElement("form");
    form.innerHTML = `
                <input type="text" name="issueName" value="${
                  issueMap.get(issueId).name
                }" required><br>
                <input type="number" name="price" value="${
                  issueMap.get(issueId).price
                }" required><br>
                <input type="number" name="amount" value="${
                  issueMap.get(issueId).amount
                }" required><br>
                <button type="submit">Update</button>
                <button type="button" class="cancelBtn">Cancel</button>
            `;

    item.replaceWith(form);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const formData = new FormData(form);
      const updatedIssue = {
        name: formData.get("issueName"),
        price: formData.get("price"),
        amount: formData.get("amount"),
      };

      handleEditIssue(
        issueId,
        updatedIssue.name,
        updatedIssue.price,
        updatedIssue.amount
      ).then(() => {
        issueMap.get(issueId).name = updatedIssue.name;
        issueMap.get(issueId).price = updatedIssue.price;
        issueMap.get(issueId).amount = updatedIssue.amount;

        const updatedItem = document.createElement("li");
        updatedItem.classList.add("editIssue");
        updatedItem.setAttribute("data-issue-id", issueId);
        updatedItem.innerHTML = `${updatedIssue.issueName} (€ ${updatedIssue.price}, count: ${updatedIssue.amount})`;
        form.replaceWith(updatedItem);
        attachEditIssueListeners(updatedItem);
      });
    });

    const cancelBtn = form.querySelector(".cancelBtn");
    cancelBtn.addEventListener("click", function () {
      const originalItem = document.createElement("li");
      originalItem.classList.add("editIssue");
      originalItem.setAttribute("data-issue-id", issueId);
      originalItem.innerHTML = `${issueMap.get(issueId).name} (€ ${
        issueMap.get(issueId).price
      }, count: ${issueMap.get(issueId).amount})`;
      form.replaceWith(originalItem);
      attachEditIssueListeners(originalItem);
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const addIssueButtons = document.querySelectorAll(".addIssueButton");

  addIssueButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const parentLi = button.closest(".itemData");
      const subList = parentLi.querySelector(".itemVersions");

      const form = document.createElement("form");
      form.innerHTML = `
                <input type="text" name="issueName" placeholder="Issue Name" required><br>
                <input type="number" name="price" placeholder="Price" required><br>
                <input type="number" name="amount" placeholder="Amount" required><br>
                <button type="submit">Add</button>
                <button type="button" class="cancel">Cancel</button>
            `;
      subList.appendChild(form);

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const issueName = formData.get("issueName");
        const price = formData.get("price");
        const amount = formData.get("amount");
        const coinId = parentLi.getAttribute("id");

        handleIssueForm(coinId, issueName, price, amount)
          .then((newId) => {
            const newIssue = document.createElement("li");
            newIssue.setAttribute("data-issue-id", newId.toString());
            newIssue.textContent = `${issueName} (€ ${price}, count: ${amount})`;
            subList.appendChild(newIssue);
            console.log(newId);
            issueMap.set(newId, {
              name: issueName,
              price,
              amount,
            });
            console.log(issueMap);
            attachEditIssueListeners(newIssue);
          })
          .catch((error) => {
            console.log("Error:", error);
          });

        form.remove();
      });

      const cancelButton = form.querySelector(".cancel");
      cancelButton.addEventListener("click", function () {
        form.remove();
      });
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const editIssueItems = document.querySelectorAll(".editIssue");
  editIssueItems.forEach((item) => attachEditIssueListeners(item));
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("addCoinForm");
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const countryId = document.getElementById("countrySelect").value;
    const yearId = document.getElementById("yearSelect").value;
    const name = document.getElementById("coinName").value;
    const src = document.getElementById("sourceLink").value;

    handleCoinForm(countryId, yearId, name, src);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const coinItems = document.querySelectorAll(".coinName");
  const preview = document.getElementById("preview");
  coinItems.forEach((coin) => {
    coin.addEventListener("click", function () {
      const coinNode = coin.closest(".coin");
      console.log(srcMap.get(coinNode.getAttribute("id")));
      console.log(preview);
      while (preview.firstChild) preview.removeChild(preview.firstChild);
      const img = document.createElement("img");
      img.src = srcMap.get(coinNode.getAttribute("id"));
      preview.appendChild(img);
    });
  });
});
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".filter a").forEach((filter) => {
    if (filter.textContent.toLowerCase() === groupedBy) {
      filter.classList.add("active");
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const scrollToGroupSelect = document.getElementById("scrollToGroupSelect");
  scrollToGroupSelect.addEventListener("change", function () {
    const groupId = scrollToGroupSelect.value;

    // scroll to the element with the id of the selected country
    const countryElement = document.getElementById(groupId);
    countryElement.scrollIntoView({ behavior: "instant" });

    // scrollat još za visinu headera
    const headerHeight = document.querySelector(".header").offsetHeight;
    window.scrollBy(0, -headerHeight - 16);
  });
});

getUrlParameters();
function getUrlParameters() {
  const url = new URL(window.location.href);
  const groupByParam = url.searchParams.get("group_by");

  groupedBy = groupByParam ? groupByParam : "countries";
}

document.addEventListener("DOMContentLoaded", function () {
  const dialog = document.getElementById("addCoinDialog");
  dialog.addEventListener("click", (e) => {
    if (e.target.id === "addCoinDialog") {
      dialog.close();
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const showAddCoinFormButtons = document.querySelectorAll(".showAddCoinFormButton");
  showAddCoinFormButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = document.getElementById("addCoinDialog");
      //   TODO: napunit select sa drzavom/godinom iz koje je gumb stisnut
      dialog.showModal();
    });
  });
});
