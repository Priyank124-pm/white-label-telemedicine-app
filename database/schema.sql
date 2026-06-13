-- ============================================================
-- Doctor SaaS Platform - MySQL 8 Schema
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS doctor_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE doctor_saas;

-- ============================================================
-- TENANTS (Clinics/Organizations)
-- ============================================================
CREATE TABLE IF NOT EXISTS tenants (
  id            CHAR(36)      NOT NULL DEFAULT (UUID()),
  name          VARCHAR(255)  NOT NULL,
  slug          VARCHAR(100)  NOT NULL UNIQUE,
  logo_url      VARCHAR(500)  NULL,
  address       TEXT          NULL,
  city          VARCHAR(100)  NULL,
  state         VARCHAR(100)  NULL,
  country       VARCHAR(100)  NOT NULL DEFAULT 'Canada',
  phone         VARCHAR(20)   NULL,
  email         VARCHAR(255)  NULL,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  settings      JSON          NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_slug (slug),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- ============================================================
-- USERS (All roles in one table)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              CHAR(36)      NOT NULL DEFAULT (UUID()),
  tenant_id       CHAR(36)      NULL,
  role            ENUM('super_admin','clinic_admin','doctor','patient','pharmacy') NOT NULL,
  email           VARCHAR(255)  NOT NULL,
  password_hash   VARCHAR(255)  NOT NULL,
  first_name      VARCHAR(100)  NOT NULL,
  last_name       VARCHAR(100)  NOT NULL,
  phone           VARCHAR(20)   NULL,
  date_of_birth   DATE          NULL,
  gender          ENUM('male','female','other')  NULL,
  avatar_url      VARCHAR(500)  NULL,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  is_verified     TINYINT(1)    NOT NULL DEFAULT 0,
  last_login_at   DATETIME      NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_email (email),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active),
  CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- REFRESH TOKENS
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          CHAR(36)      NOT NULL DEFAULT (UUID()),
  user_id     CHAR(36)      NOT NULL,
  token       VARCHAR(500)  NOT NULL,
  expires_at  DATETIME      NOT NULL,
  is_revoked  TINYINT(1)    NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user_id (user_id),
  INDEX idx_token (token(255)),
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- DOCTOR PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id                CHAR(36)      NOT NULL DEFAULT (UUID()),
  user_id           CHAR(36)      NOT NULL UNIQUE,
  tenant_id         CHAR(36)      NOT NULL,
  specialization    VARCHAR(255)  NOT NULL,
  qualification     VARCHAR(500)  NULL,
  license_number    VARCHAR(100)  NULL,
  experience_years  INT           NOT NULL DEFAULT 0,
  consultation_fee  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  bio               TEXT          NULL,
  languages         JSON          NULL,
  is_available      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user_id (user_id),
  INDEX idx_tenant_id (tenant_id),
  CONSTRAINT fk_dp_user   FOREIGN KEY (user_id)   REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_dp_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- PATIENT PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS patient_profiles (
  id              CHAR(36)      NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)      NOT NULL UNIQUE,
  tenant_id       CHAR(36)      NOT NULL,
  blood_group     ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-','unknown') NOT NULL DEFAULT 'unknown',
  height_cm       DECIMAL(5,2)  NULL,
  weight_kg       DECIMAL(5,2)  NULL,
  allergies       JSON          NULL,
  chronic_conditions JSON       NULL,
  emergency_contact_name  VARCHAR(255) NULL,
  emergency_contact_phone VARCHAR(20)  NULL,
  insurance_info  JSON          NULL,
  address         TEXT          NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user_id (user_id),
  INDEX idx_tenant_id (tenant_id),
  CONSTRAINT fk_pp_user   FOREIGN KEY (user_id)   REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_pp_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- PHARMACY PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS pharmacy_profiles (
  id              CHAR(36)      NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)      NOT NULL UNIQUE,
  tenant_id       CHAR(36)      NOT NULL,
  pharmacy_name   VARCHAR(255)  NOT NULL,
  license_number  VARCHAR(100)  NULL,
  address         TEXT          NULL,
  operating_hours JSON          NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user_id (user_id),
  INDEX idx_tenant_id (tenant_id),
  CONSTRAINT fk_pharm_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  CONSTRAINT fk_pharm_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- MEDICINE MASTER
