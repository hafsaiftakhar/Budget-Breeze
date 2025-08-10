// expenses.js - yeh file main functions rakhta hoon

function addExpense(expenses, newExpense) {
  return [...expenses, newExpense];
}

function calculateBalance(expenses) {
  let total = 0;
  for (const exp of expenses) {
    total += exp.amount;
  }
  return total;
}

module.exports = { addExpense, calculateBalance };
