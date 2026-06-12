export type Role = 'super_admin' | 'doctor' | 'patient' | 'pharmacy';

export interface User {
  id:        string;
  email:     string;
  role:      Role;
  firstName: string;
  lastName:  string;
  tenantId:  string | null;
  avatarUrl: string | null;
}

export interface AuthState {
  user:         User | null;
  accessToken:  string | null;
  isLoading:    boolean;
  isAuthenticated: boolean;
}

export interface Tenant {
  id:       string;
  name:     string;
  slug:     string;
  city:     string | null;
  state:    string | null;
  country:  string;
  phone:    string | null;
  email:    string | null;
  isActive: boolean;
}

export interface Doctor {
  id:             string;
  email:          string;
  firstName:      string;
  lastName:       string;
  phone:          string | null;
  profileId:      string;
  specialization: string;
  qualification:  string | null;
  experienceYears: number;
  consultationFee: number;
  isAvailable:    boolean;
  clinicName:     string | null;
}

export interface Patient {
  id:          string;
  email:       string;
  firstName:   string;
  lastName:    string;
  phone:       string | null;
  dateOfBirth: string | null;
  gender:      string | null;
  profileId:   string;
  bloodGroup:  string;
  address:     string | null;
}

export interface Appointment {
  id:              string;
  appointmentDate: string;
  startTime:       string;
  endTime:         string;
  status:          'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  type:            'in_person' | 'follow_up';
  reason:          string | null;
  notes:           string | null;
  doctorName:      string;
  patientName:     string;
  specialization:  string;
}

export interface Prescription {
  id:             string;
  prescriptionNo: string;
  diagnosis:      string;
  notes:          string | null;
  followUpDate:   string | null;
  status:         'active' | 'dispensed' | 'expired' | 'cancelled';
  pdfUrl:         string | null;
  doctorName:     string;
  patientName:    string;
  items?:         PrescriptionItem[];
  createdAt:      string;
}

export interface PrescriptionItem {
  id:           string;
  medicineName: string;
  dosage:       string;
  frequency:    string;
  duration:     string;
  quantity:     number;
  instructions: string | null;
}

export interface Medicine {
  id:          string;
  name:        string;
  genericName: string | null;
  category:    string | null;
  form:        string;
  strength:    string | null;
  manufacturer: string | null;
  isActive:    boolean;
}

export interface MedicalReport {
  id:          string;
  reportType:  string;
  title:       string;
  description: string | null;
  fileUrl:     string;
  fileName:    string;
  reportDate:  string;
  doctorName:  string;
  patientName: string;
}

export interface Referral {
  id:                 string;
  reason:             string;
  urgency:            'routine' | 'urgent' | 'emergency';
  status:             'pending' | 'accepted' | 'completed' | 'rejected';
  referringDoctorName: string;
  referredDoctorName:  string;
  patientName:        string;
  createdAt:          string;
}

export interface Invoice {
  id:          string;
  invoiceNo:   string;
  subtotal:    number;
  taxPercent:  number;
  taxAmount:   number;
  totalAmount: number;
  status:      'draft' | 'issued' | 'paid' | 'cancelled';
  patientName: string;
  createdAt:   string;
}

export interface PaginationMeta {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?:   T;
  meta?:   PaginationMeta;
}

export interface StatsCardData {
  title: string;
  value: string | number;
  icon:  React.ReactNode;
  trend?: { value: number; label: string };
  color?: string;
}
