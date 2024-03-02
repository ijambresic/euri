var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const daysCanvas = document.getElementById("daysChart");
const monthsCanvas = document.getElementById("monthsChart");
const daysCtx = daysCanvas.getContext("2d");
const monthsCtx = monthsCanvas.getContext("2d");
const chartTypes = [
    {
        name: "days",
        ctx: daysCtx,
        chart: null,
    },
    {
        name: "months",
        ctx: monthsCtx,
        chart: null,
    },
];
export const loadData = (coinId) => __awaiter(void 0, void 0, void 0, function* () {
    for (const type of chartTypes) {
        const response = yield fetch(`/analytics/${type.name}?coin_id=${coinId}`);
        if (!response.ok) {
            console.log("Failed to load chart data of type", type.name);
            return;
        }
        const { labels, datasets } = (yield response.json());
        if (type.chart)
            type.chart.destroy();
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
});
//# sourceMappingURL=chart.js.map