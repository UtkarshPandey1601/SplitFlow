export const generateGroupCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const generateUniqueGroupCode = async (GroupModel, currentGroupId = null, maxAttempts = 5) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const code = generateGroupCode();
    const existingGroup = await GroupModel.findOne({
      groupCode: code,
      ...(currentGroupId ? { _id: { $ne: currentGroupId } } : {})
    });

    if (!existingGroup) return code;
  }

  throw new Error('Unable to generate a unique group code');
};
