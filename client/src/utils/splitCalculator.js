export const calculateShare = (amount, splitType, participantCount, splits = {}, memberId = null) => {
  const numAmount = Number(amount) || 0;

  if (splitType === 'equal') {
    return numAmount / participantCount;
  }

  if (splitType === 'percentage' && memberId) {
    return (numAmount * (Number(splits[memberId]) || 0)) / 100;
  }

  if (splitType === 'manual' && memberId) {
    return Number(splits[memberId]) || 0;
  }

  return 0;
};

export const validatePercentages = (splits = {}) => {
  const total = Object.values(splits).reduce((sum, val) => sum + (Number(val) || 0), 0);
  return Math.abs(total - 100) < 0.01;
};

export const validateManualSplit = (amount, splits = {}) => {
  const total = Object.values(splits).reduce((sum, val) => sum + (Number(val) || 0), 0);
  return Math.abs(total - amount) < 0.01;
};
