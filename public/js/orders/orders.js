var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getRelativeDate } from "./dateFormatingFunctions.js";
function formatDate(date) {
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
function renameOrder(orderId, newName) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("/order/changeName", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: orderId, name: newName }),
        });
        const data = yield response.text();
        if (!response.ok) {
            alert(data);
            return;
        }
        location.reload();
    });
}
document.addEventListener("DOMContentLoaded", function () {
    const acceptButtons = document.querySelectorAll(".accept-button");
    const declineButtons = document.querySelectorAll(".decline-button");
    const orderNames = document.querySelectorAll(".name");
    const toggleMoreInfoButtons = document.querySelectorAll(".toggleMoreInfoButton");
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
            const orderCard = name.closest(".order-card");
            const orderId = orderCard === null || orderCard === void 0 ? void 0 : orderCard.dataset.orderId;
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
            const itemElement = button.closest(".item");
            itemElement.classList.toggle("lowerHalfHidden");
            // const lowerElement = itemElement.querySelector(".lower") as HTMLElement;
            // lowerElement.classList.toggle("hidden");
        });
    });
    //   format dates
    const dates = document.querySelectorAll(".date");
    dates.forEach((date) => {
        date.textContent = formatDate(new Date(date.textContent));
    });
});
//# sourceMappingURL=orders.js.map