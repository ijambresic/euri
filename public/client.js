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
    return new Promise((resolve, reject) => {
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
                    response.json().then(data => resolve(data.newId.toString()));
                } else {
                    console.error('Form submission failed');
                    reject(new Error('Form submission failed'));
                }
            })
            .catch(error => {
                console.error('Network error:', error);
                reject(error);
            });
    });
}

async function handleEditIssue(issueId, name, price, amount) {
    fetch('/editIssue', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ issueId, name, price, amount })
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

function attachEditIssueListeners(item) {
    item.addEventListener('click', function () {
        const issueId = item.getAttribute('data-issue-id');
        const form = document.createElement('form');
        form.innerHTML = `
                <input type="text" name="issueName" value="${issueMap.get(issueId).name}" required><br>
                <input type="number" name="price" value="${issueMap.get(issueId).price}" required><br>
                <input type="number" name="amount" value="${issueMap.get(issueId).amount}" required><br>
                <button type="submit">Update</button>
                <button type="button" class="cancelBtn">Cancel</button>
            `;

        item.replaceWith(form);

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const formData = new FormData(form);
            const updatedIssue = {
                name: formData.get('issueName'),
                price: formData.get('price'),
                amount: formData.get('amount')
            };

            handleEditIssue(issueId, updatedIssue.name, updatedIssue.price, updatedIssue.amount)
            .then(() => {

                issueMap.get(issueId).name = updatedIssue.name;
                issueMap.get(issueId).price = updatedIssue.price;
                issueMap.get(issueId).amount = updatedIssue.amount;

                const updatedItem = document.createElement('li');
                updatedItem.classList.add('editIssue');
                updatedItem.setAttribute('data-issue-id', issueId);
                updatedItem.innerHTML = `${updatedIssue.name}: Price: ${updatedIssue.price}, Amount: ${updatedIssue.amount}`;
                form.replaceWith(updatedItem);
                attachEditIssueListeners(updatedItem);

            });
        });

        const cancelBtn = form.querySelector('.cancelBtn');
        cancelBtn.addEventListener('click', function () {
            const originalItem = document.createElement('li');
            originalItem.classList.add('editIssue');
            originalItem.setAttribute('data-issue-id', issueId);
            originalItem.innerHTML = `${issueMap.get(issueId).name}: Price: ${issueMap.get(issueId).price}, Amount: ${issueMap.get(issueId).amount}`;
            form.replaceWith(originalItem);
            attachEditIssueListeners(originalItem);
        });
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

                handleIssueForm(coinId, issueName, price, amount)
                    .then(newId => {
                        const newIssue = document.createElement('li');
                        newIssue.setAttribute('data-issue-id', newId.toString());
                        newIssue.textContent = `${issueName}: Price: ${price}, Amount: ${amount}`;
                        subList.appendChild(newIssue);
                        console.log(newId);
                        issueMap.set(newId, {
                            name: issueName,
                            price,
                            amount
                        });
                        console.log(issueMap);
                        attachEditIssueListeners(newIssue);
                    })
                    .catch(error => {
                        console.log('Error:', error);
                    });

                form.remove();
            });

            const cancelButton = form.querySelector('.cancel');
            cancelButton.addEventListener('click', function () {
                form.remove();
            });
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const editIssueItems = document.querySelectorAll('.editIssue');
    editIssueItems.forEach(item => attachEditIssueListeners(item));
});