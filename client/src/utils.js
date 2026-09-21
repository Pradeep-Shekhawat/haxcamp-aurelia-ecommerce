export const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export const discountPercent = (price, compare) =>
  compare ? Math.max(0, Math.round((1 - Number(price) / Number(compare)) * 100)) : 0;

export const parseStoredJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
