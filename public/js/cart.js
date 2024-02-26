/*
    cart.getPrice()
        ukupna cijena svega u cartu

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

    cart.add(coin, issue)
        dodaje jedan issue u cart
        returna true ako je uspjesno dodan, false ako nije, u konzolu ispise razlog ako nije uspio.

    cart.remove(issue)
        mice jedan issue iz carta
        returna true ako je uspjesno maknut, false ako nije, u konzolu ispise razlog ako nije uspio.

    cart.removeAll(issue)
        skroz mice issue iz carta (npr. ako je neki issue dodan vise puta skroz ce ga maknuti)

    cart.clear()
        makne sve iz carta
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
export class Cart {
    /**
     * Create a new shopping cart.
     */
    constructor() {
        _Cart_price.set(this, void 0);
        _Cart_list.set(this, void 0);
        /**
         * Get the total price of all issues in the cart.
         * @return {number} The total price.
         */
        this.getPrice = () => __classPrivateFieldGet(this, _Cart_price, "f");
        /**
         * Get all issues in the cart.
         * @return {Array} The items in the cart.
         */
        this.getItems = () => {
            // Mozda napravit u buducnosti da se sortira po necem korisnom prije returna
            return Object.values(__classPrivateFieldGet(this, _Cart_list, "f"));
        };
        /**
         * Get an issue from the cart.
         * @param {number} id - The id of the issue to get.
         * @return {Object} The issue.
         * @return {undefined} If the issue is not in the cart.
         */
        this.getIssue = (id) => __classPrivateFieldGet(this, _Cart_list, "f")[id];
        /**
         * Add an issue to the cart.
         * @param {Object} coin - The coin to add.
         * @param {Object} issue - The issue to add.
         */
        this.add = (coin, issue) => {
            console.log(coin, "\n", issue.coinId);
            if (__classPrivateFieldGet(this, _Cart_list, "f").hasOwnProperty(issue.id)) {
                if (__classPrivateFieldGet(this, _Cart_list, "f")[issue.id].amount === issue.limit) {
                    console.log("Limit dosegnut");
                    return false;
                }
                __classPrivateFieldSet(this, _Cart_price, __classPrivateFieldGet(this, _Cart_price, "f") + Number(issue.price), "f");
                __classPrivateFieldGet(this, _Cart_list, "f")[issue.id].amount++;
                __classPrivateFieldGet(this, _Cart_list, "f")[issue.id].total += Number(issue.price);
                let num = parseInt(localStorage.getItem(issue.id));
                num++;
                localStorage.setItem(issue.id, num);
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
            localStorage.setItem(issue.id, 1);
            __classPrivateFieldSet(this, _Cart_price, __classPrivateFieldGet(this, _Cart_price, "f") + Number(issue.price), "f");
            console.log(this.getItems());
            return true;
        };
        /**
         * Remove an issue from the cart.
         * @param {Object} issue - The issue to remove.
         */
        this.remove = (issue) => {
            if (!__classPrivateFieldGet(this, _Cart_list, "f").hasOwnProperty(issue.id)) {
                console.log("Item nije u cartu");
                return false;
            }
            __classPrivateFieldSet(this, _Cart_price, __classPrivateFieldGet(this, _Cart_price, "f") - issue.price, "f");
            __classPrivateFieldGet(this, _Cart_list, "f")[issue.id].amount--;
            __classPrivateFieldGet(this, _Cart_list, "f")[issue.id].total -= issue.price;
            let num = parseInt(localStorage.getItem(issue.id));
            num--;
            localStorage.setItem(issue.id, num);
            if (__classPrivateFieldGet(this, _Cart_list, "f")[issue.id].amount === 0) {
                delete __classPrivateFieldGet(this, _Cart_list, "f")[issue.id];
                localStorage.removeItem(issue.id);
                return false;
            }
            return true;
        };
        /**
         * Remove all instances of an issue from the cart.
         * @param {Object} issue - The issue to remove.
         */
        this.removeAll = (issue) => {
            if (__classPrivateFieldGet(this, _Cart_list, "f").hasOwnProperty(issue.id)) {
                this.price -= issue.price * __classPrivateFieldGet(this, _Cart_list, "f")[issue.id].amount;
                delete __classPrivateFieldGet(this, _Cart_list, "f")[issue.id];
                localStorage.removeItem(issue.id);
            }
        };
        /**
         * Remove all issues from the cart.
         */
        this.clear = () => {
            __classPrivateFieldSet(this, _Cart_price, 0, "f");
            __classPrivateFieldSet(this, _Cart_list, {}, "f");
            localStorage.clear();
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
                    return;
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
                const data = yield response.json();
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
                body: JSON.stringify({ localStorage }),
            });
            if (!response.ok) {
                console.error("Error loading order");
                return;
            }
            const data = yield response.json();
            console.log(data);
            __classPrivateFieldSet(this, _Cart_price, data.price, "f");
            __classPrivateFieldSet(this, _Cart_list, data.list, "f");
        });
        __classPrivateFieldSet(this, _Cart_price, 0, "f");
        __classPrivateFieldSet(this, _Cart_list, {}, "f");
    }
}
_Cart_price = new WeakMap(), _Cart_list = new WeakMap();
// const cart = new Cart();
//# sourceMappingURL=cart.js.map