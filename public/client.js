function handleCoinForm(countryId, yearId, name, src) {
    fetch('/addCoin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ countryId, yearId, name, src })
    })
    .then(response => {
        if (response.ok) {
            console.log('Form submitted successfully');
        } else {
            console.error('Form submission failed');
        }
    })
    .catch(error => {
        console.error('Network error:', error);
    });
}

function handleIssueForm(coinId, name, price, amount) {
    fetch('/addIssue', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coinId, name, price, amount })
    })
    .then(response => {
        if (response.ok) {
            console.log('Form submitted successfully');
        } else {
            console.error('Form submission failed');
        }
    })
    .catch(error => {
        console.error('Network error:', error);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const addIssueButtons = document.querySelectorAll('.addIssueButton');

    addIssueButtons.forEach(button => {
        button.addEventListener('click', function () {
            const parentLi = button.parentNode;
            const subList = parentLi.querySelector('.sublist');

            const form = document.createElement('form');
            form.innerHTML = `
                <input type="text" name="issueName" placeholder="Issue Name" required><br>
                <input type="number" name="price" placeholder="Price" required><br>
                <input type="number" name="amount" placeholder="Amount" required><br>
                <button type="submit">Add</button>
                <button type="button" class="cancel">Cancel</button>
            `;
            subList.appendChild(form);

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                const formData = new FormData(form);
                const issueName = formData.get('issueName');
                const price = formData.get('price');
                const amount = formData.get('amount');
                const coinId = parentLi.getAttribute('id');

                handleIssueForm(coinId, issueName, price, amount);

                const newIssue = document.createElement('li');
                newIssue.textContent = `${issueName}: Price: ${price}, Amount: ${amount}`;
                subList.appendChild(newIssue);

                form.remove();
            });

            const cancelButton = form.querySelector('.cancel');
            cancelButton.addEventListener('click', function () {
                form.remove();
            });
        });
    });
});