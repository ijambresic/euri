const canvas = document.getElementById('chart').getContext('2d');

let chart;

const loadDataDays = async (coinId) => {

    if (chart) {
        chart.destroy();
    }

    const response = await fetch(`/analytics/days?coin_id=${coinId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        console.log('Failed to load chart!');
        return ;
    }

    const { labels, datasets } = await response.json();

    chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets
        }
    });
}
