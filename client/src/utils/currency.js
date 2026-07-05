export const formatCurrency = (amount = 0) => {
  if (amount === 0) return '₹0';
  
  const num = Number(amount);
  if (isNaN(num)) return '₹0';

  // Round to 2 decimals
  const rounded = Math.round(num * 100) / 100;
  
  // If whole number, don't show decimals
  if (rounded === Math.floor(rounded)) {
    return `₹${Math.floor(rounded).toLocaleString('en-IN')}`;
  }
  
  // If has decimals, show them
  return `₹${rounded.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const parseAmount = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : Math.max(0, num);
};
