const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  // User endpoints
  getUsers: () => fetch(`${API_BASE_URL}/api/users`),
  createUser: (userData) => fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  }),

  // Data endpoints
  getSuppliers: () => fetch(`${API_BASE_URL}/api/suppliers`),
  getTariffs: () => fetch(`${API_BASE_URL}/api/tariffs`),
  getPorts: () => fetch(`${API_BASE_URL}/api/ports`),
}; 