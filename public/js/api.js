/**
 * DineFlow — API Helper Module
 * Centralized API communication layer
 */
const API_BASE = '/api';

const api = {
  /**
   * Make an authenticated API request
   */
  async request(method, endpoint, data = null) {
    const token = localStorage.getItem('token');
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
      throw { status: response.status, ...result };
    }

    return result;
  },

  // Auth
  register: (data) => api.request('POST', '/auth/register', data),
  login: (data) => api.request('POST', '/auth/login', data),
  getMe: () => api.request('GET', '/auth/me'),

  // Branches
  getBranches: (params = '') => api.request('GET', `/branches${params}`),
  getBranch: (id) => api.request('GET', `/branches/${id}`),
  createBranch: (data) => api.request('POST', '/branches', data),
  updateBranch: (id, data) => api.request('PUT', `/branches/${id}`, data),
  deleteBranch: (id) => api.request('DELETE', `/branches/${id}`),

  // Tables
  getTables: (params = '') => api.request('GET', `/tables${params}`),
  getAvailableTables: (params) => api.request('GET', `/tables/available${params}`),
  createTable: (data) => api.request('POST', '/tables', data),
  updateTable: (id, data) => api.request('PUT', `/tables/${id}`, data),
  deleteTable: (id) => api.request('DELETE', `/tables/${id}`),

  // Menu
  getMenu: (params = '') => api.request('GET', `/menu${params}`),
  getMenuItem: (id) => api.request('GET', `/menu/${id}`),
  createMenuItem: (data) => api.request('POST', '/menu', data),
  updateMenuItem: (id, data) => api.request('PUT', `/menu/${id}`, data),
  deleteMenuItem: (id) => api.request('DELETE', `/menu/${id}`),

  // Reservations
  getReservations: (params = '') => api.request('GET', `/reservations${params}`),
  createReservation: (data) => api.request('POST', '/reservations', data),
  updateReservation: (id, data) => api.request('PUT', `/reservations/${id}`, data),
  cancelReservation: (id) => api.request('DELETE', `/reservations/${id}`),

  // Orders
  getOrders: (params = '') => api.request('GET', `/orders${params}`),
  getOrder: (id) => api.request('GET', `/orders/${id}`),
  createOrder: (data) => api.request('POST', '/orders', data),
  updateOrderStatus: (id, status) => api.request('PUT', `/orders/${id}/status`, { status }),
  getCustomerOrders: (id, params = '') => api.request('GET', `/customers/${id}/orders${params}`),
  getKitchenOrders: (params = '') => api.request('GET', `/kitchen/orders${params}`),

  // Feedback
  getFeedback: (params = '') => api.request('GET', `/feedback${params}`),
  createFeedback: (data) => api.request('POST', '/feedback', data),

  // Reports
  getOverview: () => api.request('GET', '/manager/reports/overview'),
  getSalesReport: (params = '') => api.request('GET', `/manager/reports/sales${params}`),
  getPopularDishes: (params = '') => api.request('GET', `/manager/reports/popular-dishes${params}`),
  getPeakHours: () => api.request('GET', '/manager/reports/peak-hours')
};

/**
 * Toast notification system
 */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill' };
  const colors = { success: '#2ecc71', error: '#e74c3c', warning: '#f39c12' };

  const toast = document.createElement('div');
  toast.className = `custom-toast toast-${type}`;
  toast.innerHTML = `
    <i class="bi ${icons[type] || icons.success}" style="color:${colors[type]};font-size:1.2rem"></i>
    <span style="flex:1">${message}</span>
    <button class="btn btn-sm p-0 ms-2" onclick="this.parentElement.remove()" style="color:var(--text-secondary)">
      <i class="bi bi-x-lg"></i>
    </button>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

/**
 * Show/hide loading overlay
 */
function showLoader() {
  if (document.querySelector('.loader-overlay')) return;
  const loader = document.createElement('div');
  loader.className = 'loader-overlay';
  loader.innerHTML = '<div class="loader-spinner"></div>';
  document.body.appendChild(loader);
}

function hideLoader() {
  const loader = document.querySelector('.loader-overlay');
  if (loader) loader.remove();
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return '₹' + parseFloat(amount).toFixed(2);
}

/**
 * Format date
 */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Get status badge HTML
 */
function statusBadge(status) {
  return `<span class="badge-status badge-${status}">${status.replace('_', ' ')}</span>`;
}

/**
 * Category display name mapping
 */
function categoryName(cat) {
  const names = {
    appetizer: 'Appetizer', main_course: 'Main Course', dessert: 'Dessert',
    beverage: 'Beverage', side: 'Side', soup: 'Soup', salad: 'Salad', special: 'Special'
  };
  return names[cat] || cat;
}
