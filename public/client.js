function handleCoinForm(countryId, yearId, name, src) {
    console.log(countryId);
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