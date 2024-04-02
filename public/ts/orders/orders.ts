import { getRelativeDate } from "./dateFormatingFunctions.js";

function formatDate(date: Date) {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  const formattedDate = date.toLocaleString("hr-HR", options);

  const relativeDate = getRelativeDate(date);

  return formattedDate + " (" + relativeDate + ")";
}

function acceptOrder(orderId: string) {
  fetch("/order/accept", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: orderId }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      console.log("Order accepted successfully:", orderId);
      location.reload();
    })
    .catch((error) => {
      console.error("There was a problem accepting the order:", error);
    });
}

function declineOrder(orderId: string) {
  fetch("/order/decline", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: orderId }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      console.log("Order declined successfully:", orderId);
      location.reload();
    })
    .catch((error) => {
      console.error("There was a problem declining the order:", error);
    });
}

async function renameOrder(orderId: string, newName: string) {
  const response = await fetch("/order/changeName", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: orderId, name: newName }),
  });

  const data = await response.text();

  if (!response.ok) {
    alert(data);
    return;
  }

  location.reload();
}

document.addEventListener("DOMContentLoaded", function () {
  const acceptButtons = document.querySelectorAll(
    ".accept-button"
  ) as NodeListOf<HTMLButtonElement>;
  const declineButtons = document.querySelectorAll(
    ".decline-button"
  ) as NodeListOf<HTMLButtonElement>;
  const orderNames = document.querySelectorAll(
    ".order-name"
  ) as NodeListOf<HTMLParagraphElement>;
  const toggleMoreInfoButtons = document.querySelectorAll(
    ".toggleMoreInfoButton"
  ) as NodeListOf<HTMLButtonElement>;

  acceptButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const orderId = button.dataset.orderId;

      if (orderId === undefined) {
        console.error("Order id undefined when trying to access data-order-id .");
        return;
      }

      acceptOrder(orderId);
    });
  });

  declineButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const orderId = button.dataset.orderId;

      if (orderId === undefined) {
        console.error("Order id undefined when trying to access data-order-id.");
        return;
      }

      declineOrder(orderId);
    });
  });

  orderNames.forEach((name) => {
    name.addEventListener("click", (e) => {
      const orderCard = name.closest(".order-card") as HTMLElement;
      const orderId = orderCard?.dataset.orderId;

      if (orderId === undefined) {
        console.error("Order id undefined when trying to access data-order-id.");
        return;
      }

      const newName = prompt("Enter new name:");

      if (newName === null || newName === "") {
        console.log("No new name entered.");
        return;
      }

      renameOrder(orderId, newName);
    });
  });

  toggleMoreInfoButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const itemElement = button.closest(".item") as HTMLElement;
      itemElement.classList.toggle("lowerHalfHidden");
    });
  });

  //   format dates
  const dates = document.querySelectorAll(".date");
  dates.forEach((date) => {
    date.textContent = formatDate(new Date(date.textContent));
  });
});
