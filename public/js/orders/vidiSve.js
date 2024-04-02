"use strict";
// Get all the elements with the class 'seeAllButton'
const seeAllButtons = document.querySelectorAll(".seeAllButton");
// Iterate over each button
seeAllButtons.forEach((button) => {
    // Check if the button is needed (if .itemsList is scrollable)
    const needed = checkIfButtonIsNeeded(button);
    if (!needed)
        return;
    // Add the number of items to the button text
    addNumberOfItemsToButtonText(button);
    // Add a click event listener to the button
    button.addEventListener("click", () => {
        // Find the closest .order-card and its .itemsList
        const orderCard = button.closest(".order-card");
        // If there's no itemsList, exit the function
        if (!orderCard)
            return;
        // Toggle the .expanded class on the itemsList
        orderCard.classList.toggle("expanded");
        addNumberOfItemsToButtonText(button);
    });
});
// Function to check if a button is needed
function checkIfButtonIsNeeded(button) {
    var _a;
    // Find the closest .order-card and its .itemsList
    const itemsList = (_a = button.closest(".order-card")) === null || _a === void 0 ? void 0 : _a.querySelector(".itemsList");
    // If there's no itemsList, return false
    if (!itemsList)
        return false;
    // If the scrollHeight is less than or equal to the clientHeight, hide the button and return false
    if (itemsList.scrollHeight <= itemsList.clientHeight) {
        button.style.display = "none";
        return false;
    }
    else {
        // Otherwise, the button is needed, so return true
        return true;
    }
}
// Function to add the number of items to the button text
function addNumberOfItemsToButtonText(button) {
    var _a;
    // Find the closest .order-card
    const orderCard = button.closest(".order-card");
    // Find the .total and .itemsList elements
    const total = orderCard === null || orderCard === void 0 ? void 0 : orderCard.querySelector(".total");
    // If there's no total or itemsList, exit the function
    if (!total)
        return;
    // Split the total text on '(' to get the item count
    const totalText = (_a = total.textContent) === null || _a === void 0 ? void 0 : _a.split("(")[1];
    // Parse the item count as an integer
    const count = parseInt(totalText);
    // Check if the itemsList is expanded
    const isExpanded = orderCard.classList.contains("expanded");
    // Set the button text to include the item count
    button.textContent = isExpanded ? `Prikaži manje` : `Prikaži svih ${count} stavki`;
}
//# sourceMappingURL=vidiSve.js.map