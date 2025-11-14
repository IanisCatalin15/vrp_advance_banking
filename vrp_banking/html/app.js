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

const defaultOwnerState = {
    bankId: null,
    bankName: "",
    ownerName: "",
    bankMoney: 0,
    profit: 0,
    depositLevel: 1,
    maxStacks: 0,
    maxBankMoney: 0,
    taxesIn: 0,
    taxesOut: 0,
    accountPrice: 0,
    packagedMoney: 0,
    config: {
        accPriceMin: 0,
        accPriceMax: 0,
        taxesInMin: 0,
        taxesInMax: 0,
        taxesOutMin: 0,
        taxesOutMax: 0,
        minAddStacks: 0,
        minDeposit: 0,
        minProfit: 0,
        stateTaxes: 0
    },
    nextUpgrade: null
};

let state = { ...defaultState };
let ownerState = { ...defaultOwnerState };
let toastTimeout;
let isOwnerOpen = false;

const containers = {
    customer: document.getElementById("customerApp"),
    owner: document.getElementById("ownerApp")
};

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

const ownerElements = {
    container: containers.owner,
    bankName: document.getElementById("ownerBankName"),
    ownerName: document.getElementById("ownerName"),
    bankMoney: document.getElementById("ownerBankMoney"),
    profit: document.getElementById("ownerProfit"),
    depositLevel: document.getElementById("ownerDepositLevel"),
    packagedMoney: document.getElementById("ownerPackagedMoney"),
    maxBankMoney: document.getElementById("ownerMaxBankMoney"),
    accountPriceInput: document.getElementById("ownerAccountPrice"),
    accountPriceButton: document.getElementById("ownerAccountPriceButton"),
    accountPriceRange: document.getElementById("ownerAccountPriceRange"),
    taxesInInput: document.getElementById("ownerTaxesIn"),
    taxesInButton: document.getElementById("ownerTaxesInButton"),
    taxesInRange: document.getElementById("ownerTaxesInRange"),
    taxesOutInput: document.getElementById("ownerTaxesOut"),
    taxesOutButton: document.getElementById("ownerTaxesOutButton"),
    taxesOutRange: document.getElementById("ownerTaxesOutRange"),
    addStacksInput: document.getElementById("ownerAddStacks"),
    addStacksButton: document.getElementById("ownerAddStacksButton"),
    addStacksMin: document.getElementById("ownerAddStacksMin"),
    stackCapacity: document.getElementById("ownerStackCapacity"),
    withdrawProfitInput: document.getElementById("ownerWithdrawProfit"),
    withdrawProfitButton: document.getElementById("ownerWithdrawProfitButton"),
    profitMin: document.getElementById("ownerProfitMin"),
    stateTax: document.getElementById("ownerStateTax"),
    upgradeInfo: document.getElementById("ownerUpgradeInfo"),
    upgradeButton: document.getElementById("ownerUpgradeButton"),
    closeButton: document.getElementById("ownerCloseButton")
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
    if (isOwnerOpen) {
        return;
    }

    document.body.classList.remove("hidden");
    containers.owner.classList.add("is-hidden");
    containers.customer.classList.remove("is-hidden");

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
    containers.customer.classList.add("is-hidden");
    containers.owner.classList.add("is-hidden");
    state = { ...defaultState };
    ownerState = { ...defaultOwnerState };
    isOwnerOpen = false;
}

