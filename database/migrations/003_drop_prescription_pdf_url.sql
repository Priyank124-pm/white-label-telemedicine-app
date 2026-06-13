-- ============================================================
-- Migration 003: Drop pdf_url from prescriptions
-- PDF generation via S3 was removed. The column is unused.
-- Uses a safe conditional drop via PREPARE/EXECUTE.
-- ============================================================

SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'prescriptions'
    AND COLUMN_NAME  = 'pdf_url'
);

SET @sql = IF(@col_exists > 0,
  'ALTER TABLE prescriptions DROP COLUMN pdf_url',
  'SELECT 1'
);

PREPARE _stmt FROM @sql;
EXECUTE _stmt;
DEALLOCATE PREPARE _stmt;

INSERT IGNORE INTO schema_migrations (filename) VALUES ('003_drop_prescription_pdf_url.sql');
