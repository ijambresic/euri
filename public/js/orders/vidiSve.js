"use strict";
const seeAllButtons = document.querySelectorAll(".seeAllButton");
seeAllButtons.forEach((button) => {
    // Go through all buttons and see if they need to exist (if .itemsList is scrollable)
    const needed = checkIfButtonIsNeeded(button);
    if (!needed)
        return;
    addNumberOfItemsToButtonText(button);
    //   When the button is clicked toggle the class .expanded on the .itemsList
    button.addEventListener("click", () => {
        var _a;
        const itemsList = (_a = button.closest(".order-card")) === null || _a === void 0 ? void 0 : _a.querySelector(".itemsList");
        if (!itemsList)
            return;
        itemsList.classList.toggle("expanded");
    });
});
function checkIfButtonIsNeeded(button) {
    var _a;
    const itemsList = (_a = button.closest(".order-card")) === null || _a === void 0 ? void 0 : _a.querySelector(".itemsList");
    if (!itemsList)
        return false;
    if (itemsList.scrollHeight <= itemsList.clientHeight) {
        button.style.display = "none";
        return false;
    }
    else {
        return true;
    }
}
function addNumberOfItemsToButtonText(button) {
    var _a;
    const orderCard = button.closest(".order-card");
    //   Primjer: 'Total: 34€ (5 items)'
    const total = orderCard === null || orderCard === void 0 ? void 0 : orderCard.querySelector(".total");
    if (!total)
        return;
    //   Seperate the item count from the total
    const totalText = (_a = total.textContent) === null || _a === void 0 ? void 0 : _a.split("(")[1];
    const count = parseInt(totalText);
    button.textContent = `Vidi svih ${count} itema`;
}
//# sourceMappingURL=vidiSve.js.map