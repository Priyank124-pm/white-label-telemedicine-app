-- ============================================================
-- Doctor SaaS — Full Schema + Demo Data
-- Generated: 2026-06-13
--
-- HOW TO IMPORT:
--   Option A (CLI):
--     mysql -u <user> -p<password> -h <host> < demo_seed.sql
--
--   Option B (cPanel / phpMyAdmin):
--     1. Open phpMyAdmin → select or create the target database
--     2. Click Import → choose this file → Go
--
--   Option C (Node runner):
--     Set DB_* vars in backend/.env pointing to live DB, then:
--     node database/migrate.js
--
-- NOTE: This file drops and recreates the doctor_saas database.
--       refresh_tokens and audit_logs are excluded (ephemeral data).
--
-- Demo credentials — password for all seeded accounts: Admin@123
--
--   Super Admin   : admin@doctorsaas.com
--
--   Clinic Admin  : admin@healthfirst.ca        (HealthFirst Clinic)
--   Clinic Admin  : adam@itechnolabs.tech       (itech clinic)
--   Clinic Admin  : kendrik@holyclinic.con      (The Holy Clinic)
--
--   Doctors       : dr.sarah.johnson@healthfirst.ca
--                   dr.michael.chen@healthfirst.ca
--                   dr.emily.rodriguez@sunrisehealth.ca
--                   dr.james.wilson@carepoint.ca
--                   dr.priya.patel@carepoint.ca
--
--   Patients      : john.doe@email.com
--                   alice.smith@email.com
--                   david.lee@email.com
--
--   Pharmacy      : pharmacy@healthfirst.ca
--                   rx@carepoint.ca
-- ============================================================

-- MySQL dump 10.13  Distrib 8.0.46, for macos15 (arm64)
--
-- Host: localhost    Database: doctor_saas
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `doctor_saas`
--

