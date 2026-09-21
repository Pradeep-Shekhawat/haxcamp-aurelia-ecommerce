const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function api(path, options = {}) {
  const token = localStorage.getItem('aurelia_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const method = (options.method || 'GET').toUpperCase();
  const canRetry = method === 'GET' || method === 'HEAD' || options.retryNetwork === true;
  const maxAttempts = canRetry ? 3 : 1;
  const requestOptions = { ...options };
  delete requestOptions.retryNetwork;
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${BASE}${path}`, { ...requestOptions, headers });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || 'Something went wrong.');
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      lastError = error;
      if (error?.status || attempt === maxAttempts - 1 || !canRetry) break;
      await sleep(300 * (attempt + 1));
    }
  }

  if (lastError instanceof TypeError) {
    const error = new Error('Unable to reach the Aurelia API. Please check the server connection and try again.');
    error.code = 'NETWORK_ERROR';
    throw error;
  }

  throw lastError;
}