-- ============================================================
CREATE TABLE IF NOT EXISTS medicines (
  id              CHAR(36)      NOT NULL DEFAULT (UUID()),
  name            VARCHAR(255)  NOT NULL,
  generic_name    VARCHAR(255)  NULL,
  category        VARCHAR(100)  NULL,
  form            ENUM('tablet','capsule','syrup','injection','cream','drops','inhaler','patch','other') NOT NULL DEFAULT 'tablet',
  strength        VARCHAR(100)  NULL,
  manufacturer    VARCHAR(255)  NULL,
  description     TEXT          NULL,
  side_effects    TEXT          NULL,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  created_by      CHAR(36)      NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_name (name),
  INDEX idx_category (category),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- ============================================================
-- DOCTOR AVAILABILITY (Weekly Schedule)
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_availability (
  id          CHAR(36)      NOT NULL DEFAULT (UUID()),
  doctor_id   CHAR(36)      NOT NULL,
  day_of_week TINYINT       NOT NULL COMMENT '0=Sun,1=Mon,...,6=Sat',
  start_time  TIME          NOT NULL,
  end_time    TIME          NOT NULL,
  slot_duration_mins INT    NOT NULL DEFAULT 30,
  is_active   TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_doctor_day (doctor_id, day_of_week),
  CONSTRAINT fk_avail_doctor FOREIGN KEY (doctor_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- DOCTOR LEAVE / BLOCKED DATES
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_leaves (
  id          CHAR(36)      NOT NULL DEFAULT (UUID()),
  doctor_id   CHAR(36)      NOT NULL,
  leave_date  DATE          NOT NULL,
  reason      VARCHAR(255)  NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_doctor_date (doctor_id, leave_date),
  CONSTRAINT fk_leave_doctor FOREIGN KEY (doctor_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id                CHAR(36)      NOT NULL DEFAULT (UUID()),
  tenant_id         CHAR(36)      NOT NULL,
  patient_id        CHAR(36)      NOT NULL,
  doctor_id         CHAR(36)      NOT NULL,
  appointment_date  DATE          NOT NULL,
  start_time        TIME          NOT NULL,
  end_time          TIME          NOT NULL,
  status            ENUM('pending','confirmed','cancelled','completed','no_show') NOT NULL DEFAULT 'pending',
  type              ENUM('in_person','follow_up') NOT NULL DEFAULT 'in_person',
  reason            TEXT          NULL,
  notes             TEXT          NULL,
  cancelled_by      CHAR(36)      NULL,
  cancel_reason     TEXT          NULL,
  booked_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_tenant (tenant_id),
  INDEX idx_patient (patient_id),
  INDEX idx_doctor (doctor_id),
  INDEX idx_date_status (appointment_date, status),
  CONSTRAINT fk_appt_tenant  FOREIGN KEY (tenant_id)  REFERENCES tenants(id)           ON DELETE CASCADE,
  CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patient_profiles(id)  ON DELETE CASCADE,
  CONSTRAINT fk_appt_doctor  FOREIGN KEY (doctor_id)  REFERENCES doctor_profiles(id)   ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- PRESCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id              CHAR(36)      NOT NULL DEFAULT (UUID()),
  tenant_id       CHAR(36)      NOT NULL,
  appointment_id  CHAR(36)      NULL,
  patient_id      CHAR(36)      NOT NULL,
  doctor_id       CHAR(36)      NOT NULL,
  prescription_no VARCHAR(50)   NOT NULL UNIQUE,
  diagnosis       TEXT          NOT NULL,
  notes           TEXT          NULL,
  follow_up_date  DATE          NULL,
  status          ENUM('active','dispensed','expired','cancelled') NOT NULL DEFAULT 'active',
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_tenant (tenant_id),
  INDEX idx_patient (patient_id),
  INDEX idx_doctor (doctor_id),
  INDEX idx_appointment (appointment_id),
  INDEX idx_prescription_no (prescription_no),
  CONSTRAINT fk_presc_tenant  FOREIGN KEY (tenant_id)      REFERENCES tenants(id)           ON DELETE CASCADE,
  CONSTRAINT fk_presc_patient FOREIGN KEY (patient_id)     REFERENCES patient_profiles(id)  ON DELETE CASCADE,
  CONSTRAINT fk_presc_doctor  FOREIGN KEY (doctor_id)      REFERENCES doctor_profiles(id)   ON DELETE CASCADE,
  CONSTRAINT fk_presc_appt    FOREIGN KEY (appointment_id) REFERENCES appointments(id)      ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- PRESCRIPTION ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS prescription_items (
  id              CHAR(36)      NOT NULL DEFAULT (UUID()),
  prescription_id CHAR(36)      NOT NULL,
  medicine_id     CHAR(36)      NOT NULL,
  medicine_name   VARCHAR(255)  NOT NULL,
  dosage          VARCHAR(100)  NOT NULL,
  frequency       VARCHAR(100)  NOT NULL,
  duration        VARCHAR(100)  NOT NULL,
  quantity        INT           NOT NULL DEFAULT 1,
  instructions    TEXT          NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_prescription (prescription_id),
  INDEX idx_medicine (medicine_id),
  CONSTRAINT fk_pi_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)  ON DELETE CASCADE,
  CONSTRAINT fk_pi_medicine      FOREIGN KEY (medicine_id)     REFERENCES medicines(id)       ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- MEDICAL REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_reports (
  id              CHAR(36)      NOT NULL DEFAULT (UUID()),
  tenant_id       CHAR(36)      NOT NULL,
  patient_id      CHAR(36)      NOT NULL,
  doctor_id       CHAR(36)      NOT NULL,
  appointment_id  CHAR(36)      NULL,
  report_type     ENUM('lab','imaging','pathology','other') NOT NULL DEFAULT 'lab',
  title           VARCHAR(255)  NOT NULL,
  description     TEXT          NULL,
  file_url        VARCHAR(500)  NULL,
  file_name       VARCHAR(255)  NULL,
  file_size       INT           NULL,
  report_date     DATE          NOT NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_tenant (tenant_id),
  INDEX idx_patient (patient_id),
  INDEX idx_doctor (doctor_id),
  INDEX idx_report_type (report_type),
  CONSTRAINT fk_report_tenant  FOREIGN KEY (tenant_id)      REFERENCES tenants(id)           ON DELETE CASCADE,
  CONSTRAINT fk_report_patient FOREIGN KEY (patient_id)     REFERENCES patient_profiles(id)  ON DELETE CASCADE,
  CONSTRAINT fk_report_doctor  FOREIGN KEY (doctor_id)      REFERENCES doctor_profiles(id)   ON DELETE CASCADE,
  CONSTRAINT fk_report_appt    FOREIGN KEY (appointment_id) REFERENCES appointments(id)      ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- REFERRALS
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
  id                  CHAR(36)      NOT NULL DEFAULT (UUID()),
  tenant_id           CHAR(36)      NOT NULL,
  patient_id          CHAR(36)      NOT NULL,
  referring_doctor_id CHAR(36)      NOT NULL,
  referred_doctor_id  CHAR(36)      NOT NULL,
  appointment_id      CHAR(36)      NULL,
  reason              TEXT          NOT NULL,
  notes               TEXT          NULL,
  urgency             ENUM('routine','urgent','emergency') NOT NULL DEFAULT 'routine',
  status              ENUM('pending','accepted','completed','rejected') NOT NULL DEFAULT 'pending',
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_tenant (tenant_id),
  INDEX idx_patient (patient_id),
  INDEX idx_referring_doctor (referring_doctor_id),
  INDEX idx_referred_doctor (referred_doctor_id),
  CONSTRAINT fk_ref_tenant     FOREIGN KEY (tenant_id)           REFERENCES tenants(id)           ON DELETE CASCADE,
  CONSTRAINT fk_ref_patient    FOREIGN KEY (patient_id)          REFERENCES patient_profiles(id)  ON DELETE CASCADE,
  CONSTRAINT fk_ref_from_doc   FOREIGN KEY (referring_doctor_id) REFERENCES doctor_profiles(id)   ON DELETE CASCADE,
  CONSTRAINT fk_ref_to_doc     FOREIGN KEY (referred_doctor_id)  REFERENCES doctor_profiles(id)   ON DELETE CASCADE,
  CONSTRAINT fk_ref_appt       FOREIGN KEY (appointment_id)      REFERENCES appointments(id)      ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- PHARMACY DISPENSING
-- ============================================================
CREATE TABLE IF NOT EXISTS dispensing_records (
  id                CHAR(36)      NOT NULL DEFAULT (UUID()),
  tenant_id         CHAR(36)      NOT NULL,
  prescription_id   CHAR(36)      NOT NULL,
  pharmacy_id       CHAR(36)      NOT NULL,
  dispensed_by      CHAR(36)      NOT NULL,
  dispensed_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes             TEXT          NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_prescription (prescription_id),
  INDEX idx_pharmacy (pharmacy_id),
  CONSTRAINT fk_disp_tenant  FOREIGN KEY (tenant_id)       REFERENCES tenants(id)           ON DELETE CASCADE,
  CONSTRAINT fk_disp_presc   FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)     ON DELETE CASCADE,
  CONSTRAINT fk_disp_pharmacy FOREIGN KEY (pharmacy_id)    REFERENCES pharmacy_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- INVOICES (Pharmacy)
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id              CHAR(36)        NOT NULL DEFAULT (UUID()),
  tenant_id       CHAR(36)        NOT NULL,
  dispensing_id   CHAR(36)        NOT NULL,
  patient_id      CHAR(36)        NOT NULL,
  pharmacy_id     CHAR(36)        NOT NULL,
  invoice_no      VARCHAR(50)     NOT NULL UNIQUE,
  subtotal        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  tax_percent     DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
  tax_amount      DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  total_amount    DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  status          ENUM('draft','issued','paid','cancelled') NOT NULL DEFAULT 'issued',
  notes           TEXT            NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_tenant (tenant_id),
  INDEX idx_patient (patient_id),
  INDEX idx_dispensing (dispensing_id),
  INDEX idx_invoice_no (invoice_no),
  CONSTRAINT fk_inv_tenant    FOREIGN KEY (tenant_id)     REFERENCES tenants(id)           ON DELETE CASCADE,
  CONSTRAINT fk_inv_disp      FOREIGN KEY (dispensing_id) REFERENCES dispensing_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_inv_patient   FOREIGN KEY (patient_id)    REFERENCES patient_profiles(id)  ON DELETE CASCADE,
  CONSTRAINT fk_inv_pharmacy  FOREIGN KEY (pharmacy_id)   REFERENCES pharmacy_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- INVOICE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id              CHAR(36)        NOT NULL DEFAULT (UUID()),
  invoice_id      CHAR(36)        NOT NULL,
  medicine_name   VARCHAR(255)    NOT NULL,
  quantity        INT             NOT NULL DEFAULT 1,
  unit_price      DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  total_price     DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_invoice (invoice_id),
  CONSTRAINT fk_ii_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          CHAR(36)      NOT NULL DEFAULT (UUID()),
  user_id     CHAR(36)      NULL,
  tenant_id   CHAR(36)      NULL,
  action      VARCHAR(100)  NOT NULL,
  entity      VARCHAR(100)  NOT NULL,
  entity_id   CHAR(36)      NULL,
  old_values  JSON          NULL,
  new_values  JSON          NULL,
  ip_address  VARCHAR(45)   NULL,
  user_agent  VARCHAR(500)  NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user (user_id),
  INDEX idx_tenant (tenant_id),
  INDEX idx_entity (entity, entity_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- SCHEMA MIGRATIONS TRACKER
-- ============================================================
CREATE TABLE IF NOT EXISTS schema_migrations (
  id          INT           NOT NULL AUTO_INCREMENT,
  filename    VARCHAR(255)  NOT NULL UNIQUE,
  applied_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
