import { loadData } from "./chart.js";
import { initPurchaseHistory } from "./purchaseHistory.js";
const groupedBy = getUrlParameters() || "countries";

// Returns the group_by parameter from the URL
function getUrlParameters() {
  const url = new URL(window.location.href);
  const groupByParam = url.searchParams.get("group_by");

  return groupByParam;
}

// Sends a POST request to the server to add a new coin to the database
function handleCoinForm(
  countryId: string,
  yearId: string,
  name: string,
  src: string,
  dialog: HTMLDialogElement
) {
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
        dialog.style.backgroundColor = "";
        dialog.close();
      } else {
        console.error("Form submission failed");
        dialog.style.backgroundColor = "#F45B69";
      }
    })
    .catch((error) => {
      console.error("Network error:", error);
    });
}

// Sends a POST request to the server to add a new issue to the database
// Returns a promise that resolves with the new issue's ID
async function handleIssueForm(
  coinId: string,
  name: string,
  price: string,
  amount: string
): Promise<string> {
  try {
    const response = await fetch("/addIssue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coinId, name, price, amount }),
    });

    if (!response.ok) throw new Error("Form submission failed");

    console.log("Form submitted successfully");
    const data = await response.json();
    return data.newId.toString();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Sends a POST request to the server to edit an existing issue
// Returns a promise that resolves to whether the server saved the change
async function handleEditIssue(
  issueId: string,
  name: string,
  price: string,
  amount: string
) {
  try {
    const response = await fetch("/editIssue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ issueId, name, price, amount }),
    });

    if (!response.ok) throw new Error("Form submission failed");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Reads a text field from a submitted form ("" when the field is missing)
function getField(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

// Function to create a new issue form
function createIssueForm(name = "", price = "", amount = "") {
  const form = document.createElement("form");

  form.innerHTML = `
      <input type="text" name="issueName" value="${name}" placeholder="Issue Name" required>
      <input type="number" name="price" value="${price}" placeholder="Price" required>
      <input type="number" name="amount" value="${amount}" placeholder="Amount" required>
      <button type="submit" class="primaryButton">${name ? "Update" : "Add"}</button>
      <button type="button" class="cancel secondaryButton">Cancel</button>
    `;

  return form;
}

// Function to create a new list item
function createIssueListItem(
  newId: string,
  issueName: string,
  price: string,
  amount: string
) {
  const newIssue = document.createElement("li");

  newIssue.setAttribute("data-issue-id", newId.toString());
  newIssue.textContent = `${issueName} (€ ${price}, count: ${amount})`;

  return newIssue;
}

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  // Get all the elements we need
  const addIssueButtons = document.querySelectorAll(
    ".addIssueButton"
  ) as NodeListOf<HTMLElement>;
  const editIssueItems = document.querySelectorAll(
    ".editIssue"
  ) as NodeListOf<HTMLLIElement>;
  const form = document.getElementById("addCoinForm") as HTMLFormElement;
  const coinItems = document.querySelectorAll(".coinName") as NodeListOf<HTMLElement>;
  const sidebarTitle = document.getElementById("sidebarTitle") as HTMLElement;
  const coinPreviewImage = document.getElementById(
    "coinPreviewImage"
  ) as HTMLImageElement;
  const scrollToGroupSelect = document.getElementById(
    "scrollToGroupSelect"
  ) as HTMLSelectElement;
  const showAddCoinFormButtons = document.querySelectorAll(
    ".showAddCoinFormButton"
  ) as NodeListOf<HTMLButtonElement>;
  const dialog = document.getElementById("addCoinDialog") as HTMLDialogElement;
  const selectPurchaseIssue = initPurchaseHistory();

  function attachEditIssueListeners(item: HTMLElement) {
    item.addEventListener("click", function () {
      const issueId = item.dataset.issueId;
      if (!issueId) return;
      const issue = issueMap.get(issueId);
      if (!issue) return;
      const { name, price, amount } = issue;
      showCoin(item);
      selectPurchaseIssue(issueId, name);

      const form = createIssueForm(name, price, amount);

      item.replaceWith(form);

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const updatedIssue = {
          name: getField(formData, "issueName"),
          price: getField(formData, "price"),
          amount: getField(formData, "amount"),
        };

        void handleEditIssue(
          issueId,
          updatedIssue.name,
          updatedIssue.price,
          updatedIssue.amount
        ).then((saved) => {
          // Keep the form open so the change is not shown as if it was saved.
          if (!saved) {
            alert("Could not save the issue. Try again.");
            return;
          }

          issue.name = updatedIssue.name;
          issue.price = updatedIssue.price;
          issue.amount = updatedIssue.amount;

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

      const cancelBtn = form.querySelector(".cancel") as HTMLButtonElement;
      cancelBtn.addEventListener("click", function () {
        const originalItem = document.createElement("li");
        originalItem.classList.add("editIssue");
        originalItem.setAttribute("data-issue-id", issueId);
        originalItem.innerHTML = `${issue.name} (€ ${issue.price}, count: ${issue.amount})`;
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
      const subList = button.closest(".itemData")?.querySelector(".itemVersions");
      if (!subList) return;

      const form = createIssueForm();
      subList.appendChild(form);

      // Add submit event listener to the form
      form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const issueName = getField(formData, "issueName");
        const price = getField(formData, "price");
        const amount = getField(formData, "amount");
        const coinId = button.closest(".coin")?.getAttribute("id");
        if (!coinId) return;

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
      form.querySelector(".cancel")?.addEventListener("click", function () {
        form.remove();
      });
    });
  });
  // ^^^^ End of onDOMContentLoaded event listener ^^^^

  // Attach edit issue listeners to the edit issue items
  editIssueItems.forEach((item) => attachEditIssueListeners(item));

  // Add submit event listener to the form for adding a new coin
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const valueOf = (id: string) =>
      (document.getElementById(id) as HTMLInputElement | HTMLSelectElement).value;

    const countryId = valueOf("countrySelect");
    const yearId = valueOf("yearSelect");
    const name = valueOf("coinName");
    const src = valueOf("sourceLink");

    handleCoinForm(countryId, yearId, name, src, dialog);
  });

  const coinList = groupList.flatMap((group) => group.coins);

  function showCoin(item: HTMLElement) {
    const coinNode = item.closest<HTMLElement>(".coin");
    const coin = coinList.find((entry) => entry._id.toString() === coinNode?.id);
    if (!coin) return;

    const country = countryList.find((entry: [string, string]) => entry[1] === coin.countryId.toString());
    const year = yearList.find((entry: [string, string]) => entry[1] === coin.yearId.toString());
    sidebarTitle.textContent = `${country?.[0] ?? ""} ${year?.[0] ?? ""} - ${coin.name}`;
    coinPreviewImage.src = coin.src || "";
    coinPreviewImage.style.display = "block";
    void loadData(coin._id.toString()).catch((error) => console.error("Could not load charts.", error));
  }

  coinItems.forEach((coin) => {
    coin.addEventListener("click", function () {
      selectPurchaseIssue();
      showCoin(coin);
    });
  });

  // Close the coin preview image when clicked
  coinPreviewImage.addEventListener("click", function () {
    coinPreviewImage.style.display = "none";
    coinPreviewImage.src = "";
  });

  // Add active class to the filter that matches the groupedBy variable
  const filterLinks = document.querySelectorAll(
    ".filter a"
  ) as NodeListOf<HTMLAnchorElement>;
  filterLinks.forEach((filter) => {
    if (filter.textContent.toLowerCase() === groupedBy) {
      filter.classList.add("active");
    }
  });

  // Add change event listener to the scroll_to_group select
  scrollToGroupSelect.addEventListener("change", function () {
    const groupId = scrollToGroupSelect.value;
    const countryElement = document.getElementById(groupId);
    const countryContainer = countryElement?.closest(".group");

    countryContainer?.scrollIntoView({ behavior: "instant" });

    // scroll window to top (0)
    window.scrollTo(0, 0);
  });

  // Add click event listeners to the show add coin form buttons
  showAddCoinFormButtons.forEach((button) => {
    // TODO: napuniti dialog sa informacijama odgovaraujće grupe (ako je kliknut plus pored Croatia, odabrati Croatia u selectu)
    button.addEventListener("click", () => {
      const groupValue = button
        .closest(".titleAndAddCoinButtonContainer")
        ?.querySelector(".groupTitle")?.id;

      const selectElementId = groupedBy === "countries" ? "countrySelect" : "yearSelect";
      const selectElement = document.getElementById(
        selectElementId,
      ) as HTMLSelectElement | null;
      if (selectElement && groupValue) selectElement.value = groupValue;

      dialog.showModal();
    });
  });

  // Close the dialog when the user clicks outside of it
  dialog.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).id === "addCoinDialog") {
      dialog.close();
    }
  });
});
