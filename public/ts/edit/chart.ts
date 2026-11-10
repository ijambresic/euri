// `Chart` itself is a global: edit.ejs loads Chart.js from a CDN (see globals.d.ts).
import type { Chart as ChartInstance } from "chart.js";

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
    chart: null as ChartInstance | null,
  },
  {
    name: "months",
    ctx: monthsCtx,
    chart: null as ChartInstance | null,
  },
];

let latestLoad = 0;
export const loadData = async (coinId: string) => {
  const load = ++latestLoad;
  for (const type of chartTypes) {
    const response = await fetch(`/analytics/${type.name}?coin_id=${coinId}`);

    if (!response.ok) {
      console.log("Failed to load chart data of type", type.name);
      return;
    }

    const { labels, datasets } = (await response.json()) as ResponseData;
    if (load !== latestLoad) return;

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
