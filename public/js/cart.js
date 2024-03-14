/*
    cart.getItems()
        vraca sve iteme koji su u cartu u formatu:
        [
            {
                coin: {
                    name,
                    src,
                    ...
                },
                issue: {
                    id,
                    name,
                    price,
                    limit   // koliko ih smije bit u cartu
                }
                amount  // koliko ovog issuea je trenutno u cartu
                total   // ukupna cijena za ove issuee
            },
            ...
        ]
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Cart_price, _Cart_list;
/**
 * Class representing a shopping cart.
 */
class Cart {
    /**
     * Create a new shopping cart.
     */
    constructor() {
        _Cart_price.set(this, void 0);
        _Cart_list.set(this, void 0);
        this.getPrice = () => __classPrivateFieldGet(this, _Cart_price, "f");
        this.getItems = () => {
            // Mozda napravit u buducnosti da se sortira po necem korisnom prije returna
            return Object.values(__classPrivateFieldGet(this, _Cart_list, "f"));
        };
        this.getIssue = (id) => {
            return __classPrivateFieldGet(this, _Cart_list, "f")[id];
        };
        this.add = (coin, issue) => {
            if (__classPrivateFieldGet(this, _Cart_list, "f").hasOwnProperty(issue.id)) {
                if (__classPrivateFieldGet(this, _Cart_list, "f")[issue.id].amount === issue.limit) {
                    console.log("Limit dosegnut");
                    return false;
                }
                __classPrivateFieldSet(this, _Cart_price, __classPrivateFieldGet(this, _Cart_price, "f") + Number(issue.price), "f");
                __classPrivateFieldGet(this, _Cart_list, "f")[issue.id].amount++;
                __classPrivateFieldGet(this, _Cart_list, "f")[issue.id].total += Number(issue.price);
                const storageCart = JSON.parse(localStorage.getItem("euroCart"));
                if (storageCart === null)
                    return false;
                let num = parseInt(storageCart[issue.id] || "0");
                num++;
                storageCart[issue.id] = num;
                localStorage.setItem("euroCart", JSON.stringify(storageCart));
                return true;
            }
            if (issue.limit === 0) {
                console.log("Item nedostupan");
                return false;
            }
            __classPrivateFieldGet(this, _Cart_list, "f")[issue.id] = {
                coin,
                issue,
                amount: 1,
                total: Number(issue.price),
            };
            const coinId = coin._id.toString();
            const storageCart = JSON.parse(localStorage.getItem("euroCart"));
            storageCart[issue.id] = "1";
            localStorage.setItem("euroCart", JSON.stringify(storageCart));
            __classPrivateFieldSet(this, _Cart_price, __classPrivateFieldGet(this, _Cart_price, "f") + Number(issue.price), "f");
            console.log(this.getItems());
            return true;
        };
        this.remove = (issue) => {
            if (!__classPrivateFieldGet(this, _Cart_list, "f").hasOwnProperty(issue.id)) {
                console.log("Item nije u cartu");
                return false;
            }
            __classPrivateFieldSet(this, _Cart_price, __classPrivateFieldGet(this, _Cart_price, "f") - Number(issue.price), "f");
            __classPrivateFieldGet(this, _Cart_list, "f")[issue.id].amount--;
            __classPrivateFieldGet(this, _Cart_list, "f")[issue.id].total -= Number(issue.price);
            const storageCart = JSON.parse(localStorage.getItem("euroCart"));
            if (storageCart === null)
                return false;
            // TODO: jel bi bilo bolje zapisati #list.amount, tako da sigurno bude isto ko displayano
            let num = parseInt(storageCart[issue.id] || "0");
            num--;
            storageCart[issue.id] = num;
            localStorage.setItem("euroCart", JSON.stringify(storageCart));
            if (__classPrivateFieldGet(this, _Cart_list, "f")[issue.id].amount === 0) {
                delete __classPrivateFieldGet(this, _Cart_list, "f")[issue.id];
                // remove javascript object key
                delete storageCart[issue.id];
                localStorage.setItem("euroCart", JSON.stringify(storageCart));
                return false;
            }
            return true;
        };
        this.removeAll = (issue) => {
            if (__classPrivateFieldGet(this, _Cart_list, "f").hasOwnProperty(issue.id)) {
                __classPrivateFieldSet(this, _Cart_price, __classPrivateFieldGet(this, _Cart_price, "f") - Number(issue.price) * __classPrivateFieldGet(this, _Cart_list, "f")[issue.id].amount, "f");
                delete __classPrivateFieldGet(this, _Cart_list, "f")[issue.id];
                const storageCart = JSON.parse(localStorage.getItem("euroCart"));
                delete storageCart[issue.id];
                localStorage.setItem("euroCart", JSON.stringify(storageCart));
            }
        };
        this.clear = () => {
            __classPrivateFieldSet(this, _Cart_price, 0, "f");
            __classPrivateFieldSet(this, _Cart_list, {}, "f");
            localStorage.setItem("euroCart", JSON.stringify({}));
        };
        /**
         * Asynchronously sends an order to the server.
         *
         * The order is constructed from the `this.#list` object, where each key-value pair
         * represents an issueId and its corresponding amount.
         *
         * If the order is sent successfully, the method returns `false`.
         * If the order fails to send or a network error occurs, the method returns `true`.
         *
         * @async
         * @returns {Promise<boolean>} A promise that resolves with `false` if there wasn't an error, or `true` if the order failed to send or a network error occurred.
         */
        this.sendOrder = () => __awaiter(this, void 0, void 0, function* () {
            try {
                if (__classPrivateFieldGet(this, _Cart_price, "f") === 0) {
                    return false;
                }
                const order = {};
                // Construct the order object
                for (let [issueId, value] of Object.entries(__classPrivateFieldGet(this, _Cart_list, "f"))) {
                    order[issueId] = value.amount;
                }
                // Send the order
                const response = yield fetch("/order/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ order }),
                });
                const data = (yield response.json());
                if (!response.ok) {
                    console.error("Error sending the order:", data.message);
                }
                return data.error;
            }
            catch (error) {
                console.error("Network error:", error);
                return true;
            }
        });
        this.load = () => __awaiter(this, void 0, void 0, function* () {
            __classPrivateFieldSet(this, _Cart_price, 0, "f");
            __classPrivateFieldSet(this, _Cart_list, {}, "f");
            const response = yield fetch("/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: localStorage.getItem("euroCart"),
            });
            if (!response.ok) {
                console.error("Error loading order");
                return;
            }
            const data = (yield response.json());
            console.log(data);
            __classPrivateFieldSet(this, _Cart_price, data.price, "f");
            __classPrivateFieldSet(this, _Cart_list, data.list, "f");
        });
        __classPrivateFieldSet(this, _Cart_price, 0, "f");
        __classPrivateFieldSet(this, _Cart_list, {}, "f");
        // see if localStorage exits, if not create it
        if (localStorage.getItem("euroCart") === null) {
            localStorage.setItem("euroCart", JSON.stringify({}));
        }
    }
}
_Cart_price = new WeakMap(), _Cart_list = new WeakMap();
export const cart = new Cart();
//# sourceMappingURL=cart.js.map