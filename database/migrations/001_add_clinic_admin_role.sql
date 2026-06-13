-- ============================================================
-- Migration 001: Add clinic_admin role to users table
-- Introduces the Clinic Admin role so clinic owners can manage
-- their own doctors and pharmacies independently of super_admin.
-- ============================================================

USE doctor_saas;

ALTER TABLE users
  MODIFY COLUMN role ENUM('super_admin','clinic_admin','doctor','patient','pharmacy') NOT NULL;

INSERT IGNORE INTO schema_migrations (filename) VALUES ('001_add_clinic_admin_role.sql');
