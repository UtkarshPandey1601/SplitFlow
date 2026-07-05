export const copyTextToClipboard = async (text, onSuccess, onError) => {
  if (!text) {
    onError?.('Nothing to copy');
    return false;
  }

  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    onError?.('Clipboard is unavailable');
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    onSuccess?.('Copied to clipboard');
    return true;
  } catch {
    onError?.('Unable to copy right now');
    return false;
  }
};
