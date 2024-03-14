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

import { json } from "stream/consumers";
import { CartItem, Coin, IssueOnClient } from "../../types";

/**
 * Class representing a shopping cart.
 */
class Cart {
  #price: number;
  #list: { [issueId: string]: CartItem };

  /**
   * Create a new shopping cart.
   */
  constructor() {
    this.#price = 0;
    this.#list = {};

    // see if localStorage exits, if not create it
    if (localStorage.getItem("euroCart") === null) {
      localStorage.setItem("euroCart", JSON.stringify({}));
    }
  }

  getPrice = (): number => this.#price;

  getItems = () => {
    // Mozda napravit u buducnosti da se sortira po necem korisnom prije returna
    return Object.values(this.#list);
  };

  getIssue = (id: string) => {
    return this.#list[id];
  };

  add = (coin: Coin, issue: IssueOnClient) => {
    if (this.#list.hasOwnProperty(issue.id)) {
      if (this.#list[issue.id].amount === issue.limit) {
        console.log("Limit dosegnut");
        return false;
      }

      this.#price += Number(issue.price);
      this.#list[issue.id].amount++;
      this.#list[issue.id].total += Number(issue.price);

      const storageCart = JSON.parse(localStorage.getItem("euroCart"));
      if (storageCart === null) return false;

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

    this.#list[issue.id] = {
      coin,
      issue,
      amount: 1,
      total: Number(issue.price),
    };
    const coinId = coin._id.toString();
    const storageCart = JSON.parse(localStorage.getItem("euroCart"));
    storageCart[issue.id] = "1";
    localStorage.setItem("euroCart", JSON.stringify(storageCart));

    this.#price += Number(issue.price);
    console.log(this.getItems());
    return true;
  };

  remove = (issue: IssueOnClient) => {
    if (!this.#list.hasOwnProperty(issue.id)) {
      console.log("Item nije u cartu");
      return false;
    }
    this.#price -= Number(issue.price);
    this.#list[issue.id].amount--;
    this.#list[issue.id].total -= Number(issue.price);

    const storageCart = JSON.parse(localStorage.getItem("euroCart"));
    if (storageCart === null) return false;

    // TODO: jel bi bilo bolje zapisati #list.amount, tako da sigurno bude isto ko displayano
    let num = parseInt(storageCart[issue.id] || "0");
    num--;
    storageCart[issue.id] = num;
    localStorage.setItem("euroCart", JSON.stringify(storageCart));

    if (this.#list[issue.id].amount === 0) {
      delete this.#list[issue.id];

      // remove javascript object key
      delete storageCart[issue.id];
      localStorage.setItem("euroCart", JSON.stringify(storageCart));

      return false;
    }
    return true;
  };

  removeAll = (issue: IssueOnClient) => {
    if (this.#list.hasOwnProperty(issue.id)) {
      this.#price -= Number(issue.price) * this.#list[issue.id].amount;
      delete this.#list[issue.id];

      const storageCart = JSON.parse(localStorage.getItem("euroCart"));

      delete storageCart[issue.id];

      localStorage.setItem("euroCart", JSON.stringify(storageCart));
    }
  };

  clear = () => {
    this.#price = 0;
    this.#list = {};

    const storageCart = JSON.parse(localStorage.getItem("euroCart"));

    for (const key in storageCart) {
      delete storageCart[key];
    }
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
  sendOrder = async (): Promise<boolean> => {
    try {
      if (this.#price === 0) {
        return false;
      }

      const order: { [issueId: string]: number } = {};

      // Construct the order object
      for (let [issueId, value] of Object.entries(this.#list)) {
        order[issueId] = value.amount;
      }

      // Send the order
      const response = await fetch("/order/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order }),
      });

      const data = (await response.json()) as { error: boolean; message: string };

      if (!response.ok) {
        console.error("Error sending the order:", data.message);
      }

      return data.error;
    } catch (error) {
      console.error("Network error:", error);
      return true;
    }
  };

  load = async () => {
    this.#price = 0;
    this.#list = {};

    const response = await fetch("/cart", {
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

    const data = (await response.json()) as {
      price: number;
      list: { [issueId: string]: CartItem };
    };
    console.log(data);
    this.#price = data.price;
    this.#list = data.list;
  };
}

export const cart = new Cart();
