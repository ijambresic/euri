// Get all the elements with the class 'seeAllButton'
const seeAllButtons = document.querySelectorAll(
  ".seeAllButton"
) as NodeListOf<HTMLElement>;

// Iterate over each button
seeAllButtons.forEach((button) => {
  // Check if the button is needed (if .itemsList is scrollable)
  const needed = checkIfButtonIsNeeded(button);

  if (!needed) return;

  // Add the number of items to the button text
  addNumberOfItemsToButtonText(button);

  // Add a click event listener to the button
  button.addEventListener("click", () => {
    // Find the closest .order-card and its .itemsList
    const orderCard = button.closest(".order-card");

    // If there's no itemsList, exit the function
    if (!orderCard) return;

    // Toggle the .expanded class on the itemsList
    orderCard.classList.toggle("expanded");
    addNumberOfItemsToButtonText(button);
  });
});

// Function to check if a button is needed
function checkIfButtonIsNeeded(button: HTMLElement) {
  // Find the closest .order-card and its .itemsList
  const itemsList = button.closest(".order-card")?.querySelector(".itemsList");

  // If there's no itemsList, return false
  if (!itemsList) return false;

  // If the scrollHeight is less than or equal to the clientHeight, hide the button and return false
  if (itemsList.scrollHeight <= itemsList.clientHeight) {
    button.style.display = "none";
    return false;
  } else {
    // Otherwise, the button is needed, so return true
    return true;
  }
}

// Function to add the number of items to the button text
function addNumberOfItemsToButtonText(button: HTMLElement) {
  // Find the closest .order-card
  const orderCard = button.closest(".order-card") as HTMLElement;

  // Find the .total and .itemsList elements
  const total = orderCard?.querySelector(".total") as HTMLElement;

  // If there's no total or itemsList, exit the function
  if (!total) return;

  // Split the total text on '(' to get the item count
  const totalText = total.textContent?.split("(")[1] as string;

  // Parse the item count as an integer
  const count = parseInt(totalText);

  // Check if the itemsList is expanded
  const isExpanded = orderCard.classList.contains("expanded");

  // Set the button text to include the item count
  button.textContent = isExpanded ? `Prikaži manje` : `Prikaži svih ${count} stavki`;
}
