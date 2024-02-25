const canvas = document.getElementById('chart').getContext('2d');

let chart;

const loadData = async (type, coinId) => {

    if (chart) {
        chart.destroy();
    }

    const response = await fetch(`/analytics/${type}?coin_id=${coinId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        console.log('Failed to load chart!');
        return;
    }

    const { labels, datasets } = await response.json();

    chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets
        },
        options: {
            scales: {
                y: {
                    stacked: true
                },
                x: {
                    stacked: true
                }
            }
        }
    });
}
