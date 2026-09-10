/**
 * Calculate billing breakdown for an order
 * All calculations are performed server-side — never trust client totals
 */
const calculateBilling = (items, taxRate, serviceChargeRate) => {
  // Calculate each item total and subtotal
  let subtotal = 0;
  const processedItems = items.map(item => {
    const itemTotal = parseFloat((item.price * item.quantity).toFixed(2));
    subtotal += itemTotal;
    return { ...item, itemTotal };
  });

  subtotal = parseFloat(subtotal.toFixed(2));
  const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));
  const serviceChargeAmount = parseFloat((subtotal * serviceChargeRate).toFixed(2));
  const grandTotal = parseFloat((subtotal + taxAmount + serviceChargeAmount).toFixed(2));

  return {
    processedItems,
    billing: {
      subtotal,
      taxRate,
      taxAmount,
      serviceChargeRate,
      serviceChargeAmount,
      grandTotal
    }
  };
};

module.exports = { calculateBilling };
