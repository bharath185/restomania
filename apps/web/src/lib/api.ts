import axios, { AxiosError } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const urlParams = new URLSearchParams(window.location.search);
    const tenantSlug = urlParams.get('tenant') || urlParams.get('restaurant') || localStorage.getItem('tenant_slug');
    if (tenantSlug) {
      config.headers['x-tenant-slug'] = tenantSlug;
      localStorage.setItem('tenant_slug', tenantSlug);
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = res.data.data as { accessToken: string };
        localStorage.setItem('access_token', accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        localStorage.removeItem('access_token');
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export const api = {
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),

  resolveTenant: () => apiClient.get('/tenant/resolve'),
  getMenu: () => apiClient.get('/tenant/menu'),

  getCategories: () => apiClient.get('/menu/categories'),
  getItems: (params?: Record<string, unknown>) =>
    apiClient.get('/menu/items', { params }),
  getItem: (id: string) => apiClient.get(`/menu/items/${id}`),
  createCategory: (data: unknown) => apiClient.post('/menu/categories', data),
  updateCategory: (id: string, data: unknown) => apiClient.patch(`/menu/categories/${id}`, data),
  deleteCategory: (id: string) => apiClient.delete(`/menu/categories/${id}`),
  createItem: (data: unknown) => apiClient.post('/menu/items', data),
  updateItem: (id: string, data: unknown) => apiClient.patch(`/menu/items/${id}`, data),
  toggleStock: (id: string, isInStock: boolean) =>
    apiClient.patch(`/menu/items/${id}/stock`, { isInStock }),
  deleteItem: (id: string) => apiClient.delete(`/menu/items/${id}`),

  placeOrder: (data: unknown) => apiClient.post('/orders', data),
  getOrders: (params?: Record<string, unknown>) =>
    apiClient.get('/orders', { params }),
  getOrder: (id: string) => apiClient.get(`/orders/${id}`),
  updateOrderStatus: (id: string, data: { status: string; note?: string }) =>
    apiClient.patch(`/orders/${id}/status`, data),
  cancelOrder: (id: string) => apiClient.post(`/orders/${id}/cancel`),
  getCustomerOrders: () => apiClient.get('/orders/customer/history'),

  getTables: () => apiClient.get('/tables'),
  createTable: (data: unknown) => apiClient.post('/tables', data),
  generateQr: (tableId: string) => apiClient.post(`/tables/${tableId}/qr`),
  verifyQr: (token: string) => apiClient.post('/qr/verify', { token }),

  initiatePayment: (data: { orderId: string; method: string }) =>
    apiClient.post('/payments/initiate', data),

  getDashboard: () => apiClient.get('/analytics/dashboard'),
  getSales: (params: { from: string; to: string }) =>
    apiClient.get('/analytics/sales', { params }),
  getTopDishes: () => apiClient.get('/analytics/top-dishes'),
  getPeakHours: () => apiClient.get('/analytics/peak-hours'),

  getBranding: () => apiClient.get('/settings/branding'),
  updateBranding: (data: unknown) => apiClient.patch('/settings/branding', data),
  getHours: () => apiClient.get('/settings/hours'),
  updateHours: (hours: unknown[]) => apiClient.patch('/settings/hours', { hours }),
  getRestaurantInfo: () => apiClient.get('/settings/restaurant'),
  updateRestaurantInfo: (data: unknown) => apiClient.patch('/settings/restaurant', data),

  getStaff: () => apiClient.get('/staff'),
  inviteStaff: (data: unknown) => apiClient.post('/staff/invite', data),
  updateStaffRole: (userId: string, role: string) =>
    apiClient.patch(`/staff/${userId}/role`, { role }),
  removeStaff: (userId: string) => apiClient.delete(`/staff/${userId}`),

  getCoupons: () => apiClient.get('/coupons'),
  createCoupon: (data: unknown) => apiClient.post('/coupons', data),
  validateCoupon: (code: string, orderTotal: number) =>
    apiClient.post('/coupons/validate', { code, orderTotal }),

  getRestaurants: (params?: Record<string, unknown>) =>
    apiClient.get('/super-admin/restaurants', { params }),
  onboardRestaurant: (data: unknown) =>
    apiClient.post('/super-admin/restaurants', data),
  getPlatformStats: () => apiClient.get('/super-admin/analytics'),
};