/*!40000 DROP DATABASE IF EXISTS `doctor_saas`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `doctor_saas` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `doctor_saas`;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) NOT NULL,
  `patient_id` char(36) NOT NULL,
  `doctor_id` char(36) NOT NULL,
  `appointment_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('pending','confirmed','cancelled','completed','no_show') NOT NULL DEFAULT 'pending',
  `type` enum('in_person','follow_up') NOT NULL DEFAULT 'in_person',
  `reason` text,
  `notes` text,
  `cancelled_by` char(36) DEFAULT NULL,
  `cancel_reason` text,
  `booked_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_patient` (`patient_id`),
  KEY `idx_doctor` (`doctor_id`),
  KEY `idx_date_status` (`appointment_date`,`status`),
  CONSTRAINT `fk_appt_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctor_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appt_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appt_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES ('5cc02583-e87d-4257-9c9e-6fd39881c802','ten-0001','206165c9-8ca4-403e-8222-954c15d2a6bb','7e112397-dd59-407c-aa38-b0b2140a6c0b','2026-06-13','19:30:00','19:40:00','confirmed','in_person',NULL,NULL,NULL,NULL,'2026-06-13 19:27:37','2026-06-13 19:27:37','2026-06-13 19:28:07'),('67571bc0-3bee-4156-9909-ef0a84051e35','ten-0001','pp-002','dp-001','2026-06-15','09:00:00','09:30:00','pending','in_person','test',NULL,NULL,NULL,'2026-06-12 20:24:31','2026-06-12 20:24:31','2026-06-12 20:24:31'),('6f19d278-8ce8-4b60-b4bb-2c07d8dd8dda','ten-0001','pp-001','dp-001','2026-07-07','10:00:00','10:30:00','cancelled','in_person','Annual checkup',NULL,'usr-pt-001','test','2026-06-12 20:24:27','2026-06-12 20:24:27','2026-06-12 20:24:29'),('88ab0116-964a-4732-9d98-51cc442a4364','ten-0001','206165c9-8ca4-403e-8222-954c15d2a6bb','7e112397-dd59-407c-aa38-b0b2140a6c0b','2026-06-13','18:50:00','19:00:00','cancelled','in_person','abdoment pain',NULL,'cc44525d-b792-4882-8867-5f1ae7c7af05',NULL,'2026-06-13 18:51:13','2026-06-13 18:51:13','2026-06-13 18:51:20'),('apt-001','ten-0001','pp-001','dp-001','2026-05-10','09:00:00','09:30:00','completed','in_person','Annual physical exam','Routine checkup completed. BP slightly elevated.',NULL,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36','2026-06-12 19:16:36'),('apt-002','ten-0001','pp-002','dp-001','2026-05-12','10:00:00','10:30:00','completed','in_person','Diabetes follow-up','HbA1c improved. Medication adjusted.',NULL,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36','2026-06-12 19:16:36'),('apt-003','ten-0001','pp-003','dp-002','2026-05-15','08:00:00','08:45:00','completed','in_person','Chest pain evaluation','ECG normal. Advised lifestyle changes.',NULL,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36','2026-06-12 19:16:36'),('apt-004','ten-0001','pp-007','dp-001','2026-05-20','11:00:00','11:30:00','completed','in_person','Knee pain','Referred to orthopedics.',NULL,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36','2026-06-12 19:16:36'),('apt-005','ten-0001','pp-008','dp-001','2026-06-01','09:30:00','10:00:00','completed','follow_up','Follow-up skin rash','Rash resolved. No further treatment needed.',NULL,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36','2026-06-12 19:16:36'),('apt-006','ten-0002','pp-004','dp-003','2026-05-22','09:00:00','09:30:00','completed','in_person','Child vaccination','MMR vaccine administered.',NULL,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36','2026-06-12 19:16:36'),('apt-007','ten-0002','pp-005','dp-004','2026-05-28','10:00:00','11:00:00','completed','in_person','Right knee sports injury','ACL tear confirmed on MRI. Surgery planned.',NULL,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36','2026-06-12 19:16:36'),('apt-008','ten-0001','pp-001','dp-002','2026-06-18','08:00:00','08:45:00','confirmed','follow_up','Cardiology follow-up',NULL,NULL,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36','2026-06-12 19:16:36'),('apt-009','ten-0001','pp-002','dp-001','2026-06-19','14:00:00','14:30:00','confirmed','in_person','Blood test results review',NULL,NULL,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36','2026-06-12 19:16:36'),('apt-010','ten-0002','pp-004','dp-004','2026-06-20','10:00:00','11:00:00','confirmed','in_person','Shoulder pain',NULL,NULL,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36','2026-06-12 19:16:36'),('apt-011','ten-0001','pp-003','dp-001','2026-06-23','10:00:00','10:30:00','pending','in_person','Breathing difficulties',NULL,NULL,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36','2026-06-12 19:16:36'),('apt-012','ten-0001','pp-007','dp-002','2026-06-25','08:00:00','08:45:00','pending','in_person','Chest tightness',NULL,NULL,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36','2026-06-12 19:16:36'),('apt-013','ten-0003','pp-006','dp-005','2026-06-24','10:00:00','10:30:00','pending','in_person','Acne treatment',NULL,NULL,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36','2026-06-12 19:16:36'),('apt-014','ten-0001','pp-008','dp-001','2026-06-10','09:00:00','09:30:00','cancelled','in_person','General checkup',NULL,NULL,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36','2026-06-12 19:16:36'),('apt-015','ten-0002','pp-005','dp-003','2026-06-05','11:00:00','11:30:00','cancelled','in_person','Routine visit',NULL,NULL,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36','2026-06-12 19:16:36'),('d0f99f86-faa5-4c59-b71b-6f6bc15fe778','ten-0001','pp-001','dp-001','2026-06-15','09:00:00','09:30:00','cancelled','in_person','Regular checkup',NULL,'usr-pt-001','test cancel','2026-06-12 20:13:08','2026-06-12 20:13:08','2026-06-12 20:13:10'),('edcd406f-828a-498e-88cf-00e74a6cdae8','ten-0001','206165c9-8ca4-403e-8222-954c15d2a6bb','7e112397-dd59-407c-aa38-b0b2140a6c0b','2026-06-13','19:00:00','19:10:00','completed','follow_up','abdomen pain',NULL,NULL,NULL,'2026-06-13 18:51:49','2026-06-13 18:51:49','2026-06-13 18:55:24');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dispensing_records`
--

DROP TABLE IF EXISTS `dispensing_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dispensing_records` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) NOT NULL,
  `prescription_id` char(36) NOT NULL,
  `pharmacy_id` char(36) NOT NULL,
  `dispensed_by` char(36) NOT NULL,
  `dispensed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_prescription` (`prescription_id`),
  KEY `idx_pharmacy` (`pharmacy_id`),
  KEY `fk_disp_tenant` (`tenant_id`),
  CONSTRAINT `fk_disp_pharmacy` FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacy_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_disp_presc` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_disp_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dispensing_records`
--

LOCK TABLES `dispensing_records` WRITE;
/*!40000 ALTER TABLE `dispensing_records` DISABLE KEYS */;
INSERT INTO `dispensing_records` VALUES ('83834446-df4e-4d5d-9082-b4ccbde46b06','ten-0001','6a47d2c7-ebb6-43e0-8701-7afc6cb00bd0','pharm-001','usr-ph-001','2026-06-12 20:28:36','Dispensed as prescribed','2026-06-12 20:28:36'),('92b3a2c9-e6ec-4e5f-87d6-ab59920c02a5','ten-0001','7257c6cb-59ae-48ef-828d-97dbe7686c5b','pharm-001','usr-ph-001','2026-06-12 20:13:13',NULL,'2026-06-12 20:13:13'),('disp-001','ten-0001','rx-003','pharm-001','usr-ph-001','2026-05-16 10:30:00','All 3 medications dispensed. Patient counseled on Warfarin diet.','2026-06-12 19:16:36'),('disp-002','ten-0001','rx-005','pharm-001','usr-ph-001','2026-06-02 14:15:00','Prednisone taper schedule explained to patient.','2026-06-12 19:16:36'),('disp-003','ten-0002','rx-006','pharm-002','usr-ph-002','2026-05-22 11:45:00','Paracetamol dispensed. Advised to return if fever persists >72h.','2026-06-12 19:16:36');
/*!40000 ALTER TABLE `dispensing_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor_availability`
--

DROP TABLE IF EXISTS `doctor_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor_availability` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `doctor_id` char(36) NOT NULL,
  `day_of_week` tinyint NOT NULL COMMENT '0=Sun,1=Mon,...,6=Sat',
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `slot_duration_mins` int NOT NULL DEFAULT '30',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_doctor_day` (`doctor_id`,`day_of_week`),
  CONSTRAINT `fk_avail_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctor_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_availability`
--

LOCK TABLES `doctor_availability` WRITE;
/*!40000 ALTER TABLE `doctor_availability` DISABLE KEYS */;
INSERT INTO `doctor_availability` VALUES ('3613b70c-c953-4131-858a-a48bb5c2a24f','dp-001',1,'09:00:00','17:00:00',30,1,'2026-06-12 20:24:27','2026-06-12 20:24:27'),('3add7ca7-4389-4ad1-8c70-97fc208bcc70','7e112397-dd59-407c-aa38-b0b2140a6c0b',6,'18:00:00','20:00:00',10,1,'2026-06-13 18:50:16','2026-06-13 18:50:16'),('459ba219-6875-4792-b189-c4995a4fbda2','dp-001',5,'09:00:00','13:00:00',30,1,'2026-06-12 20:24:27','2026-06-12 20:24:27'),('50e0c1b0-081c-4dad-b118-55383158d9ec','dp-001',3,'09:00:00','17:00:00',30,1,'2026-06-12 20:24:27','2026-06-12 20:24:27'),('c0f31939-6b98-4953-83f9-e14978505321','dp-001',4,'09:00:00','17:00:00',30,1,'2026-06-12 20:24:27','2026-06-12 20:24:27'),('c1d7d87d-3401-487c-9c84-008fd2e7415c','dp-001',2,'09:00:00','17:00:00',30,1,'2026-06-12 20:24:27','2026-06-12 20:24:27'),('da-006','dp-002',1,'08:00:00','16:00:00',45,1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('da-007','dp-002',3,'08:00:00','16:00:00',45,1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('da-008','dp-002',5,'08:00:00','16:00:00',45,1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('da-009','dp-003',1,'09:00:00','16:00:00',30,1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('da-010','dp-003',2,'09:00:00','16:00:00',30,1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('da-011','dp-003',3,'09:00:00','16:00:00',30,1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('da-012','dp-003',4,'09:00:00','16:00:00',30,1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('da-013','dp-004',2,'10:00:00','18:00:00',60,1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('da-014','dp-004',4,'10:00:00','18:00:00',60,1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('da-015','dp-004',6,'09:00:00','13:00:00',60,1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('da-016','dp-005',1,'10:00:00','18:00:00',30,1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('da-017','dp-005',2,'10:00:00','18:00:00',30,1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('da-018','dp-005',3,'10:00:00','18:00:00',30,1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('da-019','dp-005',4,'10:00:00','18:00:00',30,1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('da-020','dp-005',5,'10:00:00','15:00:00',30,1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('e562504c-5224-46ce-8ead-46fe28051f51','6f79f050-bd91-429d-9745-ec3ac9ba98ab',1,'09:00:00','17:00:00',30,1,'2026-06-13 19:16:00','2026-06-13 19:16:00');
/*!40000 ALTER TABLE `doctor_availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor_leaves`
--

DROP TABLE IF EXISTS `doctor_leaves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor_leaves` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `doctor_id` char(36) NOT NULL,
  `leave_date` date NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_doctor_date` (`doctor_id`,`leave_date`),
  CONSTRAINT `fk_leave_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctor_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_leaves`
--

LOCK TABLES `doctor_leaves` WRITE;
/*!40000 ALTER TABLE `doctor_leaves` DISABLE KEYS */;
INSERT INTO `doctor_leaves` VALUES ('4128e6b6-0a53-43db-989a-f63ae9280830','dp-001','2026-07-04','Holiday','2026-06-12 20:24:27'),('dl-001','dp-001','2026-06-25','Medical conference','2026-06-12 19:16:36'),('dl-002','dp-001','2026-06-26','Medical conference','2026-06-12 19:16:36'),('dl-003','dp-002','2026-07-04','Public holiday','2026-06-12 19:16:36'),('dl-004','dp-003','2026-06-30','Personal leave','2026-06-12 19:16:36');
/*!40000 ALTER TABLE `doctor_leaves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor_profiles`
--

DROP TABLE IF EXISTS `doctor_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor_profiles` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `specialization` varchar(255) NOT NULL,
  `qualification` varchar(500) DEFAULT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `experience_years` int NOT NULL DEFAULT '0',
  `consultation_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `bio` text,
  `languages` json DEFAULT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  CONSTRAINT `fk_dp_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_profiles`
--

LOCK TABLES `doctor_profiles` WRITE;
/*!40000 ALTER TABLE `doctor_profiles` DISABLE KEYS */;
INSERT INTO `doctor_profiles` VALUES ('6f79f050-bd91-429d-9745-ec3ac9ba98ab','6edbadb9-e58c-4222-bf96-e63b3d3479ed','cfd73ad0-93a0-44bc-a88d-30ffaf953de7','Ortho','MD','hhhnn76876ggg6',24,150.00,'Ex senior sugeon at city hospital',NULL,1,'2026-06-13 19:13:16','2026-06-13 19:13:16'),('7e112397-dd59-407c-aa38-b0b2140a6c0b','ec2b8f5c-6959-4b1a-85d4-f554fcdd2e46','ten-0001','General doctor',NULL,NULL,0,25.00,NULL,NULL,1,'2026-06-13 18:44:01','2026-06-13 18:44:01'),('965e87ba-8a29-4c47-b656-ddf0fa5eaa51','35659750-c1cf-405b-96cf-1f64fab79427','ten-0001','Neurology','MD',NULL,5,200.00,NULL,NULL,1,'2026-06-12 20:24:26','2026-06-12 20:24:26'),('dp-001','usr-dr-001','ten-0001','Family Medicine','MD, CCFP','ON-DR-10201',14,150.00,NULL,'[]',1,'2026-06-12 19:16:36','2026-06-12 20:24:27'),('dp-002','usr-dr-002','ten-0001','Cardiology','MD, FRCPC (Cardiology)','ON-DR-10202',18,250.00,'Dr. Chen is a board-certified cardiologist with expertise in heart disease.','[\"English\", \"Mandarin\"]',1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('dp-003','usr-dr-003','ten-0002','Pediatrics','MD, FRCPC (Pediatrics)','BC-DR-20301',11,180.00,'Dr. Patel is passionate about child health and development.','[\"English\", \"Hindi\", \"Gujarati\"]',1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('dp-004','usr-dr-004','ten-0002','Orthopedics','MD, FRCSC (Ortho)','BC-DR-20302',21,300.00,'Dr. Wilson specializes in sports injuries and joint replacement.','[\"English\"]',1,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('dp-005','usr-dr-005','ten-0003','Dermatology','MD, FRCPC (Derm)','AB-DR-30301',8,200.00,'Dr. Rodriguez focuses on skin conditions and cosmetic dermatology.','[\"English\", \"Spanish\"]',1,'2026-06-12 19:16:36','2026-06-12 19:16:36');
/*!40000 ALTER TABLE `doctor_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_items` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `invoice_id` char(36) NOT NULL,
  `medicine_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_invoice` (`invoice_id`),
  CONSTRAINT `fk_ii_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_items`
--

LOCK TABLES `invoice_items` WRITE;
/*!40000 ALTER TABLE `invoice_items` DISABLE KEYS */;
INSERT INTO `invoice_items` VALUES ('7d0ed8fd-8700-47e1-9c43-5fe5bdfc47a4','07f7661a-5db3-4d56-a32d-8e3ba875dbcb','Amoxicillin',21,5.00,105.00,'2026-06-12 20:28:36'),('fb242406-404d-47ae-a95f-2487ebd3f727','07f7661a-5db3-4d56-a32d-8e3ba875dbcb','Ibuprofen',10,5.00,50.00,'2026-06-12 20:28:36'),('ii-001','inv-001','Metoprolol 50mg',120,0.35,42.00,'2026-06-12 19:16:36'),('ii-002','inv-001','Rosuvastatin 10mg',60,0.85,51.00,'2026-06-12 19:16:36'),('ii-003','inv-001','Warfarin 5mg',60,0.88,52.50,'2026-06-12 19:16:36'),('ii-004','inv-002','Prednisone 10mg',14,1.50,21.00,'2026-06-12 19:16:36'),('ii-005','inv-002','Cetirizine 10mg',30,0.70,21.00,'2026-06-12 19:16:36'),('ii-006','inv-003','Paracetamol 500mg',20,0.45,8.99,'2026-06-12 19:16:36');
/*!40000 ALTER TABLE `invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) NOT NULL,
  `dispensing_id` char(36) NOT NULL,
  `patient_id` char(36) NOT NULL,
  `pharmacy_id` char(36) NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `tax_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('draft','issued','paid','cancelled') NOT NULL DEFAULT 'issued',
  `notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_no` (`invoice_no`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_patient` (`patient_id`),
  KEY `idx_dispensing` (`dispensing_id`),
  KEY `idx_invoice_no` (`invoice_no`),
  KEY `fk_inv_pharmacy` (`pharmacy_id`),
  CONSTRAINT `fk_inv_disp` FOREIGN KEY (`dispensing_id`) REFERENCES `dispensing_records` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inv_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inv_pharmacy` FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacy_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inv_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES ('07f7661a-5db3-4d56-a32d-8e3ba875dbcb','ten-0001','83834446-df4e-4d5d-9082-b4ccbde46b06','pp-002','pharm-001','INV-202606-258014',155.00,13.00,20.15,175.15,'issued',NULL,'2026-06-12 20:28:36','2026-06-12 20:28:36'),('fe670dad-a283-43b4-9ada-0d7129abe7fc','ten-0001','92b3a2c9-e6ec-4e5f-87d6-ab59920c02a5','pp-001','pharm-001','INV-202606-402733',0.00,0.00,0.00,0.00,'issued',NULL,'2026-06-12 20:13:13','2026-06-12 20:13:13'),('inv-001','ten-0001','disp-001','pp-003','pharm-001','INV-202605-30001',145.50,13.00,18.92,164.42,'paid','Paid by patient via debit card','2026-06-12 19:16:36','2026-06-12 19:16:36'),('inv-002','ten-0001','disp-002','pp-008','pharm-001','INV-202606-30002',42.00,13.00,5.46,47.46,'issued',NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('inv-003','ten-0002','disp-003','pp-004','pharm-002','INV-202605-30003',8.99,13.00,1.17,10.16,'paid','Paid by cash','2026-06-12 19:16:36','2026-06-12 19:16:36');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_reports`
--

DROP TABLE IF EXISTS `medical_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_reports` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) NOT NULL,
  `patient_id` char(36) NOT NULL,
  `doctor_id` char(36) NOT NULL,
  `appointment_id` char(36) DEFAULT NULL,
  `report_type` enum('lab','imaging','pathology','other') NOT NULL DEFAULT 'lab',
  `title` varchar(255) NOT NULL,
  `description` text,
  `file_url` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `report_date` date NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_patient` (`patient_id`),
  KEY `idx_doctor` (`doctor_id`),
  KEY `idx_report_type` (`report_type`),
  KEY `fk_report_appt` (`appointment_id`),
  CONSTRAINT `fk_report_appt` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_report_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctor_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_report_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_report_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_reports`
--

LOCK TABLES `medical_reports` WRITE;
/*!40000 ALTER TABLE `medical_reports` DISABLE KEYS */;
INSERT INTO `medical_reports` VALUES ('mr-001','ten-0001','pp-001','dp-001','apt-001','lab','Complete Blood Count & Metabolic Panel','CBC and comprehensive metabolic panel results','https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-001.pdf','CBC_John_Doe_20260510.pdf',245000,'2026-05-10','2026-06-12 19:16:36','2026-06-12 19:16:36'),('mr-002','ten-0001','pp-001','dp-001','apt-001','lab','24-Hour Ambulatory Blood Pressure Monitor','BP readings over 24 hours','https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-002.pdf','ABPM_John_Doe_20260510.pdf',180000,'2026-05-11','2026-06-12 19:16:36','2026-06-12 19:16:36'),('mr-003','ten-0001','pp-002','dp-001','apt-002','lab','HbA1c & Lipid Panel','Glycated hemoglobin and lipid profile','https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-003.pdf','HbA1c_Alice_Smith_20260512.pdf',210000,'2026-05-12','2026-06-12 19:16:36','2026-06-12 19:16:36'),('mr-004','ten-0001','pp-003','dp-002','apt-003','imaging','ECG 12-Lead','12-lead electrocardiogram report','https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-004.pdf','ECG_Robert_Brown_20260515.pdf',320000,'2026-05-15','2026-06-12 19:16:36','2026-06-12 19:16:36'),('mr-005','ten-0001','pp-003','dp-002','apt-003','imaging','Chest X-Ray PA View','Posteroanterior chest X-ray','https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-005.jpg','CXR_Robert_Brown_20260515.jpg',1500000,'2026-05-15','2026-06-12 19:16:36','2026-06-12 19:16:36'),('mr-006','ten-0002','pp-005','dp-004','apt-007','imaging','Right Knee MRI','MRI of right knee joint — ACL assessment','https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-006.pdf','MRI_Knee_William_20260528.pdf',4200000,'2026-05-29','2026-06-12 19:16:36','2026-06-12 19:16:36'),('mr-007','ten-0001','pp-007','dp-001','apt-004','lab','Fasting Blood Sugar & HbA1c','Diabetes monitoring panel','https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-007.pdf','Diabetes_David_Lee_20260520.pdf',195000,'2026-05-20','2026-06-12 19:16:36','2026-06-12 19:16:36'),('mr-008','ten-0001','pp-008','dp-001','apt-005','pathology','Skin Patch Test Results','Allergen patch test panel for contact dermatitis','https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-008.pdf','SkinPatch_Olivia_20260601.pdf',165000,'2026-06-01','2026-06-12 19:16:36','2026-06-12 19:16:36');
/*!40000 ALTER TABLE `medical_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicines`
--

DROP TABLE IF EXISTS `medicines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicines` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `generic_name` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `form` enum('tablet','capsule','syrup','injection','cream','drops','inhaler','patch','other') NOT NULL DEFAULT 'tablet',
  `strength` varchar(100) DEFAULT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `description` text,
  `side_effects` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` char(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_category` (`category`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicines`
--

LOCK TABLES `medicines` WRITE;
/*!40000 ALTER TABLE `medicines` DISABLE KEYS */;
INSERT INTO `medicines` VALUES ('065d7962-71ad-4f58-aa89-f21a0bc147a0','TestMed1002Updated','test-generic','Antibiotic','tablet',NULL,NULL,NULL,NULL,0,'usr-sa-001','2026-06-12 20:13:13','2026-06-12 20:13:13'),('60d3acc7-5f62-4992-ad2c-6834216f67c9','cremaffin plus','liquid paraffin','liquid','syrup','strong','Abott medications','used for chronic constipation',NULL,1,'usr-sa-001','2026-06-13 19:05:51','2026-06-13 19:05:51'),('b25a55a7-5c2d-4efd-8b7c-ee557075ae6f','TestMed46270Updated','test-mol','Antibiotic','tablet',NULL,NULL,NULL,NULL,0,'usr-sa-001','2026-06-12 20:24:34','2026-06-12 20:24:34'),('med-001','Amoxicillin 500mg','Amoxicillin','Antibiotic','capsule','500mg','Apotex Inc.','Broad-spectrum penicillin antibiotic','Nausea, diarrhea, rash',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-002','Ibuprofen 400mg','Ibuprofen','Analgesic/NSAID','tablet','400mg','Pharmascience','Anti-inflammatory pain reliever','GI upset, headache, dizziness',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-003','Paracetamol 500mg','Acetaminophen','Analgesic','tablet','500mg','Jamp Pharma','Pain reliever and fever reducer','Rare liver damage if overdosed',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-004','Metformin 500mg','Metformin HCl','Antidiabetic','tablet','500mg','Mylan','First-line treatment for Type 2 Diabetes','GI upset, metallic taste, lactic acidosis',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-005','Atorvastatin 20mg','Atorvastatin','Statin','tablet','20mg','Ranbaxy','Lowers LDL cholesterol','Muscle pain, liver enzyme elevation',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-006','Omeprazole 20mg','Omeprazole','PPI','capsule','20mg','AstraZeneca','Proton pump inhibitor for acid reflux','Headache, diarrhea, abdominal pain',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-007','Lisinopril 10mg','Lisinopril','ACE Inhibitor','tablet','10mg','Teva Canada','ACE inhibitor for hypertension','Dry cough, dizziness, hyperkalemia',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-008','Salbutamol Inhaler','Salbutamol','Bronchodilator','inhaler','100mcg/dose','GlaxoSmithKline','Relieves bronchospasm in asthma/COPD','Tremors, tachycardia, headache',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-009','Cetirizine 10mg','Cetirizine','Antihistamine','tablet','10mg','Apotex Inc.','H1 antihistamine for allergies','Drowsiness, dry mouth',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-010','Azithromycin 250mg','Azithromycin','Antibiotic','tablet','250mg','Pfizer Canada','Macrolide antibiotic for respiratory infections','Nausea, vomiting, diarrhea',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-011','Amlodipine 5mg','Amlodipine','Calcium Blocker','tablet','5mg','Sandoz','Calcium channel blocker for hypertension','Peripheral edema, flushing, headache',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-012','Metoprolol 50mg','Metoprolol Tartrate','Beta Blocker','tablet','50mg','AstraZeneca','Beta blocker for heart conditions','Fatigue, bradycardia, cold extremities',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-013','Levothyroxine 100mcg','Levothyroxine','Thyroid Hormone','tablet','100mcg','Paladin Labs','Thyroid hormone replacement','Palpitations, weight loss, insomnia',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-014','Warfarin 5mg','Warfarin','Anticoagulant','tablet','5mg','Jamp Pharma','Blood thinner to prevent clots','Bleeding, bruising',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-015','Prednisone 10mg','Prednisone','Corticosteroid','tablet','10mg','Pharmascience','Anti-inflammatory steroid','Weight gain, insomnia, hyperglycemia',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-016','Pantoprazole 40mg','Pantoprazole','PPI','tablet','40mg','Nycomed','Proton pump inhibitor','Headache, diarrhea, flatulence',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-017','Ramipril 5mg','Ramipril','ACE Inhibitor','capsule','5mg','Sanofi','Treats hypertension and heart failure','Dry cough, hypotension',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-018','Rosuvastatin 10mg','Rosuvastatin','Statin','tablet','10mg','AstraZeneca','Reduces LDL cholesterol','Muscle pain, nausea',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-019','Sertraline 50mg','Sertraline','SSRI','tablet','50mg','Pfizer Canada','Antidepressant for depression/anxiety','Nausea, insomnia, sexual dysfunction',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-020','Clonazepam 0.5mg','Clonazepam','Benzodiazepine','tablet','0.5mg','Hoffman La Roche','Treats panic disorder and seizures','Drowsiness, dizziness, dependence',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-021','Diclofenac 50mg','Diclofenac Sodium','Analgesic/NSAID','tablet','50mg','Novartis','NSAID for pain and inflammation','GI upset, hypertension',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-022','Fluticasone Nasal','Fluticasone','Corticosteroid','drops','50mcg/spray','GlaxoSmithKline','Nasal spray for allergic rhinitis','Nosebleed, nasal irritation',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-023','Hydrochlorothiazide','HCTZ','Diuretic','tablet','25mg','Apotex Inc.','Thiazide diuretic for hypertension','Hypokalemia, photosensitivity',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-024','Gabapentin 300mg','Gabapentin','Anticonvulsant','capsule','300mg','Pfizer Canada','Treats nerve pain and seizures','Dizziness, somnolence, ataxia',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-025','Metronidazole 500mg','Metronidazole','Antibiotic','tablet','500mg','Teva Canada','Antiprotozoal and antibacterial agent','Nausea, metallic taste',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-026','Furosemide 40mg','Furosemide','Diuretic','tablet','40mg','Mylan','Loop diuretic for edema and heart failure','Hypokalemia, dehydration, ototoxicity',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-027','Insulin Glargine','Insulin Glargine','Antidiabetic','injection','100 U/mL','Sanofi','Long-acting basal insulin for diabetes','Hypoglycemia, injection site reactions',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-028','Doxycycline 100mg','Doxycycline Hyclate','Antibiotic','capsule','100mg','Pharmascience','Tetracycline antibiotic for infections','Photosensitivity, nausea, esophageal irritation',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-029','Alendronate 70mg','Alendronate Sodium','Bisphosphonate','tablet','70mg','Merck Canada','Weekly tablet for osteoporosis','Esophageal irritation, jaw osteonecrosis',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('med-030','Montelukast 10mg','Montelukast Sodium','Leukotriene','tablet','10mg','Merck Canada','Asthma and allergic rhinitis controller','Headache, GI upset, mood changes',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36');
/*!40000 ALTER TABLE `medicines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_profiles`
--

DROP TABLE IF EXISTS `patient_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_profiles` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `blood_group` enum('A+','A-','B+','B-','AB+','AB-','O+','O-','unknown') NOT NULL DEFAULT 'unknown',
  `height_cm` decimal(5,2) DEFAULT NULL,
  `weight_kg` decimal(5,2) DEFAULT NULL,
  `allergies` json DEFAULT NULL,
  `chronic_conditions` json DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `insurance_info` json DEFAULT NULL,
  `address` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  CONSTRAINT `fk_pp_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_profiles`
--

LOCK TABLES `patient_profiles` WRITE;
/*!40000 ALTER TABLE `patient_profiles` DISABLE KEYS */;
INSERT INTO `patient_profiles` VALUES ('206165c9-8ca4-403e-8222-954c15d2a6bb','cc44525d-b792-4882-8867-5f1ae7c7af05','ten-0001','unknown',NULL,NULL,'[]','[]',NULL,NULL,NULL,'#45, blvd street, new york','2026-06-13 18:46:54','2026-06-13 18:46:54'),('86abd2c8-556b-4d5c-83f4-c6f81a564f55','a74307a9-aa89-4936-94f1-9df3f0fa30a8','ten-0001','unknown',NULL,NULL,'[]','[]',NULL,NULL,NULL,NULL,'2026-06-12 20:24:27','2026-06-12 20:24:27'),('b75d23f0-bc6f-4e0a-9aa3-a3a897b2dae5','22c449ed-5d84-4ea0-a4c3-f063c673c391','ten-0001','A+',NULL,NULL,'[]','[]',NULL,NULL,NULL,'123 Test St','2026-06-12 20:01:14','2026-06-12 20:01:14'),('d64fe75d-ef85-467e-b0d2-80ab34f36f1d','6cebe115-9e25-4dd5-86a4-491689b6e5d2','ten-0001','B+',NULL,NULL,'[]','[]',NULL,NULL,NULL,NULL,'2026-06-12 20:13:13','2026-06-12 20:13:13'),('e06bd0e5-96cb-4dfe-bfac-3be28f1f30ac','f8a94dca-f5fa-4d06-a08b-0ceb2ffac646','ten-0001','B+',NULL,NULL,'[]','[]',NULL,NULL,NULL,'fvd fff','2026-06-12 20:00:08','2026-06-12 20:00:08'),('pp-001','usr-pt-001','ten-0001','unknown',NULL,NULL,'[]','[]',NULL,NULL,NULL,NULL,'2026-06-12 19:16:36','2026-06-12 20:24:34'),('pp-002','usr-pt-002','ten-0001','A+',165.00,62.00,'[]','[\"Type 2 Diabetes\", \"Hypothyroidism\"]','Bob Smith','+1-416-555-9002',NULL,'12 King St E, Toronto, ON','2026-06-12 19:16:36','2026-06-12 19:16:36'),('pp-003','usr-pt-003','ten-0001','B-',180.00,92.00,'[\"Sulfa drugs\", \"Aspirin\"]','[\"COPD\", \"Hypertension\", \"Heart Disease\"]','Linda Brown','+1-416-555-9003',NULL,'88 Bloor St W, Toronto, ON','2026-06-12 19:16:36','2026-06-12 19:16:36'),('pp-004','usr-pt-004','ten-0002','AB+',170.00,68.00,'[\"Latex\"]','[]','Tom Davis','+1-604-555-9004',NULL,'200 Granville St, Vancouver, BC','2026-06-12 19:16:36','2026-06-12 19:16:36'),('pp-005','usr-pt-005','ten-0002','O-',175.00,85.00,'[\"Codeine\"]','[\"Asthma\"]','Maria Garcia','+1-604-555-9005',NULL,'350 Robson St, Vancouver, BC','2026-06-12 19:16:36','2026-06-12 19:16:36'),('pp-006','usr-pt-006','ten-0003','A-',163.00,57.50,'[]','[]','Carlos Martinez','+1-403-555-9006',NULL,'10 Centre St, Calgary, AB','2026-06-12 19:16:36','2026-06-12 19:16:36'),('pp-007','usr-pt-007','ten-0001','B+',172.00,78.00,'[\"NSAIDs\"]','[\"Type 2 Diabetes\", \"Dyslipidemia\"]','Amy Lee','+1-416-555-9007',NULL,'5 Sheppard Ave E, Toronto, ON','2026-06-12 19:16:36','2026-06-12 19:16:36'),('pp-008','usr-pt-008','ten-0001','O+',160.00,55.00,'[]','[]','Mark Taylor','+1-416-555-9008',NULL,'99 College St, Toronto, ON','2026-06-12 19:16:36','2026-06-12 19:16:36');
/*!40000 ALTER TABLE `patient_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacy_profiles`
--

DROP TABLE IF EXISTS `pharmacy_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacy_profiles` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `pharmacy_name` varchar(255) NOT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `address` text,
  `operating_hours` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  CONSTRAINT `fk_pharm_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pharm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacy_profiles`
--

LOCK TABLES `pharmacy_profiles` WRITE;
/*!40000 ALTER TABLE `pharmacy_profiles` DISABLE KEYS */;
INSERT INTO `pharmacy_profiles` VALUES ('ba580aff-5878-41e2-bdfc-160e7050c6d9','c44c782e-fdaf-425b-acce-9ff4f809b47f','cfd73ad0-93a0-44bc-a88d-30ffaf953de7','itech pharmacy',NULL,NULL,NULL,'2026-06-13 19:15:14','2026-06-13 19:15:14'),('f8fc54da-7044-4c18-8c07-375c76c54542','bc11f665-dfaf-45d2-b291-e55bdc166543','ten-0001','TestRx46270',NULL,NULL,NULL,'2026-06-12 20:24:26','2026-06-12 20:24:26'),('pharm-001','usr-ph-001','ten-0001','MedPlus Pharmacy','ON-PH-4401','123 Medical Drive, Toronto, ON','{\"fri\": \"8am-6pm\", \"mon\": \"8am-8pm\", \"sat\": \"9am-5pm\", \"sun\": \"Closed\", \"thu\": \"8am-8pm\", \"tue\": \"8am-8pm\", \"wed\": \"8am-8pm\"}','2026-06-12 19:16:36','2026-06-12 19:16:36'),('pharm-002','usr-ph-002','ten-0002','CarePoint Dispensary','BC-PH-5501','456 Wellness Blvd, Vancouver, BC','{\"fri\": \"9am-6pm\", \"mon\": \"9am-7pm\", \"sat\": \"10am-4pm\", \"sun\": \"Closed\", \"thu\": \"9am-7pm\", \"tue\": \"9am-7pm\", \"wed\": \"9am-7pm\"}','2026-06-12 19:16:36','2026-06-12 19:16:36');
/*!40000 ALTER TABLE `pharmacy_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription_items`
--

DROP TABLE IF EXISTS `prescription_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_items` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `prescription_id` char(36) NOT NULL,
  `medicine_id` char(36) NOT NULL,
  `medicine_name` varchar(255) NOT NULL,
  `dosage` varchar(100) NOT NULL,
  `frequency` varchar(100) NOT NULL,
  `duration` varchar(100) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `instructions` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_prescription` (`prescription_id`),
  KEY `idx_medicine` (`medicine_id`),
  CONSTRAINT `fk_pi_medicine` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_pi_prescription` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_items`
--

LOCK TABLES `prescription_items` WRITE;
/*!40000 ALTER TABLE `prescription_items` DISABLE KEYS */;
INSERT INTO `prescription_items` VALUES ('17acbbeb-7a71-48f2-bef8-a452046cc775','2ec85e42-9584-45c8-a232-13e4ecc1b72d','med-021','Diclofenac 50mg','50 mg','BD','7 days',1,NULL,'2026-06-13 18:55:24'),('38ba469b-698a-4719-b36d-f5fb0e65c54f','6a47d2c7-ebb6-43e0-8701-7afc6cb00bd0','med-005','Ibuprofen','400mg','2x/day','5 days',10,'With food','2026-06-12 20:28:35'),('48f2526e-c041-4577-9b91-b04e89a478f1','7257c6cb-59ae-48ef-828d-97dbe7686c5b','med-001','Amoxicillin','500mg','3x/day','7 days',21,'Take with food','2026-06-12 20:13:12'),('67681dce-e8ee-4fac-865a-337bff1e0f05','6a47d2c7-ebb6-43e0-8701-7afc6cb00bd0','med-003','Amoxicillin','500mg','3x/day','7 days',21,'With food','2026-06-12 20:28:35'),('7b67bb78-3b2e-4759-a9e0-a4815195aff9','3d8b89eb-7435-4e21-8bac-a3810822758e','med-001','Lisinopril','10mg','Once daily','30 days',30,'Take in morning','2026-06-12 20:24:33'),('81a7ad0d-4507-4ef8-b5a0-e250a9d7441f','40c72578-2d8f-4d74-a5f8-141dc8dd6c60','med-029','Alendronate 70mg','6','2','7 days',1,NULL,'2026-06-13 13:16:47'),('e7ed306c-87ff-4eeb-8ed3-b2538dbd01be','3d8b89eb-7435-4e21-8bac-a3810822758e','med-002','Aspirin','81mg','Once daily','30 days',30,'Take with food','2026-06-12 20:24:33'),('pi-001','rx-001','med-007','Lisinopril 10mg','10mg','Once daily','90 days',90,'Take in the morning with or without food','2026-06-12 19:16:36'),('pi-002','rx-001','med-011','Amlodipine 5mg','5mg','Once daily','90 days',90,'Take at the same time each day','2026-06-12 19:16:36'),('pi-003','rx-001','med-023','Hydrochlorothiazide 25mg','25mg','Once daily','90 days',90,'Take in the morning, avoid evening dose','2026-06-12 19:16:36'),('pi-004','rx-002','med-004','Metformin 500mg','500mg','Twice daily','90 days',180,'Take with meals to reduce GI side effects','2026-06-12 19:16:36'),('pi-005','rx-002','med-005','Atorvastatin 20mg','20mg','Once at night','90 days',90,'Take at bedtime','2026-06-12 19:16:36'),('pi-006','rx-002','med-013','Levothyroxine 100mcg','100mcg','Once daily','90 days',90,'Take 30 minutes before breakfast','2026-06-12 19:16:36'),('pi-007','rx-003','med-012','Metoprolol 50mg','50mg','Twice daily','60 days',120,'Do not stop abruptly','2026-06-12 19:16:36'),('pi-008','rx-003','med-018','Rosuvastatin 10mg','10mg','Once at night','60 days',60,'Avoid grapefruit juice','2026-06-12 19:16:36'),('pi-009','rx-003','med-014','Warfarin 5mg','5mg','Once daily','60 days',60,'Regular INR monitoring required','2026-06-12 19:16:36'),('pi-010','rx-004','med-002','Ibuprofen 400mg','400mg','Three times daily','30 days',90,'Take with food. Avoid if stomach upset','2026-06-12 19:16:36'),('pi-011','rx-004','med-006','Omeprazole 20mg','20mg','Once daily','30 days',30,'Take before breakfast to protect stomach','2026-06-12 19:16:36'),('pi-012','rx-005','med-015','Prednisone 10mg','10mg','Once daily (taper)','14 days',14,'Take with food. Do not stop abruptly','2026-06-12 19:16:36'),('pi-013','rx-005','med-009','Cetirizine 10mg','10mg','Once at night','30 days',30,'May cause drowsiness','2026-06-12 19:16:36'),('pi-014','rx-006','med-003','Paracetamol 500mg','500mg','Every 6 hours if needed','5 days',20,'Only if fever or pain. Max 4g/day','2026-06-12 19:16:36'),('pi-015','rx-007','med-021','Diclofenac 50mg','50mg','Twice daily','14 days',28,'Take with food. Not for long-term use','2026-06-12 19:16:36'),('pi-016','rx-007','med-003','Paracetamol 500mg','500mg','Every 6 hours as needed','14 days',56,'Max 8 tablets per day','2026-06-12 19:16:36'),('pi-017','rx-007','med-024','Gabapentin 300mg','300mg','Three times daily','21 days',63,'Reduces nerve pain. Do not drive initially','2026-06-12 19:16:36');
/*!40000 ALTER TABLE `prescription_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) NOT NULL,
  `appointment_id` char(36) DEFAULT NULL,
  `patient_id` char(36) NOT NULL,
  `doctor_id` char(36) NOT NULL,
  `prescription_no` varchar(50) NOT NULL,
  `diagnosis` text NOT NULL,
  `notes` text,
  `follow_up_date` date DEFAULT NULL,
  `status` enum('active','dispensed','expired','cancelled') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prescription_no` (`prescription_no`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_patient` (`patient_id`),
  KEY `idx_doctor` (`doctor_id`),
  KEY `idx_appointment` (`appointment_id`),
  KEY `idx_prescription_no` (`prescription_no`),
  CONSTRAINT `fk_presc_appt` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_presc_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctor_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_presc_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_presc_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
INSERT INTO `prescriptions` VALUES ('2ec85e42-9584-45c8-a232-13e4ecc1b72d','ten-0001','edcd406f-828a-498e-88cf-00e74a6cdae8','206165c9-8ca4-403e-8222-954c15d2a6bb','7e112397-dd59-407c-aa38-b0b2140a6c0b','RX-20260613-18902','indigestion','take light meals\n[LAB TEST REQUEST]\nCBC\nabdomen X-ray','2026-06-20','active','2026-06-13 18:55:24','2026-06-13 18:55:24'),('3d8b89eb-7435-4e21-8bac-a3810822758e','ten-0001',NULL,'pp-001','dp-001','RX-20260612-50418','Hypertension','Updated notes','2026-07-15','active','2026-06-12 20:24:33','2026-06-12 20:24:34'),('40c72578-2d8f-4d74-a5f8-141dc8dd6c60','ten-0001','apt-001','pp-001','dp-001','RX-20260613-51294','Htypertension',NULL,'2026-06-18','active','2026-06-13 13:16:47','2026-06-13 13:16:47'),('6a47d2c7-ebb6-43e0-8701-7afc6cb00bd0','ten-0001',NULL,'pp-002','dp-001','RX-20260612-78705','Bacterial infection',NULL,NULL,'dispensed','2026-06-12 20:28:35','2026-06-12 20:28:36'),('7257c6cb-59ae-48ef-828d-97dbe7686c5b','ten-0001',NULL,'pp-001','dp-001','RX-20260612-90163','Common cold','Rest and hydrate','2026-06-22','dispensed','2026-06-12 20:13:12','2026-06-12 20:13:13'),('rx-001','ten-0001','apt-001','pp-001','dp-001','RX-20260510-11001','Hypertension Stage 1','Monitor BP daily. Low sodium diet recommended. Avoid excessive caffeine.','2026-08-10','active','2026-06-12 19:16:36','2026-06-12 19:16:36'),('rx-002','ten-0001','apt-002','pp-002','dp-001','RX-20260512-11002','Type 2 Diabetes Mellitus — Uncontrolled','Check blood sugar before each meal. Increase physical activity. Reduce carbohydrate intake.','2026-09-12','active','2026-06-12 19:16:36','2026-06-12 19:16:36'),('rx-003','ten-0001','apt-003','pp-003','dp-002','RX-20260515-11003','Stable Angina with Dyslipidemia','Avoid strenuous activity. Nitroglycerin for acute episodes. Follow cardiac diet.','2026-08-15','dispensed','2026-06-12 19:16:36','2026-06-12 19:16:36'),('rx-004','ten-0001','apt-004','pp-007','dp-001','RX-20260520-11004','Osteoarthritis — Left Knee','Physical therapy recommended. Apply ice 20 min 3x daily. Avoid high-impact activities.','2026-07-20','active','2026-06-12 19:16:36','2026-06-12 19:16:36'),('rx-005','ten-0001','apt-005','pp-008','dp-001','RX-20260601-11005','Allergic Contact Dermatitis','Avoid triggering allergens. Moisturize twice daily.',NULL,'dispensed','2026-06-12 19:16:36','2026-06-12 19:16:36'),('rx-006','ten-0002','apt-006','pp-004','dp-003','RX-20260522-11006','Post-vaccination care','Normal to feel mild fever/soreness for 1-2 days. Paracetamol as needed.',NULL,'dispensed','2026-06-12 19:16:36','2026-06-12 19:16:36'),('rx-007','ten-0002','apt-007','pp-005','dp-004','RX-20260528-11007','ACL Tear — Right Knee','Rest, ice, compression, elevation (RICE). Physiotherapy pre-surgery.','2026-07-10','active','2026-06-12 19:16:36','2026-06-12 19:16:36');
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `referrals`
--

DROP TABLE IF EXISTS `referrals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `referrals` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) NOT NULL,
  `patient_id` char(36) NOT NULL,
  `referring_doctor_id` char(36) NOT NULL,
  `referred_doctor_id` char(36) NOT NULL,
  `appointment_id` char(36) DEFAULT NULL,
  `reason` text NOT NULL,
  `notes` text,
  `urgency` enum('routine','urgent','emergency') NOT NULL DEFAULT 'routine',
  `status` enum('pending','accepted','completed','rejected') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_patient` (`patient_id`),
  KEY `idx_referring_doctor` (`referring_doctor_id`),
  KEY `idx_referred_doctor` (`referred_doctor_id`),
  KEY `fk_ref_appt` (`appointment_id`),
  CONSTRAINT `fk_ref_appt` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ref_from_doc` FOREIGN KEY (`referring_doctor_id`) REFERENCES `doctor_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ref_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ref_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ref_to_doc` FOREIGN KEY (`referred_doctor_id`) REFERENCES `doctor_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `referrals`
--

LOCK TABLES `referrals` WRITE;
/*!40000 ALTER TABLE `referrals` DISABLE KEYS */;
INSERT INTO `referrals` VALUES ('52ad7849-f581-4db0-9bdd-089db48c65cf','ten-0001','pp-001','dp-001','dp-002',NULL,'Cardiology consultation',NULL,'routine','accepted','2026-06-12 20:15:16','2026-06-12 20:15:16'),('7355882b-d904-4c86-aab6-79ab310d6bb9','ten-0001','pp-001','dp-001','dp-002',NULL,'Cardiac evaluation',NULL,'urgent','completed','2026-06-12 20:24:34','2026-06-12 20:24:34'),('87f4e47a-3499-479a-a427-5fd4eb47826b','ten-0001','pp-008','dp-001','dp-003',NULL,'testing',NULL,'routine','pending','2026-06-13 13:47:21','2026-06-13 13:47:21'),('ref-001','ten-0001','pp-003','dp-001','dp-002','apt-004','Patient presenting with recurrent chest tightness and history of smoking. Requires comprehensive cardiac evaluation.','Please assess for CAD. Patient is on Metoprolol and Atorvastatin. ECG attached.','urgent','accepted','2026-06-12 19:16:36','2026-06-12 19:16:36'),('ref-002','ten-0001','pp-001','dp-001','dp-004','apt-004','Patient has chronic bilateral knee pain consistent with osteoarthritis. Conservative management has been insufficient.','Please evaluate for potential TKR candidacy. Imaging reports attached.','routine','accepted','2026-06-12 19:16:36','2026-06-13 13:47:04'),('ref-003','ten-0001','pp-007','dp-002','dp-001','apt-012','Cardiac workup complete. Patient stable. Returning to primary care for ongoing diabetes and BP management.','Recommend continuing current cardiac medications. Recheck in 6 months.','routine','accepted','2026-06-12 19:16:36','2026-06-12 19:16:36'),('ref-004','ten-0002','pp-004','dp-003','dp-004',NULL,'Adolescent patient with knee pain during sports activity. Rule out meniscal injury.','No prior imaging available. Please arrange X-ray and MRI as clinically indicated.','routine','pending','2026-06-12 19:16:36','2026-06-12 19:16:36');
/*!40000 ALTER TABLE `referrals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schema_migrations`
--

DROP TABLE IF EXISTS `schema_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schema_migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `applied_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `filename` (`filename`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schema_migrations`
--

LOCK TABLES `schema_migrations` WRITE;
/*!40000 ALTER TABLE `schema_migrations` DISABLE KEYS */;
INSERT INTO `schema_migrations` VALUES (1,'000_create_migrations_table.sql','2026-06-13 19:58:17'),(2,'001_add_clinic_admin_role.sql','2026-06-13 19:58:17'),(4,'002_reports_make_file_columns_nullable.sql','2026-06-13 19:58:17'),(6,'003_drop_prescription_pdf_url.sql','2026-06-13 19:59:25');
/*!40000 ALTER TABLE `schema_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'Canada',
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `settings` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES ('12bca4a8-8cf2-4eb1-970b-1b1d0248651f','Test Clinic','test-clinic-1002',NULL,'999 Test Ave','Toronto','ON','Canada','+1-416-000-0000','test1002@clinic.com',1,NULL,'2026-06-12 20:13:13','2026-06-12 20:13:13'),('62791723-7f68-4370-9b97-0fd57ca98e78','Clinic46270Updated','clinic-46270',NULL,'1 Main','Toronto','ON','Canada','+1-416-000-0001','c46270@test.com',0,NULL,'2026-06-12 20:24:26','2026-06-12 20:24:26'),('b63e9088-93a4-400b-84e0-c4375006be9f','The Holy Clinic','holy-clinic',NULL,'25, main street, blvd block, new york','New York','New York','Canada','96412563462','reach@holyclinic.com',1,NULL,'2026-06-13 19:03:22','2026-06-13 19:03:22'),('cfd73ad0-93a0-44bc-a88d-30ffaf953de7','itech clinic','my-hospital',NULL,'','New Jersey','New Jersey','Canada','+148-51841562','itechclinic@itechnolabs.tech',0,NULL,'2026-06-13 19:10:00','2026-06-13 19:29:32'),('ten-0001','HealthFirst Clinic','healthfirst',NULL,'123 Medical Drive','Toronto','Ontario','Canada','+1-416-555-0100','info@healthfirst.ca',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('ten-0002','CarePoint Medical','carepoint',NULL,'456 Wellness Blvd','Vancouver','British Columbia','Canada','+1-604-555-0200','info@carepoint.ca',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36'),('ten-0003','Sunrise Health Centre','sunrise',NULL,'789 Sunrise Ave Suite 2','Calgary','Alberta','Canada','+1-403-555-0300','admin@sunrisehealth.ca',1,NULL,'2026-06-12 19:16:36','2026-06-12 19:16:36');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) DEFAULT NULL,
  `role` enum('super_admin','clinic_admin','doctor','patient','pharmacy') NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_role` (`role`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_users_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('22c449ed-5d84-4ea0-a4c3-f063c673c391','ten-0001','patient','test.patient@email.com','$2b$12$4zqEedQuCCFnIX1GKu/X8OvpxQoS2rY7OJW3scGD0LAs3cUcIGDjq','Test','Patient','+1-416-555-9999','1990-01-01','male',NULL,1,1,NULL,'2026-06-12 20:01:14','2026-06-12 20:01:14'),('35659750-c1cf-405b-96cf-1f64fab79427','ten-0001','doctor','dr.test46270@clinic.com','$2b$12$gsYy9vUrdvuw3zqppCWeEuQDXZpsv7vXi4vddT7Lu1zkIimgms9M2','Test','Doctor',NULL,NULL,NULL,NULL,1,1,NULL,'2026-06-12 20:24:26','2026-06-13 18:33:58'),('5bf98ea1-ff17-40fb-991d-b63f61bfed84','b63e9088-93a4-400b-84e0-c4375006be9f','clinic_admin','kendrik@holyclinic.con','$2b$12$CnpJDNSgRAroaoRb5Of5VeHTx8ML52HA7Gl14Xf.Q4bmqaqg1wCiy','kendrik','jr',NULL,NULL,NULL,NULL,1,1,NULL,'2026-06-13 19:03:22','2026-06-13 19:03:22'),('6cebe115-9e25-4dd5-86a4-491689b6e5d2','ten-0001','patient','newtest1002@email.com','$2b$12$XJau3h2jnCh9JluMbWEC7eIxZcpYzJKUU4VQoBcSWFkvSarqzcsz2','New','TestPatient','+1-416-555-0000','1995-05-15','female',NULL,1,1,NULL,'2026-06-12 20:13:13','2026-06-12 20:13:13'),('6edbadb9-e58c-4222-bf96-e63b3d3479ed','cfd73ad0-93a0-44bc-a88d-30ffaf953de7','doctor','julie@yopmail.com','$2b$12$SpgDbTFs5vQk861exKH7IeIF/KqeBAgDArYkcmEh4GvZkdoOLMuk.','julie','will',NULL,NULL,NULL,NULL,1,1,'2026-06-13 19:15:47','2026-06-13 19:13:16','2026-06-13 19:15:47'),('80d190e4-ff00-407a-a184-4364f9f874a4','cfd73ad0-93a0-44bc-a88d-30ffaf953de7','clinic_admin','adam@itechnolabs.tech','$2b$12$/5qwC3lBFb7HW3h1.nr7LuEQbyh7WaKJUPmcS9A7z0tJMU2ltFVAC','Adam','Smith',NULL,NULL,NULL,NULL,1,1,'2026-06-13 19:31:28','2026-06-13 19:10:00','2026-06-13 19:31:28'),('a74307a9-aa89-4936-94f1-9df3f0fa30a8','ten-0001','patient','pt46270@test.com','$2b$12$4ppgdw5LQflnMU2sHqa6TeecQ4udsskCgijVjRRxV3yOvodKP0l02','Added','Patient',NULL,NULL,'male',NULL,1,1,NULL,'2026-06-12 20:24:27','2026-06-12 20:24:27'),('bc11f665-dfaf-45d2-b291-e55bdc166543','ten-0001','pharmacy','rx46270@test.com','$2b$12$dRVocOcoAwCxLvvKguMRte6D8PsQIGgjhhBUuCSKi/wchUn7Va3ie','Test','Pharmacy',NULL,NULL,NULL,NULL,1,1,NULL,'2026-06-12 20:24:26','2026-06-12 20:24:26'),('c44c782e-fdaf-425b-acce-9ff4f809b47f','cfd73ad0-93a0-44bc-a88d-30ffaf953de7','pharmacy','itechpharma@itechnolabs.tech','$2b$12$PrHoGh4WJhoqmBIvnJVKSOj9PxleMbHBHIo.JmRnu9eNQw.0N5laW','itech','pharma',NULL,NULL,NULL,NULL,1,1,NULL,'2026-06-13 19:15:14','2026-06-13 19:15:14'),('cc44525d-b792-4882-8867-5f1ae7c7af05','ten-0001','patient','william@yopmail.com','$2b$12$jNAwrfriCMWGHMw6pXMua.1/tQAFnJwbbZhH./0id/1vjYmyzXhau','William','Host','+19571524200',NULL,'female',NULL,1,1,'2026-06-13 19:30:14','2026-06-13 18:46:54','2026-06-13 19:30:14'),('clinic-admin-demo','ten-0001','clinic_admin','admin@healthfirst.ca','$2b$12$lR9sZxPHFAcBqkTircj95uz8KZns22W1or/BFV10tR3.v8tFcOdsW','Health','Admin',NULL,NULL,NULL,NULL,1,1,'2026-06-13 19:59:42','2026-06-13 18:36:45','2026-06-13 19:59:42'),('ec2b8f5c-6959-4b1a-85d4-f554fcdd2e46','ten-0001','doctor','justin@myclinic.com','$2b$12$aNcwxyfkKifAJHOaaB3SuuvTLlfGdb8OeGgBCcP82.NRpzxAgN6Re','justin','luther',NULL,NULL,NULL,NULL,1,1,'2026-06-13 19:28:02','2026-06-13 18:44:01','2026-06-13 19:28:02'),('f8a94dca-f5fa-4d06-a08b-0ceb2ffac646','ten-0001','patient','luna@yopmail.com','$2b$12$urZ0y9jkdvtZWpqXXBgs.eEKV6kbnZJboEA8dHqDYjt46KRvB/yCy','Luna','Luna','+1 54485255895','2011-10-18','male',NULL,1,1,NULL,'2026-06-12 20:00:08','2026-06-12 20:00:08'),('usr-dr-001','ten-0001','doctor','dr.sarah.johnson@healthfirst.ca','$2b$12$Lc0pDN2SUunNIHAbvM37A.JckaJQ98.GCWFLHbTyhXDmbnMp6nxSO','Sarah','Johnson','+1-416-555-1001','1982-04-15','female',NULL,1,1,'2026-06-13 18:35:56','2026-06-12 19:16:36','2026-06-13 18:35:56'),('usr-dr-002','ten-0001','doctor','dr.michael.chen@healthfirst.ca','$2b$12$Lc0pDN2SUunNIHAbvM37A.JckaJQ98.GCWFLHbTyhXDmbnMp6nxSO','Michael','Chen','+1-416-555-1002','1978-09-22','male',NULL,1,1,'2026-06-12 20:24:25','2026-06-12 19:16:36','2026-06-12 20:24:25'),('usr-dr-003','ten-0002','doctor','dr.priya.patel@carepoint.ca','$2b$12$Lc0pDN2SUunNIHAbvM37A.JckaJQ98.GCWFLHbTyhXDmbnMp6nxSO','Priya','Patel','+1-604-555-1003','1985-12-03','female',NULL,1,1,NULL,'2026-06-12 19:16:36','2026-06-12 19:36:52'),('usr-dr-004','ten-0002','doctor','dr.james.wilson@carepoint.ca','$2b$12$Lc0pDN2SUunNIHAbvM37A.JckaJQ98.GCWFLHbTyhXDmbnMp6nxSO','James','Wilson','+1-604-555-1004','1975-06-18','male',NULL,1,1,NULL,'2026-06-12 19:16:36','2026-06-12 19:36:52'),('usr-dr-005','ten-0003','doctor','dr.emily.rodriguez@sunrisehealth.ca','$2b$12$Lc0pDN2SUunNIHAbvM37A.JckaJQ98.GCWFLHbTyhXDmbnMp6nxSO','Emily','Rodriguez','+1-403-555-1005','1988-02-27','female',NULL,1,1,NULL,'2026-06-12 19:16:36','2026-06-12 19:36:52'),('usr-ph-001','ten-0001','pharmacy','pharmacy@healthfirst.ca','$2b$12$N50As9eAmjwBEa0Nsaiu1uNFzhbB/aj5YEwKrDm4KY6XHg8Hgn3TK','MedPlus','Pharmacy','+1-416-555-3001',NULL,NULL,NULL,1,1,'2026-06-13 19:47:12','2026-06-12 19:16:36','2026-06-13 19:47:12'),('usr-ph-002','ten-0002','pharmacy','rx@carepoint.ca','$2b$12$N50As9eAmjwBEa0Nsaiu1uNFzhbB/aj5YEwKrDm4KY6XHg8Hgn3TK','CarePoint','Dispensary','+1-604-555-3002',NULL,NULL,NULL,1,1,NULL,'2026-06-12 19:16:36','2026-06-12 19:36:52'),('usr-pt-001','ten-0001','patient','john.doe@email.com','$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy','John','Doe','+1-416-555-2001','1990-03-14','male',NULL,1,1,'2026-06-12 20:24:26','2026-06-12 19:16:36','2026-06-12 20:24:26'),('usr-pt-002','ten-0001','patient','alice.smith@email.com','$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy','Alice','Smith','+1-416-555-2002','1985-07-21','female',NULL,1,1,'2026-06-12 20:24:26','2026-06-12 19:16:36','2026-06-12 20:24:26'),('usr-pt-003','ten-0001','patient','robert.brown@email.com','$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy','Robert','Brown','+1-416-555-2003','1965-11-08','male',NULL,1,1,NULL,'2026-06-12 19:16:36','2026-06-12 19:36:52'),('usr-pt-004','ten-0002','patient','emily.davis@email.com','$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy','Emily','Davis','+1-604-555-2004','1995-01-30','female',NULL,1,1,NULL,'2026-06-12 19:16:36','2026-06-12 19:36:52'),('usr-pt-005','ten-0002','patient','william.garcia@email.com','$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy','William','Garcia','+1-604-555-2005','1978-05-19','male',NULL,1,1,NULL,'2026-06-12 19:16:36','2026-06-12 20:13:13'),('usr-pt-006','ten-0003','patient','sophia.martinez@email.com','$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy','Sophia','Martinez','+1-403-555-2006','2000-08-12','female',NULL,1,1,NULL,'2026-06-12 19:16:36','2026-06-12 19:36:52'),('usr-pt-007','ten-0001','patient','david.lee@email.com','$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy','David','Lee','+1-416-555-2007','1972-12-25','male',NULL,1,1,NULL,'2026-06-12 19:16:36','2026-06-12 19:36:52'),('usr-pt-008','ten-0001','patient','olivia.taylor@email.com','$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy','Olivia','Taylor','+1-416-555-2008','1998-04-03','female',NULL,1,1,NULL,'2026-06-12 19:16:36','2026-06-12 20:24:26'),('usr-sa-001',NULL,'super_admin','admin@doctorsaas.com','$2b$12$xic.GvkoEahekcZ.261g/.RDhVNoJupzolMZ28DwgQMHUKDfp9EeG','Super','Admin','+1-000-000-0000',NULL,NULL,NULL,1,1,'2026-06-13 19:59:09','2026-06-12 19:16:36','2026-06-13 19:59:09');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'doctor_saas'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-13 20:03:05
