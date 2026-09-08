/**
 * Cálculos financieros de proformas inmobiliarias
 */

export function calculateItemTotal(item) {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice) || 0;
  const discount = Number(item.discount) || 0;
  return Math.max(0, (qty * price) - discount);
}

export function calculateProformaTotals(items = [], includeTax = false, taxRate = 0.18) {
  let subtotal = 0;
  let totalDiscount = 0;

  items.forEach(item => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;

    subtotal += qty * price;
    totalDiscount += discount;
  });

  const taxableBase = Math.max(0, subtotal - totalDiscount);
  const tax = includeTax ? taxableBase * taxRate : 0;
  const total = taxableBase + tax;

  return {
    subtotal,
    totalDiscount,
    tax,
    total
  };
}
