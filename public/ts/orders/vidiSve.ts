const seeAllButtons = document.querySelectorAll(
  ".seeAllButton"
) as NodeListOf<HTMLElement>;

seeAllButtons.forEach((button) => {
  // Go through all buttons and see if they need to exist (if .itemsList is scrollable)
  const needed = checkIfButtonIsNeeded(button);

  if (!needed) return;

  addNumberOfItemsToButtonText(button);

  //   When the button is clicked toggle the class .expanded on the .itemsList
  button.addEventListener("click", () => {
    const itemsList = button.closest(".order-card")?.querySelector(".itemsList");

    if (!itemsList) return;

    itemsList.classList.toggle("expanded");
  });
});

function checkIfButtonIsNeeded(button: HTMLElement) {
  const itemsList = button.closest(".order-card")?.querySelector(".itemsList");

  if (!itemsList) return false;

  if (itemsList.scrollHeight <= itemsList.clientHeight) {
    button.style.display = "none";
    return false;
  } else {
    return true;
  }
}

function addNumberOfItemsToButtonText(button: HTMLElement) {
  const orderCard = button.closest(".order-card") as HTMLElement;

  //   Primjer: 'Total: 34€ (5 items)'
  const total = orderCard?.querySelector(".total") as HTMLElement;

  if (!total) return;

  //   Seperate the item count from the total
  const totalText = total.textContent?.split("(")[1] as string;

  const count = parseInt(totalText);

  button.textContent = `Vidi svih ${count} itema`;
}
