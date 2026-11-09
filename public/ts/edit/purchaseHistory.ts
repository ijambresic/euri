import type { Purchase } from "../../../types.js";

export function initPurchaseHistory() {
  const section = document.getElementById("purchaseHistory") as HTMLElement;
  const title = section.querySelector("h2") as HTMLHeadingElement;
  const form = section.querySelector("form") as HTMLFormElement;
  const controls = form.querySelectorAll<HTMLInputElement | HTMLButtonElement>("input, button");
  const formStatus = document.getElementById("purchaseFormStatus") as HTMLElement;
  const historyStatus = document.getElementById("purchaseHistoryStatus") as HTMLElement;
  const table = section.querySelector("table") as HTMLTableElement;
  const rows = table.tBodies[0];

  type Selection = {
    issueId: string;
    saving: boolean;
    submission?: { id: string; fields: string };
  };
  let selected: Selection | undefined;
  let historyRequest: AbortController | undefined;

  async function loadHistory(issueId: string) {
    historyRequest?.abort();
    const request = new AbortController();
    historyRequest = request;
    table.hidden = true;
    rows.replaceChildren();
    historyStatus.textContent = "Loading purchases…";

    try {
      const response = await fetch(`/edit/issues/${issueId}/purchases`, { signal: request.signal });
      if (!response.ok) throw new Error("Could not load purchases.");
      const purchases: Purchase[] = await response.json();
      if (request.signal.aborted) return;

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
    } catch {
      if (!request.signal.aborted) {
        historyStatus.textContent = "Could not load purchase history. Select the issue again to retry.";
      }
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const selection = selected;
    if (!selection || selection.saving) return;

    const values = new FormData(form);
    const fields = {
      seller: String(values.get("seller")).trim(),
      quantity: Number(values.get("quantity")),
      unitPrice: values.get("unitPrice"),
      date: values.get("date"),
    };
    const signature = JSON.stringify(fields);
    if (selection.submission?.fields !== signature) {
      const bytes = crypto.getRandomValues(new Uint8Array(12));
      const id = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
      selection.submission = { id, fields: signature };
    }

    selection.saving = true;
    controls.forEach((control) => { control.disabled = true; });
    formStatus.textContent = "Saving purchase…";
    try {
      const response = await fetch(`/edit/issues/${selection.issueId}/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selection.submission.id, ...fields }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        if (selected === selection) {
          formStatus.textContent = error?.message ?? "Could not save the purchase. Try again.";
        }
        return;
      }

      if (selected === selection) {
        selection.submission = undefined;
        form.reset();
        formStatus.textContent = "Purchase saved.";
      }
      if (selected?.issueId === selection.issueId) void loadHistory(selection.issueId);
    } catch {
      if (selected === selection) {
        formStatus.textContent = "Could not save the purchase. Try again.";
      }
    } finally {
      selection.saving = false;
      if (selected === selection) controls.forEach((control) => { control.disabled = false; });
    }
  });

  return (issueId?: string, issueName?: string) => {
    if (issueId !== selected?.issueId) {
      historyRequest?.abort();
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
