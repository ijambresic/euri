import type { Chart } from "../../../node_modules/chart.js/dist/types";

type ResponseData = {
  labels: string[];
  datasets: Dataset[];
};
type Dataset = {
  label: string;
  data: (number | null)[];
};

const daysCanvas = document.getElementById("daysChart") as HTMLCanvasElement;
const monthsCanvas = document.getElementById("monthsChart") as HTMLCanvasElement;

const daysCtx = daysCanvas.getContext("2d") as CanvasRenderingContext2D;
const monthsCtx = monthsCanvas.getContext("2d") as CanvasRenderingContext2D;

const chartTypes = [
  {
    name: "days",
    ctx: daysCtx,
    chart: null as Chart | null,
  },
  {
    name: "months",
    ctx: monthsCtx,
    chart: null as Chart | null,
  },
];

export const loadData = async (coinId: string) => {
  for (const type of chartTypes) {
    const response = await fetch(`/analytics/${type.name}?coin_id=${coinId}`);

    if (!response.ok) {
      console.log("Failed to load chart data of type", type.name);
      return;
    }

    const { labels, datasets } = (await response.json()) as ResponseData;

    if (type.chart) type.chart.destroy();

    type.chart = new Chart(type.ctx, {
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
  }
};
