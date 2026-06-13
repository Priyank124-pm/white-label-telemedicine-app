-- ============================================================
-- Migration 002: Make file columns nullable in medical_reports
-- File uploads (S3) were removed. Reports are now text-only.
-- file_url, file_name, file_size may be NULL for new records.
-- ============================================================

USE doctor_saas;

ALTER TABLE medical_reports
  MODIFY COLUMN file_url   VARCHAR(500) NULL,
  MODIFY COLUMN file_name  VARCHAR(255) NULL,
  MODIFY COLUMN file_size  INT          NULL;

INSERT IGNORE INTO schema_migrations (filename) VALUES ('002_reports_make_file_columns_nullable.sql');
