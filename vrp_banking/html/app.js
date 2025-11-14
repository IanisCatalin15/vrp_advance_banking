const defaultState = {
    playerName: "",
    bankName: "",
    balance: 0,
    wallet: 0,
    taxesIn: 0,
    taxesOut: 0,
    minDeposit: 0,
    minWithdraw: 0,
    depositLevel: 1,
    maxStacks: 0,
    maxBankMoney: 0,
    accountPrice: 0,
    hasAccount: true,
    transactions: []
};

let state = { ...defaultState };
let toastTimeout;

const elements = {
    bankName: document.getElementById("bankName"),
    playerName: document.getElementById("playerName"),
    bankBalance: document.getElementById("bankBalance"),
    walletBalance: document.getElementById("walletBalance"),
    taxesIn: document.getElementById("taxesIn"),
    taxesOut: document.getElementById("taxesOut"),
    minDeposit: document.getElementById("minDeposit"),
    minWithdraw: document.getElementById("minWithdraw"),
    depositLevel: document.getElementById("depositLevel"),
    maxStacks: document.getElementById("maxStacks"),
    maxBankMoney: document.getElementById("maxBankMoney"),
    accountOverlay: document.getElementById("accountOverlay"),
    accountPrice: document.getElementById("accountPrice"),
    transactionsBody: document.getElementById("transactionsBody"),
    toast: document.getElementById("toast"),
    depositInput: document.getElementById("depositAmount"),
    withdrawInput: document.getElementById("withdrawAmount"),
    pinInput: document.getElementById("pinInput")
};

const currency = new Intl.NumberFormat("ro-RO");

function formatMoney(value) {
    return "$" + currency.format(Math.floor(Number(value) || 0));
}

function renderTransactions(transactions) {
    const body = elements.transactionsBody;
    body.innerHTML = "";

    if (!transactions || transactions.length === 0) {
        const emptyRow = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 4;
        cell.className = "transactions__empty";
        cell.textContent = "Nu există tranzacții.";
        emptyRow.appendChild(cell);
        body.appendChild(emptyRow);
        return;
    }

    transactions.forEach((transaction) => {
        const row = document.createElement("tr");
        const type = document.createElement("td");
        type.textContent = transaction.transaction_type || "-";

        const amount = document.createElement("td");
        amount.textContent = formatMoney(transaction.amount);

        const date = document.createElement("td");
        date.textContent = transaction.transaction_date || "-";

        const hours = document.createElement("td");
        hours.textContent = transaction.transaction_hours || "-";

        row.appendChild(type);
        row.appendChild(amount);
        row.appendChild(date);
        row.appendChild(hours);
        body.appendChild(row);
    });
}

function render() {
    document.body.classList.remove("hidden");

    elements.bankName.textContent = state.bankName || "Banca";
    elements.playerName.textContent = state.playerName || "";
    elements.bankBalance.textContent = formatMoney(state.balance);
    elements.walletBalance.textContent = formatMoney(state.wallet);
    elements.taxesIn.textContent = `${Math.max(Number(state.taxesIn) || 0, 0)}%`;
    elements.taxesOut.textContent = `${Math.max(Number(state.taxesOut) || 0, 0)}%`;
    elements.minDeposit.textContent = formatMoney(state.minDeposit);
    elements.minWithdraw.textContent = formatMoney(state.minWithdraw);
    elements.depositLevel.textContent = state.depositLevel || 1;
    elements.maxStacks.textContent = formatMoney(state.maxStacks);
    elements.maxBankMoney.textContent = formatMoney(state.maxBankMoney);
    elements.accountPrice.textContent = formatMoney(state.accountPrice);

    renderTransactions(state.transactions);

    if (state.hasAccount) {
        elements.accountOverlay.classList.add("hidden");
    } else {
        elements.accountOverlay.classList.remove("hidden");
    }
}

function showToast(message, success = true) {
    const toast = elements.toast;
    toast.classList.remove("hidden", "success", "error", "visible");
    toast.textContent = message;
    toast.classList.add(success ? "success" : "error");
    requestAnimationFrame(() => toast.classList.add("visible"));

    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    toastTimeout = setTimeout(() => {
        toast.classList.remove("visible");
    }, 3500);
}

function hideInterface() {
    document.body.classList.add("hidden");
    state = { ...defaultState };
}

function sendAction(action, payload = {}) {
    fetch(`https://${GetParentResourceName()}/bankAction`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({ action, ...payload })
    });
}

function applyContext(payload) {
    if (!payload) return;
    state = {
        ...state,
        ...payload,
        transactions: payload.transactions || []
    };
    render();
}

window.addEventListener("message", ({ data }) => {
    if (!data || !data.type) return;

    switch (data.type) {
        case "open":
            state = { ...defaultState, ...data.data };
            render();
            break;
        case "actionResult":
            if (data.message) {
                showToast(data.message, data.success);
            }

            if (data.success && data.data) {
                applyContext(data.data);
            }

            if (data.action === "deposit" && data.success) {
                elements.depositInput.value = "";
            }

            if (data.action === "withdraw" && data.success) {
                elements.withdrawInput.value = "";
            }

            if (data.action === "createAccount" && data.success) {
                elements.pinInput.value = "";
            }
            break;
        case "updateContext":
            applyContext(data.data);
            break;
        case "close":
            hideInterface();
            break;
        default:
            break;
    }
});

document.getElementById("depositButton").addEventListener("click", () => {
    const value = elements.depositInput.value;
    sendAction("deposit", { amount: value });
});

document.getElementById("withdrawButton").addEventListener("click", () => {
    const value = elements.withdrawInput.value;
    sendAction("withdraw", { amount: value });
});

document.getElementById("createAccountButton").addEventListener("click", () => {
    sendAction("createAccount", { pin: elements.pinInput.value.trim() });
});

document.getElementById("closeButton").addEventListener("click", () => {
    sendAction("close");
    hideInterface();
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Escape") {
        sendAction("close");
        hideInterface();
    }
});
