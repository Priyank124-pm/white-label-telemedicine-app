# Doctor SaaS — REST API Documentation

Base URL: `http://localhost:5000/api/v1`

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new patient |
| POST | `/auth/login` | No | Login (all roles) |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | Yes | Revoke refresh token |
| GET | `/auth/profile` | Yes | Get current user profile |
| PUT | `/auth/change-password` | Yes | Change password |

### Login Request
```json
{ "email": "admin@doctorsaas.com", "password": "Admin@123" }
```

### Login Response
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": { "id": "uuid", "email": "...", "role": "super_admin", "firstName": "Super", "lastName": "Admin", "tenantId": null }
  }
}
```

---

## Super Admin (Role: super_admin)

### Clinics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/tenants` | List all clinics (paginated, searchable) |
| POST | `/admin/tenants` | Create new clinic |
| PUT | `/admin/tenants/:id` | Update clinic |
| DELETE | `/admin/tenants/:id` | Deactivate clinic |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/doctors` | List doctors (filter by tenantId) |
| POST | `/admin/doctors` | Create doctor account |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/patients` | List patients |

### Pharmacies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/pharmacies` | List pharmacies |
| POST | `/admin/pharmacies` | Create pharmacy account |

### Analytics & User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/analytics` | Platform-wide stats |
| PATCH | `/admin/users/:id/toggle-status` | Enable/disable any user |

---

## Doctors (Role: doctor)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/doctors/dashboard` | Doctor dashboard stats |
| GET | `/doctors/profile` | Own profile |
| PUT | `/doctors/profile` | Update profile |
| GET | `/doctors/availability` | Get weekly schedule |
| PUT | `/doctors/availability` | Set weekly schedule |
| POST | `/doctors/leaves` | Block a date |
| DELETE | `/doctors/leaves/:id` | Remove leave |
| GET | `/doctors/patients` | My patients list |
| POST | `/doctors/patients` | Add new patient |

### Set Availability Body
```json
{
  "slots": [
    { "dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00", "slotDurationMins": 30 },
    { "dayOfWeek": 2, "startTime": "09:00", "endTime": "17:00", "slotDurationMins": 30 }
  ]
}
```

---

## Patients (Role: patient)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/patients/dashboard` | Patient dashboard |
| GET | `/patients/profile` | Own profile |
| PUT | `/patients/profile` | Update profile |
| GET | `/patients/history` | Full medical history |

---

## Appointments (All authenticated roles)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/appointments/slots?doctorId=&date=` | Available time slots |
| POST | `/appointments` | Book appointment |
| GET | `/appointments?status=&date=` | List appointments (role-filtered) |
| GET | `/appointments/:id` | Single appointment |
| PATCH | `/appointments/:id/status` | Update status |

### Book Appointment Body
```json
{
  "doctorId": "doctor-profile-uuid",
  "appointmentDate": "2026-07-01",
  "startTime": "10:00:00",
  "type": "in_person",
  "reason": "General checkup"
}
```

### Status values: `pending` → `confirmed` → `completed` | `cancelled` | `no_show`

---

## Prescriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/prescriptions` | Create prescription (doctor only) |
| GET | `/prescriptions` | List (role-filtered) |
| GET | `/prescriptions/:id` | Get with items |
| PUT | `/prescriptions/:id` | Update (doctor only) |

### Create Prescription Body
```json
{
  "patientId": "patient-profile-uuid",
  "appointmentId": "appointment-uuid-or-null",
  "diagnosis": "Upper respiratory infection",
  "notes": "Rest and fluids recommended",
  "followUpDate": "2026-07-15",
  "items": [
    {
      "medicineId": "med-uuid",
      "medicineName": "Amoxicillin 500mg",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "quantity": 21,
      "instructions": "Take with food"
    }
  ]
}
```

---

## Medicines (CRUD — super_admin creates/updates; all roles read)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/medicines?search=&category=` | List medicines |
| GET | `/medicines/categories` | Distinct categories |
| GET | `/medicines/:id` | Single medicine |
| POST | `/medicines` | Create (super_admin) |
| PUT | `/medicines/:id` | Update (super_admin) |
| DELETE | `/medicines/:id` | Deactivate (super_admin) |

---

## Medical Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reports` | Upload report (multipart/form-data, doctor) |
| GET | `/reports` | List (role-filtered) |
| GET | `/reports/:id` | Single report |
| DELETE | `/reports/:id` | Delete |

**Form fields for upload:** `patientId`, `reportType`, `title`, `description`, `reportDate`, `file`

---

## Referrals

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/referrals` | Create referral (doctor) |
| GET | `/referrals?direction=both|sent|received` | List referrals |
| PATCH | `/referrals/:id/status` | Update status |

---

## Pharmacy

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pharmacy/dashboard` | Pharmacy stats |
| GET | `/pharmacy/patients/search?q=` | Search patients |
| GET | `/pharmacy/prescriptions?patientId=` | Active prescriptions |
| POST | `/pharmacy/dispense` | Dispense & create invoice |
| GET | `/pharmacy/invoices` | List invoices |
| GET | `/pharmacy/invoices/:id` | Invoice with items |

### Dispense Body
```json
{
  "prescriptionId": "prescription-uuid",
  "notes": "Dispensed on 2026-07-01",
  "taxPercent": 13,
  "invoiceItems": [
    { "medicineName": "Amoxicillin 500mg", "quantity": 21, "unitPrice": 1.50 }
  ]
}
```

---

## Pagination

All list endpoints support query params:
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `search` (string)

### Paginated Response Shape
```json
{
  "success": true,
  "message": "...",
  "data": [...],
  "meta": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 }
}
```

---

## RBAC Permissions Matrix

| Resource | super_admin | doctor | patient | pharmacy |
|----------|-------------|--------|---------|----------|
| Tenants | CRUD | — | — | — |
| Doctors | CRUD | Read/Update own | Read | Read |
| Patients | CRUD | Create/Read/Update | Read/Update own | Read |
| Appointments | CRUD | CRUD | Create/Read | — |
| Prescriptions | Read | CRUD | Read | Read |
| Medicines | CRUD | Read | Read | Read |
| Reports | Read | CRUD | Read | — |
| Referrals | Read | CRUD | Read | — |
| Dispensing | Read | — | — | CRUD |
| Analytics | Read | — | — | — |

---

## Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes
- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized (missing/invalid token)
- `403` Forbidden (insufficient role)
- `404` Not Found
- `409` Conflict (duplicate)
- `429` Too Many Requests
- `500` Internal Server Error
