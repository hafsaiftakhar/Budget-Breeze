// calculateBalance.test.js

const calculateBalance = require('./calculateBalance');

test('calculates balance correctly', () => {
  expect(calculateBalance(1000, 300)).toBe(700);
  expect(calculateBalance(500, 200)).toBe(300);
  expect(calculateBalance(0, 0)).toBe(0);
});
