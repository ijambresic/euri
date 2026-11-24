import type { Purchase } from "../../../types.js";

type PurchaseIssue = { id: string; name: string };

function priceValue(cents: number) {
  const value = String(cents).padStart(3, "0");
  return `${value.slice(0, -2)}.${value.slice(-2)}`;
}

function createIssueHistory(
  issue: PurchaseIssue,
  template: HTMLTemplateElement,
  onSaved: () => void
) {
  const panel = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
  const title = panel.querySelector("h3") as HTMLHeadingElement;
  const form = panel.querySelector("form") as HTMLFormElement;
  const submit = form.querySelector('[type="submit"]') as HTMLButtonElement;
  const cancel = form.querySelector(".purchaseCancel") as HTMLButtonElement;
  const formStatus = panel.querySelector(".purchaseFormStatus") as HTMLElement;
  const historyStatus = panel.querySelector(".purchaseHistoryStatus") as HTMLElement;
  const table = panel.querySelector("table") as HTMLTableElement;
  const rows = table.tBodies[0];
  const endpoint = `/edit/issues/${issue.id}/purchases`;
  let editing: Purchase | undefined;
  let saving = false;
  let disposed = false;
  let submission: { id: string; fields: string } | undefined;
  let historyRequest: AbortController | undefined;

  title.id = `purchase-history-${issue.id}`;
  panel.setAttribute("aria-labelledby", title.id);
  table.setAttribute("aria-labelledby", title.id);

  function setBusy(busy: boolean) {
    panel.querySelectorAll<HTMLInputElement | HTMLButtonElement>("input, button")
      .forEach((control) => { control.disabled = busy; });
  }

  function resetForm() {
    editing = undefined;
    submission = undefined;
    form.reset();
    submit.textContent = "Add purchase";
    cancel.hidden = true;
  }

  function editPurchase(purchase: Purchase) {
    if (saving) return;
    editing = purchase;
    const fields = {
      seller: purchase.seller,
      quantity: String(purchase.quantity),
      unitPrice: priceValue(purchase.unitPriceCents),
      date: purchase.date,
    };
    for (const [name, value] of Object.entries(fields)) {
      (form.elements.namedItem(name) as HTMLInputElement).value = value;
    }
    submit.textContent = "Save changes";
    cancel.hidden = false;
    formStatus.textContent = `Editing purchase from ${purchase.seller} on ${purchase.date}.`;
    (form.elements.namedItem("seller") as HTMLInputElement).focus();
  }

  async function loadHistory() {
    historyRequest?.abort();
    const request = new AbortController();
    historyRequest = request;
    table.hidden = true;
    rows.replaceChildren();
    historyStatus.textContent = "Loading purchases…";

    try {
      const response = await fetch(endpoint, { signal: request.signal });
      if (!response.ok) throw new Error("Could not load purchases.");
      const purchases: Purchase[] = await response.json();
      if (request.signal.aborted || disposed) return;

      for (const purchase of purchases) {
        const { date, seller, quantity, unitPriceCents } = purchase;
        const row = rows.insertRow();
        for (const value of [date, seller, String(quantity), `€${priceValue(unitPriceCents)}`]) {
          row.insertCell().textContent = value;
        }
        const actions = document.createElement("div");
        actions.className = "purchaseActions";
        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "secondaryButton";
        edit.textContent = "Edit";
        edit.setAttribute("aria-label", `Edit purchase from ${seller} on ${date}`);
        edit.addEventListener("click", () => editPurchase(purchase));
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "secondaryButton";
        remove.textContent = "Delete";
        remove.setAttribute("aria-label", `Delete purchase from ${seller} on ${date}`);
        remove.addEventListener("click", () => {
          if (saving || !confirm(`Delete purchase from ${seller} on ${date}?`)) return;
          void savePurchase("DELETE", purchase.id);
        });
        actions.append(edit, remove);
        row.insertCell().append(actions);
      }
      table.hidden = purchases.length === 0;
      historyStatus.textContent = purchases.length ? "" : "No purchases recorded.";
      setBusy(saving);
    } catch {
      if (!request.signal.aborted && !disposed) {
        historyStatus.textContent = "Could not load purchase history. Select the coin again to retry.";
      }
    }
  }

  async function savePurchase(method: "POST" | "PUT" | "DELETE", id: string, fields?: object) {
    if (saving || disposed) return;
    saving = true;
    setBusy(true);
    formStatus.textContent = method === "DELETE" ? "Deleting purchase…" : "Saving purchase…";

    try {
      const url = method === "POST" ? endpoint : `${endpoint}/${id}`;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: fields ? JSON.stringify({ id, ...fields }) : undefined,
      });
      if (!response.ok) {
        if (disposed) return;
        const error = await response.json().catch(() => null);
        formStatus.textContent = error?.message ?? "Could not save the change. Try again.";
        return;
      }
      if (disposed) {
        onSaved();
        return;
      }

      if (method !== "DELETE" || editing?.id === id) resetForm();
      formStatus.textContent = method === "DELETE" ? "Purchase deleted." : "Purchase saved.";
      await loadHistory();
    } catch {
      if (!disposed) formStatus.textContent = "Could not save the change. Try again.";
    } finally {
      saving = false;
      if (!disposed) setBusy(false);
    }
  }

  cancel.addEventListener("click", () => {
    resetForm();
    formStatus.textContent = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (saving) return;
    const values = new FormData(form);
    const fields = {
      seller: String(values.get("seller")).trim(),
      quantity: Number(values.get("quantity")),
      unitPrice: values.get("unitPrice"),
      date: values.get("date"),
    };
    if (editing) {
      void savePurchase("PUT", editing.id, fields);
      return;
    }
    const signature = JSON.stringify(fields);
    if (submission?.fields !== signature) {
      const bytes = crypto.getRandomValues(new Uint8Array(12));
      const id = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
      submission = { id, fields: signature };
    }
    void savePurchase("POST", submission.id, fields);
  });

  return {
    panel,
    update(name: string) {
      title.textContent = name;
      if (!saving) void loadHistory();
    },
    refresh() {
      if (!saving) void loadHistory();
    },
    dispose() {
      disposed = true;
      historyRequest?.abort();
      panel.remove();
    },
  };
}

export function initPurchaseHistory() {
  const section = document.getElementById("purchaseHistory") as HTMLElement;
  const container = document.getElementById("purchaseIssues") as HTMLElement;
  const template = document.getElementById("purchaseIssueTemplate") as HTMLTemplateElement;
  const panels = new Map<string, ReturnType<typeof createIssueHistory>>();
  let selectedCoin: string | undefined;

  return (coinId: string, issues: PurchaseIssue[]) => {
    if (selectedCoin !== coinId) {
      panels.forEach((history) => history.dispose());
      panels.clear();
      container.replaceChildren();
      selectedCoin = coinId;
    }
    section.hidden = false;
    if (!issues.length) container.textContent = "No issues for this coin.";
    for (const issue of issues) {
      let history = panels.get(issue.id);
      if (!history) {
        if (!panels.size) container.replaceChildren();
        history = createIssueHistory(issue, template, () => panels.get(issue.id)?.refresh());
        panels.set(issue.id, history);
        container.append(history.panel);
      }
      history.update(issue.name);
    }
  };
}
