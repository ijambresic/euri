var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function initPurchaseHistory() {
    const section = document.getElementById("purchaseHistory");
    const title = section.querySelector("h2");
    const form = section.querySelector("form");
    const controls = form.querySelectorAll("input, button");
    const formStatus = document.getElementById("purchaseFormStatus");
    const historyStatus = document.getElementById("purchaseHistoryStatus");
    const table = section.querySelector("table");
    const rows = table.tBodies[0];
    let selected;
    let historyRequest;
    function loadHistory(issueId) {
        return __awaiter(this, void 0, void 0, function* () {
            historyRequest === null || historyRequest === void 0 ? void 0 : historyRequest.abort();
            const request = new AbortController();
            historyRequest = request;
            table.hidden = true;
            rows.replaceChildren();
            historyStatus.textContent = "Loading purchases…";
            try {
                const response = yield fetch(`/edit/issues/${issueId}/purchases`, { signal: request.signal });
                if (!response.ok)
                    throw new Error("Could not load purchases.");
                const purchases = yield response.json();
                if (request.signal.aborted)
                    return;
                for (const { date, seller, quantity, unitPriceCents } of purchases) {
                    const cents = String(unitPriceCents).padStart(3, "0");
                    const price = `€${cents.slice(0, -2)}.${cents.slice(-2)}`;
                    const row = rows.insertRow();
                    for (const value of [date, seller, String(quantity), price]) {
                        row.insertCell().textContent = value;
                    }
                }
                table.hidden = purchases.length === 0;
                historyStatus.textContent = purchases.length ? "" : "No purchases recorded.";
            }
            catch (_a) {
                if (!request.signal.aborted) {
                    historyStatus.textContent = "Could not load purchase history. Select the issue again to retry.";
                }
            }
        });
    }
    form.addEventListener("submit", (event) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        event.preventDefault();
        const selection = selected;
        if (!selection || selection.saving)
            return;
        const values = new FormData(form);
        const fields = {
            seller: String(values.get("seller")).trim(),
            quantity: Number(values.get("quantity")),
            unitPrice: values.get("unitPrice"),
            date: values.get("date"),
        };
        const signature = JSON.stringify(fields);
        if (((_a = selection.submission) === null || _a === void 0 ? void 0 : _a.fields) !== signature) {
            const bytes = crypto.getRandomValues(new Uint8Array(12));
            const id = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
            selection.submission = { id, fields: signature };
        }
        selection.saving = true;
        controls.forEach((control) => { control.disabled = true; });
        formStatus.textContent = "Saving purchase…";
        try {
            const response = yield fetch(`/edit/issues/${selection.issueId}/purchases`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.assign({ id: selection.submission.id }, fields)),
            });
            if (!response.ok) {
                const error = yield response.json().catch(() => null);
                if (selected === selection) {
                    formStatus.textContent = (_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : "Could not save the purchase. Try again.";
                }
                return;
            }
            if (selected === selection) {
                selection.submission = undefined;
                form.reset();
                formStatus.textContent = "Purchase saved.";
            }
            if ((selected === null || selected === void 0 ? void 0 : selected.issueId) === selection.issueId)
                void loadHistory(selection.issueId);
        }
        catch (_c) {
            if (selected === selection) {
                formStatus.textContent = "Could not save the purchase. Try again.";
            }
        }
        finally {
            selection.saving = false;
            if (selected === selection)
                controls.forEach((control) => { control.disabled = false; });
        }
    }));
    return (issueId, issueName) => {
        if (issueId !== (selected === null || selected === void 0 ? void 0 : selected.issueId)) {
            historyRequest === null || historyRequest === void 0 ? void 0 : historyRequest.abort();
            selected = issueId ? { issueId, saving: false } : undefined;
            form.reset();
            formStatus.textContent = "";
            controls.forEach((control) => { control.disabled = false; });
        }
        section.hidden = !issueId;
        if (issueId) {
            title.textContent = `Purchase history — ${issueName}`;
            void loadHistory(issueId);
        }
    };
}
//# sourceMappingURL=purchaseHistory.js.map