// Utilities
function formatCurrency(amount) {
  return (amount < 0 ? '-$' : '$') + Math.abs(amount).toFixed(2);
}

// State
let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");

// Elements
const totalAmount = document.getElementById('total-amount');
const incomeAmount = document.getElementById('income-amount');
const expenseAmount = document.getElementById('expense-amount');
const transactionsList = document.getElementById('transactions-list');
const form = document.getElementById('transaction-form');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const filterCategory = document.getElementById('filter-category');

// Render Functions
function renderTransactions(filtered=null) {
  transactionsList.innerHTML = '';
  const txs = filtered!==null ? filtered : transactions;

  if (txs.length === 0) {
    transactionsList.innerHTML = `<li style="color:#a7b0bb;font-weight:400;padding:12px;text-align:center;">No transactions to display.</li>`;
    return;
  }

  txs.slice().reverse().forEach((tx, idx) => {
    const signClass = tx.amount >= 0 ? 'income-amount' : 'expense-amount';
    const categoryCaps = tx.category.charAt(0).toUpperCase() + tx.category.slice(1);

    const li = document.createElement('li');
    li.className = 'transaction-entry';

    li.innerHTML = `
      <div class="entry-details">
        <span class="entry-category" title="Category">${categoryCaps}</span>
        <span>${tx.desc}</span>
      </div>
      <span class="entry-amount ${signClass}">
        ${formatCurrency(tx.amount)}
        <button class="delete-btn" title="Delete" onclick="deleteTransaction(${tx.id})">&times;</button>
      </span>
    `;
    transactionsList.appendChild(li);
  });
}

function updateSummary() {
  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);

  totalAmount.textContent = formatCurrency(income + expense);
  incomeAmount.textContent = formatCurrency(income);
  expenseAmount.textContent = formatCurrency(Math.abs(expense));
}

// Event Handlers
form.onsubmit = function(e) {
  e.preventDefault();
  const desc = descInput.value.trim();
  const amountNum = parseFloat(amountInput.value);
  const category = categoryInput.value;
  if (!desc || isNaN(amountNum) || amountNum === 0) {
    alert("Description and non-zero amount required.");
    return false;
  }

  transactions.push({
    id: Date.now(),
    desc,
    amount: amountNum,
    category,
  });
  saveAndRefresh();
  form.reset();
  descInput.focus();
};

function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveAndRefresh();
}

// Filter
filterCategory.onchange = function() {
  const value = filterCategory.value;
  if (value === "All") {
    renderTransactions();
  } else if (value === "Income") {
    renderTransactions(transactions.filter(tx => tx.amount > 0));
  } else if (value === "Expense") {
    renderTransactions(transactions.filter(tx => tx.amount < 0));
  } else {
    renderTransactions(transactions.filter(tx => tx.category === value));
  }
}

// Persistence and UI Sync
function saveAndRefresh() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateSummary();
  filterCategory.onchange(); // keep filtering mode after update
}

// Attach delete function globally
window.deleteTransaction = deleteTransaction;

// Initial Load
updateSummary();
renderTransactions();
