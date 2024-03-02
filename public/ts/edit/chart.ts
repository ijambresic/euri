import { Chart } from "../../../node_modules/chart.js/dist/types";
type ResponseData = {
  labels: string[];
  datasets: Dataset[];
};
type Dataset = {
  label: string;
  data: (number | null)[];
};

const chartElement = document.getElementById("chart") as HTMLCanvasElement;
const canvas = chartElement.getContext("2d") as CanvasRenderingContext2D;

let chart: Chart | null = null;

const loadData = async (type: string, coinId: string) => {
  if (chart) {
    chart.destroy();
  }

  const response = await fetch(`/analytics/${type}?coin_id=${coinId}`);

  if (!response.ok) {
    console.log("Failed to load chart!");
    return;
  }

  const { labels, datasets } = (await response.json()) as ResponseData;

  chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets,
    },
    options: {
      scales: {
        y: {
          stacked: true,
        },
        x: {
          stacked: true,
        },
      },
    },
  });
};
