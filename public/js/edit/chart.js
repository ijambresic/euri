var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const chartElement = document.getElementById("chart");
const canvas = chartElement.getContext("2d");
let chart = null;
export const loadData = (type, coinId) => __awaiter(void 0, void 0, void 0, function* () {
    if (chart) {
        chart.destroy();
    }
    const response = yield fetch(`/analytics/${type}?coin_id=${coinId}`);
    if (!response.ok) {
        console.log("Failed to load chart!");
        return;
    }
    const { labels, datasets } = (yield response.json());
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
});
//# sourceMappingURL=chart.js.map