function hideOwnerInterface() {
    document.body.classList.add("hidden");
    containers.owner.classList.add("is-hidden");
    containers.customer.classList.add("is-hidden");
    state = { ...defaultState };
    ownerState = { ...defaultOwnerState };
    isOwnerOpen = false;
    ownerElements.addStacksInput.value = "";
    ownerElements.withdrawProfitInput.value = "";
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

function sendOwnerAction(action, payload = {}) {
    if (!ownerState.bankId) {
        showToast("Informațiile băncii nu sunt disponibile.", false);
        return;
    }

    sendAction(action, { bankId: ownerState.bankId, ...payload });
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

function renderOwner() {
    document.body.classList.remove("hidden");
    containers.customer.classList.add("is-hidden");
    containers.owner.classList.remove("is-hidden");
    isOwnerOpen = true;

    ownerElements.bankName.textContent = ownerState.bankName || "Banca";
    ownerElements.ownerName.textContent = ownerState.ownerName || "";
    ownerElements.bankMoney.textContent = formatMoney(ownerState.bankMoney);
    ownerElements.profit.textContent = formatMoney(ownerState.profit);
    ownerElements.depositLevel.textContent = ownerState.depositLevel || 1;
    ownerElements.packagedMoney.textContent = formatMoney(ownerState.packagedMoney);
    ownerElements.maxBankMoney.textContent = formatMoney(ownerState.maxBankMoney);

    ownerElements.accountPriceInput.value = ownerState.accountPrice !== undefined && ownerState.accountPrice !== null ? ownerState.accountPrice : "";
    ownerElements.taxesInInput.value = ownerState.taxesIn !== undefined && ownerState.taxesIn !== null ? ownerState.taxesIn : "";
    ownerElements.taxesOutInput.value = ownerState.taxesOut !== undefined && ownerState.taxesOut !== null ? ownerState.taxesOut : "";

    const config = ownerState.config || defaultOwnerState.config;
    ownerElements.accountPriceRange.textContent = `${formatMoney(config.accPriceMin)} - ${formatMoney(config.accPriceMax)}`;
    ownerElements.taxesInRange.textContent = `${Math.max(Number(config.taxesInMin) || 0, 0)}% - ${Math.max(Number(config.taxesInMax) || 0, 0)}%`;
    ownerElements.taxesOutRange.textContent = `${Math.max(Number(config.taxesOutMin) || 0, 0)}% - ${Math.max(Number(config.taxesOutMax) || 0, 0)}%`;
    ownerElements.addStacksMin.textContent = formatMoney(Math.max(Number(config.minAddStacks) || 0, Number(config.minDeposit) || 0));
    ownerElements.stackCapacity.textContent = `${formatMoney(ownerState.bankMoney)} / ${formatMoney(ownerState.maxStacks)}`;
    ownerElements.profitMin.textContent = formatMoney(config.minProfit);
    ownerElements.stateTax.textContent = `${Math.max(Number(config.stateTaxes) || 0, 0)}%`;

    const nextUpgrade = ownerState.nextUpgrade;
    if (nextUpgrade) {
        ownerElements.upgradeInfo.innerHTML = `Nivel următor: ${nextUpgrade.level}<br>Cost: ${formatMoney(nextUpgrade.price)}<br>Stive maxime: ${formatMoney(nextUpgrade.maxStacks)}<br>Capacitate bancă: ${formatMoney(nextUpgrade.maxBankMoney)}`;
        ownerElements.upgradeButton.disabled = false;
    } else {
        ownerElements.upgradeInfo.textContent = "Nivel maxim atins.";
        ownerElements.upgradeButton.disabled = true;
    }
}

function applyOwnerContext(payload) {
    if (!payload) return;

    ownerState = {
        ...ownerState,
        ...payload,
        config: {
            ...ownerState.config,
            ...(payload.config || {})
        },
        nextUpgrade: payload.nextUpgrade || null
    };

    renderOwner();
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
        case "openOwner":
            ownerState = { ...defaultOwnerState };
            applyOwnerContext(data.data || {});
            break;
        case "ownerActionResult":
            if (data.message && isOwnerOpen) {
                showToast(data.message, data.success);
            }

            if (data.data && isOwnerOpen) {
                applyOwnerContext(data.data);
            }

            if (data.success && isOwnerOpen) {
                if (data.action === "owner:addStacks") {
                    ownerElements.addStacksInput.value = "";
                }

                if (data.action === "owner:withdrawProfit") {
                    ownerElements.withdrawProfitInput.value = "";
                }
            }

            if (!data.data && isOwnerOpen) {
                renderOwner();
            }
            break;
        case "closeOwner":
            hideOwnerInterface();
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

ownerElements.accountPriceButton.addEventListener("click", () => {
    sendOwnerAction("owner:setAccountPrice", { price: ownerElements.accountPriceInput.value });
});

ownerElements.taxesInButton.addEventListener("click", () => {
    sendOwnerAction("owner:setTaxesIn", { percent: ownerElements.taxesInInput.value });
});

ownerElements.taxesOutButton.addEventListener("click", () => {
    sendOwnerAction("owner:setTaxesOut", { percent: ownerElements.taxesOutInput.value });
});

ownerElements.addStacksButton.addEventListener("click", () => {
    sendOwnerAction("owner:addStacks", { amount: ownerElements.addStacksInput.value });
});

ownerElements.withdrawProfitButton.addEventListener("click", () => {
    sendOwnerAction("owner:withdrawProfit", { amount: ownerElements.withdrawProfitInput.value });
});

ownerElements.upgradeButton.addEventListener("click", () => {
    sendOwnerAction("owner:upgradeDeposit");
});

ownerElements.closeButton.addEventListener("click", () => {
    sendAction("closeOwner");
    hideOwnerInterface();
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Escape") {
        if (isOwnerOpen) {
            sendAction("closeOwner");
            hideOwnerInterface();
        } else {
            sendAction("close");
            hideInterface();
        }
    }
});
