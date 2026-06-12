import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean });

    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data.data;
          Cookies.set('accessToken',  accessToken,  { expires: 1 / 96 }); // 15 min
          Cookies.set('refreshToken', newRefresh,   { expires: 7 });
          if (original?.headers) original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original!);
        } catch {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          Cookies.remove('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  login:          (data: { email: string; password: string }) => api.post('/auth/login', data),
  register:       (data: object) => api.post('/auth/register', data),
  logout:         (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  getProfile:     () => api.get('/auth/profile'),
  changePassword: (data: object) => api.put('/auth/change-password', data),
};

// Admin
export const adminApi = {
  getTenants:     (params?: object) => api.get('/admin/tenants', { params }),
  createTenant:   (data: object) => api.post('/admin/tenants', data),
  updateTenant:   (id: string, data: object) => api.put(`/admin/tenants/${id}`, data),
  deleteTenant:   (id: string) => api.delete(`/admin/tenants/${id}`),
  getDoctors:     (params?: object) => api.get('/admin/doctors', { params }),
  createDoctor:   (data: object) => api.post('/admin/doctors', data),
  getPatients:    (params?: object) => api.get('/admin/patients', { params }),
  getPharmacies:  (params?: object) => api.get('/admin/pharmacies', { params }),
  createPharmacy: (data: object) => api.post('/admin/pharmacies', data),
  getAnalytics:   () => api.get('/admin/analytics'),
  toggleUser:     (id: string) => api.patch(`/admin/users/${id}/toggle-status`),
};

// Doctors
export const doctorApi = {
  list:            (params?: object) => api.get('/doctors', { params }),
  getProfile:      () => api.get('/doctors/profile'),
  updateProfile:   (data: object) => api.put('/doctors/profile', data),
  getAvailability: () => api.get('/doctors/availability'),
  setAvailability: (data: object) => api.put('/doctors/availability', data),
  addLeave:        (data: object) => api.post('/doctors/leaves', data),
  deleteLeave:     (id: string) => api.delete(`/doctors/leaves/${id}`),
  getPatients:     (params?: object) => api.get('/doctors/patients', { params }),
  addPatient:      (data: object) => api.post('/doctors/patients', data),
  getDashboard:    () => api.get('/doctors/dashboard'),
};

// Patients
export const patientApi = {
  getProfile:    () => api.get('/patients/profile'),
  updateProfile: (data: object) => api.put('/patients/profile', data),
  getDashboard:  () => api.get('/patients/dashboard'),
  getHistory:    () => api.get('/patients/history'),
};

// Appointments
export const appointmentApi = {
  getSlots:     (params: object) => api.get('/appointments/slots', { params }),
  book:         (data: object) => api.post('/appointments', data),
  getAll:       (params?: object) => api.get('/appointments', { params }),
  getById:      (id: string) => api.get(`/appointments/${id}`),
  updateStatus: (id: string, data: object) => api.patch(`/appointments/${id}/status`, data),
};

// Prescriptions
export const prescriptionApi = {
  create:    (data: object) => api.post('/prescriptions', data),
  getAll:    (params?: object) => api.get('/prescriptions', { params }),
  getById:   (id: string) => api.get(`/prescriptions/${id}`),
  update:    (id: string, data: object) => api.put(`/prescriptions/${id}`, data),
};

// Medicines
export const medicineApi = {
  getAll:       (params?: object) => api.get('/medicines', { params }),
  getById:      (id: string) => api.get(`/medicines/${id}`),
  getCategories: () => api.get('/medicines/categories'),
  create:       (data: object) => api.post('/medicines', data),
  update:       (id: string, data: object) => api.put(`/medicines/${id}`, data),
  delete:       (id: string) => api.delete(`/medicines/${id}`),
};

// Reports
export const reportApi = {
  upload:   (formData: FormData) => api.post('/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll:   (params?: object) => api.get('/reports', { params }),
  getById:  (id: string) => api.get(`/reports/${id}`),
  delete:   (id: string) => api.delete(`/reports/${id}`),
};

// Referrals
export const referralApi = {
  create:       (data: object) => api.post('/referrals', data),
  getAll:       (params?: object) => api.get('/referrals', { params }),
  updateStatus: (id: string, data: object) => api.patch(`/referrals/${id}/status`, data),
};

// Pharmacy
export const pharmacyApi = {
  getDashboard:      () => api.get('/pharmacy/dashboard'),
  searchPatients:    (q: string) => api.get('/pharmacy/patients/search', { params: { q } }),
  getPrescriptions:  (params?: object) => api.get('/pharmacy/prescriptions', { params }),
  dispense:          (data: object) => api.post('/pharmacy/dispense', data),
  getInvoices:       (params?: object) => api.get('/pharmacy/invoices', { params }),
  getInvoiceById:    (id: string) => api.get(`/pharmacy/invoices/${id}`),
};
