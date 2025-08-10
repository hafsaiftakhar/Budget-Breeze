const { addExpense, calculateBalance } = require('./expenses');

test('Integration test: addExpense and calculateBalance work together', () => {
  let expenses = [];

  // Pehla expense add karo
  expenses = addExpense(expenses, { id: 1, amount: 100 });
  // Dusra expense add karo
  expenses = addExpense(expenses, { id: 2, amount: 50 });

  // Ab calculate karo balance
  const balance = calculateBalance(expenses);

  // Expected balance = 100 + 50 = 150
  expect(balance).toBe(150);
});
