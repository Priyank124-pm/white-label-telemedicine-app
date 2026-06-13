-- ============================================================
-- Migration 000: Create migrations tracking table
-- Run this ONCE before any other migration
-- ============================================================

USE doctor_saas;

CREATE TABLE IF NOT EXISTS schema_migrations (
  id          INT           NOT NULL AUTO_INCREMENT,
  filename    VARCHAR(255)  NOT NULL UNIQUE,
  applied_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;
