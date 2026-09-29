export const normalizeString = (str) => {
  try {
    return str.trim().toLowerCase();
  } catch {
    return null;
  }
}