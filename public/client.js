const groupedBy = getUrlParameters() || "countries";

// Returns the group_by parameter from the URL
function getUrlParameters() {
  const url = new URL(window.location.href);
  const groupByParam = url.searchParams.get("group_by");

  return groupByParam;
}

// Sends a POST request to the server to add a new coin to the database
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

// Sends a POST request to the server to add a new issue to the database
// Returns a promise that resolves with the new issue's ID
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

// Sends a POST request to the server to edit an existing issue
// Returns a promise that resolves when the request is complete
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

// Function to create a new form
function createIssueForm(name = "", price = "", amount = "") {
  const form = document.createElement("form");
  form.innerHTML = `
      <input type="text" name="issueName" value="${name}" placeholder="Issue Name" required>
      <input type="number" name="price" value="${price}" placeholder="Price" required>
      <input type="number" name="amount" value="${amount}" placeholder="Amount" required>
      <button type="submit">${name ? "Update" : "Add"}</button>
      <button type="button" class="cancel">Cancel</button>
    `;
  return form;
}

// Function to create a new list item
function createIssueListItem(newId, issueName, price, amount) {
  const newIssue = document.createElement("li");
  newIssue.setAttribute("data-issue-id", newId.toString());
  newIssue.textContent = `${issueName} (€ ${price}, count: ${amount})`;
  return newIssue;
}

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  // Get all the elements we need
  const addIssueButtons = document.querySelectorAll(".addIssueButton");
  const editIssueItems = document.querySelectorAll(".editIssue");
  const form = document.getElementById("addCoinForm");
  const coinItems = document.querySelectorAll(".coinName");
  const preview = document.getElementById("preview");
  const scrollToGroupSelect = document.getElementById("scrollToGroupSelect");
  const showAddCoinFormButtons = document.querySelectorAll(".showAddCoinFormButton");
  const dialog = document.getElementById("addCoinDialog");

  function attachEditIssueListeners(item) {
    item.addEventListener("click", function () {
      const issueId = item.dataset.issueId;
      const { name, price, amount } = issueMap.get(issueId);

      const form = createIssueForm(name, price, amount);

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

          const updatedItem = createIssueListItem(
            issueId,
            updatedIssue.name,
            updatedIssue.price,
            updatedIssue.amount
          );
          form.replaceWith(updatedItem);
          attachEditIssueListeners(updatedItem);
        });
      });

      const cancelBtn = form.querySelector(".cancel");
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

  // Add click event listeners to the add issue buttons
  // - when clicked, a new form is created and appended to the sub list
  // - when the form is submitted, a new issue is sent to the server and added to the sub list
  // - when the cancel button is clicked, the form is removed
  addIssueButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const parentLi = button.closest(".itemData");
      const subList = parentLi.querySelector(".itemVersions");

      const form = createIssueForm();
      subList.appendChild(form);

      // Add submit event listener to the form
      form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const issueName = formData.get("issueName");
        const price = formData.get("price");
        const amount = formData.get("amount");
        const coinId = parentLi.getAttribute("id");

        try {
          const newId = await handleIssueForm(coinId, issueName, price, amount);
          const newIssue = createIssueListItem(newId, issueName, price, amount);
          subList.appendChild(newIssue);
          issueMap.set(newId, { name: issueName, price, amount });
          attachEditIssueListeners(newIssue);
        } catch (error) {
          console.log("Error:", error);
        }

        form.remove();
      });

      // Add click event listener to the cancel button
      const cancelButton = form.querySelector(".cancel");
      cancelButton.addEventListener("click", function () {
        form.remove();
      });
    });
  });

  // Attach edit issue listeners to the edit issue items
  editIssueItems.forEach((item) => attachEditIssueListeners(item));

  // Add submit event listener to the form for adding a new coin
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const countryId = document.getElementById("countrySelect").value;
    const yearId = document.getElementById("yearSelect").value;
    const name = document.getElementById("coinName").value;
    const src = document.getElementById("sourceLink").value;

    await handleCoinForm(countryId, yearId, name, src);
  });

  // Add click event listeners to the coin items
  // - when clicked, the image of the coin is displayed in the preview section
  coinItems.forEach((coin) => {
    coin.addEventListener("click", function () {
      // TODO: ovo sredit (samo imat img kojem se mjenja src izmedu url ili nicega)
      const coinNode = coin.closest(".coin");
      while (preview.firstChild) preview.removeChild(preview.firstChild);
      const img = document.createElement("img");
      img.src = srcMap.get(coinNode.getAttribute("id"));
      preview.appendChild(img);
    });
  });

  // Add active class to the filter that matches the groupedBy variable
  document.querySelectorAll(".filter a").forEach((filter) => {
    if (filter.textContent.toLowerCase() === groupedBy) {
      filter.classList.add("active");
    }
  });

  // Add change event listener to the scroll_to_group select
  scrollToGroupSelect.addEventListener("change", function () {
    const groupId = scrollToGroupSelect.value;
    const countryElement = document.getElementById(groupId);
    countryElement.scrollIntoView({ behavior: "instant" });
    const headerHeight = document.querySelector(".header").offsetHeight;
    window.scrollBy(0, -headerHeight - 16); // 16 je padding
  });

  // Add click event listeners to the show add coin form buttons
  showAddCoinFormButtons.forEach((button) => {
    // TODO: napuniti dialog sa informacijama odgovaraujće grupe (ako je kliknut plus pored Croatia, odabrati Croatia u selectu)
    button.addEventListener("click", () => dialog.showModal());
  });

  // Close the dialog when the user clicks outside of it
  dialog.addEventListener("click", (e) => {
    if (e.target.id === "addCoinDialog") {
      dialog.close();
    }
  });
});
