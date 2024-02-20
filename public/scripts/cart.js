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

/**
 * Class representing a shopping cart.
 */
class Cart {
  #price;
  #list;

  /**
   * Create a new shopping cart.
   */
  constructor() {
    this.#price = 0;
    this.#list = {};
  }

  /**
   * Get the total price of all issues in the cart.
   * @return {number} The total price.
   */
  getPrice = () => this.#price;

  /**
   * Get all issues in the cart.
   * @return {Array} The items in the cart.
   */
  getItems = () => Object.values(this.#list);

  /**
   * Get an issue from the cart.
   * @param {number} id - The id of the issue to get.
   * @return {Object} The issue.
   * @return {undefined} If the issue is not in the cart.
   */
  getIssue = (id) => this.#list[id];

  /**
   * Add an issue to the cart.
   * @param {Object} coin - The coin to add.
   * @param {Object} issue - The issue to add.
   */
  add = (coin, issue) => {
    this.#price += Number(issue.price);

    if (this.#list.hasOwnProperty(issue.id)) {
      if (this.#list[issue.id].amount === issue.limit) {
        console.log("Limit dosegnut");
        return false;
      }
      this.#list[issue.id].amount++;
      this.#list[issue.id].total += Number(issue.price);
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
    return true;
  };

  /**
   * Remove an issue from the cart.
   * @param {Object} issue - The issue to remove.
   */
  remove = (issue) => {
    if (!this.#list.hasOwnProperty(issue.id)) {
      console.log("Item nije u cartu");
      return false;
    }
    this.price -= issue.price;
    this.#list[issue.id].amount--;
    this.#list[issue.id].total -= issue.price;
    if (this.#list[issue.id].amount === 0) {
      delete this.#list[issue.id];
    }
    return true;
  };

  /**
   * Remove all instances of an issue from the cart.
   * @param {Object} issue - The issue to remove.
   */
  removeAll = (issue) => {
    if (this.#list.hasOwnProperty(issue.id)) {
      this.price -= issue.price * this.#list[issue.id].amount;
      delete this.#list[issue.id];
    }
  };

  /**
   * Remove all issues from the cart.
   */
  clear = () => {
    this.#price = 0;
    this.#list = {};
  };

  sendOrder = () => {
    console.log(this.#list);
    const order = {};
    for (let [issueId, value] of Object.entries(this.#list)) {
      order[issueId] = value.amount;
    }
    fetch("/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order })
    })
    .then(response => {
      if (response.ok) {
        console.log("Order sent successfully");
      } else {
        console.error("Order failed");
      }
    })
    .catch(error => {
      console.error("Network error:", error);
    });
  }
}

// const cart = new Cart();
