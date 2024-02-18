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

    cart.remove(issue)
        mice jedan issue iz carta

    cart.removeAll(issue)
        skroz mice issue iz carta (npr. ako je neki issue dodan vise puta skroz ce ga maknuti)

    cart.clear()
        makne sve iz carta
*/

class Cart {

    #price
    #list

    constructor() {
        this.#price = 0;
        this.#list = {};
    }

    getPrice = () => this.#price;

    getItems = () => this.#list.values();

    add = (coin, issue) => {
        this.#price += issue.price;
        if (this.#list.hasOwnProperty(issue.id)) {
            this.#list[issue.id].amount++;
            this.#list[issue.id].total+=issue.price;
        } else {
            this.#list[issue.id] = {
                coin,
                issue,
                amount: 1,
                total: issue.price
            }
        }
    }

    remove = (issue) => {
        if (!this.#list.hasOwnProperty(issue.id)) {
            console.log("Item nije u cartu");
            return ;
        }
        this.price-=issue.price;
        this.#list[issue.id].amount--;
        this.#list[issue.id].total-=issue.price;
        if (this.#list[issue.id].amount === 0) {
            delete this.#list[issue.id];
        }
    }

    removeAll = (issue) => {
        if (this.#list.hasOwnProperty(issue.id)) {
            this.price-=issue.price*this.#list[issue.id].amount;
            delete this.#list[issue.id];
        }
    }

    clear = () => {
        this.#price = 0;
        this.#list = {};
    }
}

const cart = new Cart();