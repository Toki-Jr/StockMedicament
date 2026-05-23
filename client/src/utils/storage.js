const tabId = sessionStorage.getItem('tabId') || (() => {
  const id = Math.random().toString(36).slice(2);
  sessionStorage.setItem('tabId', id);
  return id;
})();

console.log('tabId:', tabId);
console.log('token key:', `${tabId}_token`);
console.log('token value:', localStorage.getItem(`${tabId}_token`));

export const storage = {
  setItem: (key, value) => localStorage.setItem(`${tabId}_${key}`, value),
  getItem: (key)        => localStorage.getItem(`${tabId}_${key}`),
  removeItem: (key)     => localStorage.removeItem(`${tabId}_${key}`),
};