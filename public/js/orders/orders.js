"use strict";
function formatDate(date) {
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    };
    const formattedDate = date.toLocaleString("hr-HR", options);
    //   return formattedDate.replace(",", ".").replace(" ", ".");
    return formattedDate;
}
function acceptOrder(orderId) {
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
function declineOrder(orderId) {
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
document.addEventListener("DOMContentLoaded", function () {
    const acceptButtons = document.querySelectorAll(".accept-button");
    const declineButtons = document.querySelectorAll(".decline-button");
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
    //   format dates
    const dates = document.querySelectorAll(".date");
    dates.forEach((date) => {
        date.textContent = formatDate(new Date(date.textContent));
    });
});
//# sourceMappingURL=orders.js.map