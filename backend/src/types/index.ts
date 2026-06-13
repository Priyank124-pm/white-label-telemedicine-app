import { Request } from 'express';

export type Role = 'super_admin' | 'clinic_admin' | 'doctor' | 'patient' | 'pharmacy';

export interface AuthUser {
  userId:   string;
  email:    string;
  role:     Role;
  tenantId: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?:   T;
  meta?:   PaginationMeta;
}

export interface PaginationMeta {
  total:    number;
  page:     number;
  limit:    number;
  totalPages: number;
}

export interface PaginationQuery {
  page?:   string;
  limit?:  string;
  search?: string;
  sortBy?: string;
  order?:  'ASC' | 'DESC';
}

export interface User {
  id:           string;
  tenant_id:    string | null;
  role:         Role;
  email:        string;
  first_name:   string;
  last_name:    string;
  phone:        string | null;
  date_of_birth: string | null;
  gender:       string | null;
  avatar_url:   string | null;
  is_active:    number;
  is_verified:  number;
  created_at:   string;
  updated_at:   string;
}

export interface Tenant {
  id:         string;
  name:       string;
  slug:       string;
  logo_url:   string | null;
  address:    string | null;
  city:       string | null;
  state:      string | null;
  country:    string;
  phone:      string | null;
  email:      string | null;
  is_active:  number;
  created_at: string;
  updated_at: string;
}

export interface DoctorProfile {
  id:               string;
  user_id:          string;
  tenant_id:        string;
  specialization:   string;
  qualification:    string | null;
  license_number:   string | null;
  experience_years: number;
  consultation_fee: number;
  bio:              string | null;
  is_available:     number;
}

export interface PatientProfile {
  id:           string;
  user_id:      string;
  tenant_id:    string;
  blood_group:  string;
  height_cm:    number | null;
  weight_kg:    number | null;
  allergies:    string[] | null;
  address:      string | null;
}

export interface Appointment {
  id:               string;
  tenant_id:        string;
  patient_id:       string;
  doctor_id:        string;
  appointment_date: string;
  start_time:       string;
  end_time:         string;
  status:           'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  type:             'in_person' | 'follow_up';
  reason:           string | null;
  notes:            string | null;
  created_at:       string;
}

export interface Prescription {
  id:              string;
  tenant_id:       string;
  appointment_id:  string | null;
  patient_id:      string;
  doctor_id:       string;
  prescription_no: string;
  diagnosis:       string;
  notes:           string | null;
  follow_up_date:  string | null;
  status:          'active' | 'dispensed' | 'expired' | 'cancelled';
  pdf_url:         string | null;
  created_at:      string;
}

export interface Medicine {
  id:           string;
  name:         string;
  generic_name: string | null;
  category:     string | null;
  form:         string;
  strength:     string | null;
  manufacturer: string | null;
  description:  string | null;
  is_active:    number;
}
