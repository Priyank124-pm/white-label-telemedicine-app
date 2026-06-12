-- ============================================================
-- Doctor SaaS — Comprehensive Dummy Seed Data
-- ============================================================
-- Passwords (bcrypt 12 rounds):
--   Admin@123   → $2b$12$xic.GvkoEahekcZ.261g/.RDhVNoJupzolMZ28DwgQMHUKDfp9EeG
--   Doctor@123  → $2b$12$Lc0pDN2SUunNIHAbvM37A.JckaJQ98.GCWFLHbTyhXDmbnMp6nxSO
--   Patient@123 → $2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy
--   Pharma@123  → $2b$12$N50As9eAmjwBEa0Nsaiu1uNFzhbB/aj5YEwKrDm4KY6XHg8Hgn3TK
-- ============================================================

USE doctor_saas;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TRUNCATE (clean slate every time you re-run)f
-- ============================================================
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE invoice_items;
TRUNCATE TABLE invoices;
TRUNCATE TABLE dispensing_records;
TRUNCATE TABLE referrals;
TRUNCATE TABLE medical_reports;
TRUNCATE TABLE prescription_items;
TRUNCATE TABLE prescriptions;
TRUNCATE TABLE appointments;
TRUNCATE TABLE doctor_leaves;
TRUNCATE TABLE doctor_availability;
TRUNCATE TABLE medicines;
TRUNCATE TABLE pharmacy_profiles;
TRUNCATE TABLE patient_profiles;
TRUNCATE TABLE doctor_profiles;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE users;
TRUNCATE TABLE tenants;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. TENANTS (3 clinics)
-- ============================================================
INSERT INTO tenants (id, name, slug, address, city, state, country, phone, email, is_active) VALUES
('ten-0001', 'HealthFirst Clinic',   'healthfirst',   '123 Medical Drive',      'Toronto',   'Ontario',          'Canada', '+1-416-555-0100', 'info@healthfirst.ca',      1),
('ten-0002', 'CarePoint Medical',    'carepoint',     '456 Wellness Blvd',      'Vancouver', 'British Columbia',  'Canada', '+1-604-555-0200', 'info@carepoint.ca',         1),
('ten-0003', 'Sunrise Health Centre','sunrise',       '789 Sunrise Ave Suite 2','Calgary',   'Alberta',           'Canada', '+1-403-555-0300', 'admin@sunrisehealth.ca',    1);

-- ============================================================
-- 2. USERS
-- ============================================================

-- Super Admin (Admin@123)
INSERT INTO users (id, tenant_id, role, email, password_hash, first_name, last_name, phone, is_active, is_verified) VALUES
('usr-sa-001', NULL, 'super_admin', 'admin@doctorsaas.com',
 '$2b$12$xic.GvkoEahekcZ.261g/.RDhVNoJupzolMZ28DwgQMHUKDfp9EeG',
 'Super', 'Admin', '+1-000-000-0000', 1, 1);

-- Doctors (Doctor@123)
INSERT INTO users (id, tenant_id, role, email, password_hash, first_name, last_name, phone, date_of_birth, gender, is_active, is_verified) VALUES
('usr-dr-001', 'ten-0001', 'doctor', 'dr.sarah.johnson@healthfirst.ca',
 '$2b$12$Lc0pDN2SUunNIHAbvM37A.JckaJQ98.GCWFLHbTyhXDmbnMp6nxSO',
 'Sarah', 'Johnson', '+1-416-555-1001', '1982-04-15', 'female', 1, 1),

('usr-dr-002', 'ten-0001', 'doctor', 'dr.michael.chen@healthfirst.ca',
 '$2b$12$Lc0pDN2SUunNIHAbvM37A.JckaJQ98.GCWFLHbTyhXDmbnMp6nxSO',
 'Michael', 'Chen', '+1-416-555-1002', '1978-09-22', 'male', 1, 1),

('usr-dr-003', 'ten-0002', 'doctor', 'dr.priya.patel@carepoint.ca',
 '$2b$12$Lc0pDN2SUunNIHAbvM37A.JckaJQ98.GCWFLHbTyhXDmbnMp6nxSO',
 'Priya', 'Patel', '+1-604-555-1003', '1985-12-03', 'female', 1, 1),

('usr-dr-004', 'ten-0002', 'doctor', 'dr.james.wilson@carepoint.ca',
 '$2b$12$Lc0pDN2SUunNIHAbvM37A.JckaJQ98.GCWFLHbTyhXDmbnMp6nxSO',
 'James', 'Wilson', '+1-604-555-1004', '1975-06-18', 'male', 1, 1),

('usr-dr-005', 'ten-0003', 'doctor', 'dr.emily.rodriguez@sunrisehealth.ca',
 '$2b$12$Lc0pDN2SUunNIHAbvM37A.JckaJQ98.GCWFLHbTyhXDmbnMp6nxSO',
 'Emily', 'Rodriguez', '+1-403-555-1005', '1988-02-27', 'female', 1, 1);

-- Patients (Patient@123)
INSERT INTO users (id, tenant_id, role, email, password_hash, first_name, last_name, phone, date_of_birth, gender, is_active, is_verified) VALUES
('usr-pt-001', 'ten-0001', 'patient', 'john.doe@email.com',
 '$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy',
 'John', 'Doe', '+1-416-555-2001', '1990-03-14', 'male', 1, 1),

('usr-pt-002', 'ten-0001', 'patient', 'alice.smith@email.com',
 '$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy',
 'Alice', 'Smith', '+1-416-555-2002', '1985-07-21', 'female', 1, 1),

('usr-pt-003', 'ten-0001', 'patient', 'robert.brown@email.com',
 '$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy',
 'Robert', 'Brown', '+1-416-555-2003', '1965-11-08', 'male', 1, 1),

('usr-pt-004', 'ten-0002', 'patient', 'emily.davis@email.com',
 '$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy',
 'Emily', 'Davis', '+1-604-555-2004', '1995-01-30', 'female', 1, 1),

('usr-pt-005', 'ten-0002', 'patient', 'william.garcia@email.com',
 '$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy',
 'William', 'Garcia', '+1-604-555-2005', '1978-05-19', 'male', 1, 1),

('usr-pt-006', 'ten-0003', 'patient', 'sophia.martinez@email.com',
 '$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy',
 'Sophia', 'Martinez', '+1-403-555-2006', '2000-08-12', 'female', 1, 1),

('usr-pt-007', 'ten-0001', 'patient', 'david.lee@email.com',
 '$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy',
 'David', 'Lee', '+1-416-555-2007', '1972-12-25', 'male', 1, 1),

('usr-pt-008', 'ten-0001', 'patient', 'olivia.taylor@email.com',
 '$2b$12$rRbwWSjJCph8k4FBlx1Nju9kYlVhntK.d3nZVuXsiXltD7DZOC.sy',
 'Olivia', 'Taylor', '+1-416-555-2008', '1998-04-03', 'female', 1, 1);

-- Pharmacies (Pharma@123)
INSERT INTO users (id, tenant_id, role, email, password_hash, first_name, last_name, phone, is_active, is_verified) VALUES
('usr-ph-001', 'ten-0001', 'pharmacy', 'pharmacy@healthfirst.ca',
 '$2b$12$N50As9eAmjwBEa0Nsaiu1uNFzhbB/aj5YEwKrDm4KY6XHg8Hgn3TK',
 'MedPlus', 'Pharmacy', '+1-416-555-3001', 1, 1),

('usr-ph-002', 'ten-0002', 'pharmacy', 'rx@carepoint.ca',
 '$2b$12$N50As9eAmjwBEa0Nsaiu1uNFzhbB/aj5YEwKrDm4KY6XHg8Hgn3TK',
 'CarePoint', 'Dispensary', '+1-604-555-3002', 1, 1);

-- ============================================================
-- 3. DOCTOR PROFILES
-- ============================================================
INSERT INTO doctor_profiles (id, user_id, tenant_id, specialization, qualification, license_number, experience_years, consultation_fee, bio, languages, is_available) VALUES
('dp-001', 'usr-dr-001', 'ten-0001', 'Family Medicine',    'MD, CCFP',            'ON-DR-10201', 14, 150.00, 'Dr. Johnson specializes in preventive care and chronic disease management.', '["English","French"]', 1),
('dp-002', 'usr-dr-002', 'ten-0001', 'Cardiology',         'MD, FRCPC (Cardiology)','ON-DR-10202', 18, 250.00, 'Dr. Chen is a board-certified cardiologist with expertise in heart disease.', '["English","Mandarin"]', 1),
('dp-003', 'usr-dr-003', 'ten-0002', 'Pediatrics',           'MD, FRCPC (Pediatrics)','BC-DR-20301', 11, 180.00, 'Dr. Patel is passionate about child health and development.', '["English","Hindi","Gujarati"]', 1),
('dp-004', 'usr-dr-004', 'ten-0002', 'Orthopedics',        'MD, FRCSC (Ortho)',    'BC-DR-20302', 21, 300.00, 'Dr. Wilson specializes in sports injuries and joint replacement.', '["English"]', 1),
('dp-005', 'usr-dr-005', 'ten-0003', 'Dermatology',        'MD, FRCPC (Derm)',     'AB-DR-30301', 8,  200.00, 'Dr. Rodriguez focuses on skin conditions and cosmetic dermatology.', '["English","Spanish"]', 1);

-- ============================================================
-- 4. PATIENT PROFILES
-- ============================================================
INSERT INTO patient_profiles (id, user_id, tenant_id, blood_group, height_cm, weight_kg, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone, address) VALUES
('pp-001', 'usr-pt-001', 'ten-0001', 'O+',  178.0, 80.5,  '["Penicillin"]',                   '["Hypertension"]',                       'Jane Doe',      '+1-416-555-9001', '45 Queen St W, Toronto, ON'),
('pp-002', 'usr-pt-002', 'ten-0001', 'A+',  165.0, 62.0,  '[]',                               '["Type 2 Diabetes","Hypothyroidism"]',    'Bob Smith',     '+1-416-555-9002', '12 King St E, Toronto, ON'),
('pp-003', 'usr-pt-003', 'ten-0001', 'B-',  180.0, 92.0,  '["Sulfa drugs","Aspirin"]',        '["COPD","Hypertension","Heart Disease"]', 'Linda Brown',   '+1-416-555-9003', '88 Bloor St W, Toronto, ON'),
('pp-004', 'usr-pt-004', 'ten-0002', 'AB+', 170.0, 68.0,  '["Latex"]',                        '[]',                                     'Tom Davis',     '+1-604-555-9004', '200 Granville St, Vancouver, BC'),
('pp-005', 'usr-pt-005', 'ten-0002', 'O-',  175.0, 85.0,  '["Codeine"]',                      '["Asthma"]',                             'Maria Garcia',  '+1-604-555-9005', '350 Robson St, Vancouver, BC'),
('pp-006', 'usr-pt-006', 'ten-0003', 'A-',  163.0, 57.5,  '[]',                               '[]',                                     'Carlos Martinez','+1-403-555-9006','10 Centre St, Calgary, AB'),
('pp-007', 'usr-pt-007', 'ten-0001', 'B+',  172.0, 78.0,  '["NSAIDs"]',                       '["Type 2 Diabetes","Dyslipidemia"]',     'Amy Lee',       '+1-416-555-9007', '5 Sheppard Ave E, Toronto, ON'),
('pp-008', 'usr-pt-008', 'ten-0001', 'O+',  160.0, 55.0,  '[]',                               '[]',                                     'Mark Taylor',   '+1-416-555-9008', '99 College St, Toronto, ON');

-- ============================================================
-- 5. PHARMACY PROFILES
-- ============================================================
INSERT INTO pharmacy_profiles (id, user_id, tenant_id, pharmacy_name, license_number, address, operating_hours) VALUES
('pharm-001', 'usr-ph-001', 'ten-0001', 'MedPlus Pharmacy',       'ON-PH-4401', '123 Medical Drive, Toronto, ON', '{"mon":"8am-8pm","tue":"8am-8pm","wed":"8am-8pm","thu":"8am-8pm","fri":"8am-6pm","sat":"9am-5pm","sun":"Closed"}'),
('pharm-002', 'usr-ph-002', 'ten-0002', 'CarePoint Dispensary',   'BC-PH-5501', '456 Wellness Blvd, Vancouver, BC','{"mon":"9am-7pm","tue":"9am-7pm","wed":"9am-7pm","thu":"9am-7pm","fri":"9am-6pm","sat":"10am-4pm","sun":"Closed"}');

-- ============================================================
-- 6. MEDICINES (30 items)
-- ============================================================
INSERT INTO medicines (id, name, generic_name, category, form, strength, manufacturer, description, side_effects, is_active) VALUES
('med-001', 'Amoxicillin 500mg',    'Amoxicillin',         'Antibiotic',       'capsule',  '500mg',       'Apotex Inc.',         'Broad-spectrum penicillin antibiotic',        'Nausea, diarrhea, rash',                      1),
('med-002', 'Ibuprofen 400mg',      'Ibuprofen',           'Analgesic/NSAID',  'tablet',   '400mg',       'Pharmascience',       'Anti-inflammatory pain reliever',             'GI upset, headache, dizziness',               1),
('med-003', 'Paracetamol 500mg',    'Acetaminophen',       'Analgesic',        'tablet',   '500mg',       'Jamp Pharma',         'Pain reliever and fever reducer',             'Rare liver damage if overdosed',              1),
('med-004', 'Metformin 500mg',      'Metformin HCl',       'Antidiabetic',     'tablet',   '500mg',       'Mylan',               'First-line treatment for Type 2 Diabetes',   'GI upset, metallic taste, lactic acidosis',   1),
('med-005', 'Atorvastatin 20mg',    'Atorvastatin',        'Statin',           'tablet',   '20mg',        'Ranbaxy',             'Lowers LDL cholesterol',                      'Muscle pain, liver enzyme elevation',         1),
('med-006', 'Omeprazole 20mg',      'Omeprazole',          'PPI',              'capsule',  '20mg',        'AstraZeneca',         'Proton pump inhibitor for acid reflux',       'Headache, diarrhea, abdominal pain',          1),
('med-007', 'Lisinopril 10mg',      'Lisinopril',          'ACE Inhibitor',    'tablet',   '10mg',        'Teva Canada',         'ACE inhibitor for hypertension',              'Dry cough, dizziness, hyperkalemia',          1),
('med-008', 'Salbutamol Inhaler',   'Salbutamol',          'Bronchodilator',   'inhaler',  '100mcg/dose', 'GlaxoSmithKline',     'Relieves bronchospasm in asthma/COPD',        'Tremors, tachycardia, headache',              1),
('med-009', 'Cetirizine 10mg',      'Cetirizine',          'Antihistamine',    'tablet',   '10mg',        'Apotex Inc.',         'H1 antihistamine for allergies',              'Drowsiness, dry mouth',                       1),
('med-010', 'Azithromycin 250mg',   'Azithromycin',        'Antibiotic',       'tablet',   '250mg',       'Pfizer Canada',       'Macrolide antibiotic for respiratory infections','Nausea, vomiting, diarrhea',               1),
('med-011', 'Amlodipine 5mg',       'Amlodipine',          'Calcium Blocker',  'tablet',   '5mg',         'Sandoz',              'Calcium channel blocker for hypertension',    'Peripheral edema, flushing, headache',        1),
('med-012', 'Metoprolol 50mg',      'Metoprolol Tartrate', 'Beta Blocker',     'tablet',   '50mg',        'AstraZeneca',         'Beta blocker for heart conditions',           'Fatigue, bradycardia, cold extremities',      1),
('med-013', 'Levothyroxine 100mcg', 'Levothyroxine',       'Thyroid Hormone',  'tablet',   '100mcg',      'Paladin Labs',        'Thyroid hormone replacement',                 'Palpitations, weight loss, insomnia',         1),
('med-014', 'Warfarin 5mg',         'Warfarin',            'Anticoagulant',    'tablet',   '5mg',         'Jamp Pharma',         'Blood thinner to prevent clots',              'Bleeding, bruising',                          1),
('med-015', 'Prednisone 10mg',      'Prednisone',          'Corticosteroid',   'tablet',   '10mg',        'Pharmascience',       'Anti-inflammatory steroid',                   'Weight gain, insomnia, hyperglycemia',        1),
('med-016', 'Pantoprazole 40mg',    'Pantoprazole',        'PPI',              'tablet',   '40mg',        'Nycomed',             'Proton pump inhibitor',                       'Headache, diarrhea, flatulence',              1),
('med-017', 'Ramipril 5mg',         'Ramipril',            'ACE Inhibitor',    'capsule',  '5mg',         'Sanofi',              'Treats hypertension and heart failure',        'Dry cough, hypotension',                      1),
('med-018', 'Rosuvastatin 10mg',    'Rosuvastatin',        'Statin',           'tablet',   '10mg',        'AstraZeneca',         'Reduces LDL cholesterol',                     'Muscle pain, nausea',                         1),
('med-019', 'Sertraline 50mg',      'Sertraline',          'SSRI',             'tablet',   '50mg',        'Pfizer Canada',       'Antidepressant for depression/anxiety',       'Nausea, insomnia, sexual dysfunction',        1),
('med-020', 'Clonazepam 0.5mg',     'Clonazepam',          'Benzodiazepine',   'tablet',   '0.5mg',       'Hoffman La Roche',    'Treats panic disorder and seizures',          'Drowsiness, dizziness, dependence',           1),
('med-021', 'Diclofenac 50mg',      'Diclofenac Sodium',   'Analgesic/NSAID',  'tablet',   '50mg',        'Novartis',            'NSAID for pain and inflammation',             'GI upset, hypertension',                      1),
('med-022', 'Fluticasone Nasal',    'Fluticasone',         'Corticosteroid',   'drops',    '50mcg/spray', 'GlaxoSmithKline',     'Nasal spray for allergic rhinitis',           'Nosebleed, nasal irritation',                 1),
('med-023', 'Hydrochlorothiazide',  'HCTZ',                'Diuretic',         'tablet',   '25mg',        'Apotex Inc.',         'Thiazide diuretic for hypertension',          'Hypokalemia, photosensitivity',               1),
('med-024', 'Gabapentin 300mg',     'Gabapentin',          'Anticonvulsant',   'capsule',  '300mg',       'Pfizer Canada',       'Treats nerve pain and seizures',              'Dizziness, somnolence, ataxia',               1),
('med-025', 'Metronidazole 500mg',  'Metronidazole',       'Antibiotic',       'tablet',   '500mg',       'Teva Canada',         'Antiprotozoal and antibacterial agent',       'Nausea, metallic taste',                      1),
('med-026', 'Furosemide 40mg',      'Furosemide',          'Diuretic',         'tablet',   '40mg',        'Mylan',               'Loop diuretic for edema and heart failure',   'Hypokalemia, dehydration, ototoxicity',       1),
('med-027', 'Insulin Glargine',     'Insulin Glargine',    'Antidiabetic',     'injection','100 U/mL',    'Sanofi',              'Long-acting basal insulin for diabetes',      'Hypoglycemia, injection site reactions',       1),
('med-028', 'Doxycycline 100mg',    'Doxycycline Hyclate', 'Antibiotic',       'capsule',  '100mg',       'Pharmascience',       'Tetracycline antibiotic for infections',      'Photosensitivity, nausea, esophageal irritation', 1),
('med-029', 'Alendronate 70mg',     'Alendronate Sodium',  'Bisphosphonate',   'tablet',   '70mg',        'Merck Canada',        'Weekly tablet for osteoporosis',              'Esophageal irritation, jaw osteonecrosis',    1),
('med-030', 'Montelukast 10mg',     'Montelukast Sodium',  'Leukotriene',      'tablet',   '10mg',        'Merck Canada',        'Asthma and allergic rhinitis controller',     'Headache, GI upset, mood changes',            1);

-- ============================================================
-- 7. DOCTOR AVAILABILITY
-- ============================================================
-- Dr. Sarah Johnson (dp-001): Mon-Fri 9am-5pm, 30min slots
INSERT INTO doctor_availability (id, doctor_id, day_of_week, start_time, end_time, slot_duration_mins, is_active) VALUES
('da-001', 'dp-001', 1, '09:00:00', '17:00:00', 30, 1),
('da-002', 'dp-001', 2, '09:00:00', '17:00:00', 30, 1),
('da-003', 'dp-001', 3, '09:00:00', '17:00:00', 30, 1),
('da-004', 'dp-001', 4, '09:00:00', '17:00:00', 30, 1),
('da-005', 'dp-001', 5, '09:00:00', '13:00:00', 30, 1),
-- Dr. Michael Chen (dp-002): Mon/Wed/Fri 8am-4pm, 45min slots
('da-006', 'dp-002', 1, '08:00:00', '16:00:00', 45, 1),
('da-007', 'dp-002', 3, '08:00:00', '16:00:00', 45, 1),
('da-008', 'dp-002', 5, '08:00:00', '16:00:00', 45, 1),
-- Dr. Priya Patel (dp-003): Mon-Thu 9am-4pm, 30min slots
('da-009', 'dp-003', 1, '09:00:00', '16:00:00', 30, 1),
('da-010', 'dp-003', 2, '09:00:00', '16:00:00', 30, 1),
('da-011', 'dp-003', 3, '09:00:00', '16:00:00', 30, 1),
('da-012', 'dp-003', 4, '09:00:00', '16:00:00', 30, 1),
-- Dr. James Wilson (dp-004): Tue/Thu/Sat 10am-6pm, 60min slots
('da-013', 'dp-004', 2, '10:00:00', '18:00:00', 60, 1),
('da-014', 'dp-004', 4, '10:00:00', '18:00:00', 60, 1),
('da-015', 'dp-004', 6, '09:00:00', '13:00:00', 60, 1),
-- Dr. Emily Rodriguez (dp-005): Mon-Fri 10am-6pm, 30min slots
('da-016', 'dp-005', 1, '10:00:00', '18:00:00', 30, 1),
('da-017', 'dp-005', 2, '10:00:00', '18:00:00', 30, 1),
('da-018', 'dp-005', 3, '10:00:00', '18:00:00', 30, 1),
('da-019', 'dp-005', 4, '10:00:00', '18:00:00', 30, 1),
('da-020', 'dp-005', 5, '10:00:00', '15:00:00', 30, 1);

-- ============================================================
-- 8. DOCTOR LEAVES
-- ============================================================
INSERT INTO doctor_leaves (id, doctor_id, leave_date, reason) VALUES
('dl-001', 'dp-001', '2026-06-25', 'Medical conference'),
('dl-002', 'dp-001', '2026-06-26', 'Medical conference'),
('dl-003', 'dp-002', '2026-07-04', 'Public holiday'),
('dl-004', 'dp-003', '2026-06-30', 'Personal leave');

-- ============================================================
-- 9. APPOINTMENTS (mix of statuses)
-- ============================================================
INSERT INTO appointments (id, tenant_id, patient_id, doctor_id, appointment_date, start_time, end_time, status, type, reason, notes) VALUES
-- Completed past appointments
('apt-001', 'ten-0001', 'pp-001', 'dp-001', '2026-05-10', '09:00:00', '09:30:00', 'completed', 'in_person',  'Annual physical exam',           'Routine checkup completed. BP slightly elevated.'),
('apt-002', 'ten-0001', 'pp-002', 'dp-001', '2026-05-12', '10:00:00', '10:30:00', 'completed', 'in_person',  'Diabetes follow-up',             'HbA1c improved. Medication adjusted.'),
('apt-003', 'ten-0001', 'pp-003', 'dp-002', '2026-05-15', '08:00:00', '08:45:00', 'completed', 'in_person',  'Chest pain evaluation',          'ECG normal. Advised lifestyle changes.'),
('apt-004', 'ten-0001', 'pp-007', 'dp-001', '2026-05-20', '11:00:00', '11:30:00', 'completed', 'in_person',  'Knee pain',                      'Referred to orthopedics.'),
('apt-005', 'ten-0001', 'pp-008', 'dp-001', '2026-06-01', '09:30:00', '10:00:00', 'completed', 'follow_up',  'Follow-up skin rash',            'Rash resolved. No further treatment needed.'),
('apt-006', 'ten-0002', 'pp-004', 'dp-003', '2026-05-22', '09:00:00', '09:30:00', 'completed', 'in_person',  'Child vaccination',              'MMR vaccine administered.'),
('apt-007', 'ten-0002', 'pp-005', 'dp-004', '2026-05-28', '10:00:00', '11:00:00', 'completed', 'in_person',  'Right knee sports injury',       'ACL tear confirmed on MRI. Surgery planned.'),

-- Confirmed upcoming
('apt-008', 'ten-0001', 'pp-001', 'dp-002', '2026-06-18', '08:00:00', '08:45:00', 'confirmed', 'follow_up',  'Cardiology follow-up',           NULL),
('apt-009', 'ten-0001', 'pp-002', 'dp-001', '2026-06-19', '14:00:00', '14:30:00', 'confirmed', 'in_person',  'Blood test results review',      NULL),
('apt-010', 'ten-0002', 'pp-004', 'dp-004', '2026-06-20', '10:00:00', '11:00:00', 'confirmed', 'in_person',  'Shoulder pain',                  NULL),

-- Pending
('apt-011', 'ten-0001', 'pp-003', 'dp-001', '2026-06-23', '10:00:00', '10:30:00', 'pending',   'in_person',  'Breathing difficulties',         NULL),
('apt-012', 'ten-0001', 'pp-007', 'dp-002', '2026-06-25', '08:00:00', '08:45:00', 'pending',   'in_person',  'Chest tightness',                NULL),
('apt-013', 'ten-0003', 'pp-006', 'dp-005', '2026-06-24', '10:00:00', '10:30:00', 'pending',   'in_person',  'Acne treatment',                 NULL),

-- Cancelled
('apt-014', 'ten-0001', 'pp-008', 'dp-001', '2026-06-10', '09:00:00', '09:30:00', 'cancelled', 'in_person',  'General checkup',                NULL),
('apt-015', 'ten-0002', 'pp-005', 'dp-003', '2026-06-05', '11:00:00', '11:30:00', 'cancelled', 'in_person',  'Routine visit',                  NULL);

-- ============================================================
-- 10. PRESCRIPTIONS
-- ============================================================
INSERT INTO prescriptions (id, tenant_id, appointment_id, patient_id, doctor_id, prescription_no, diagnosis, notes, follow_up_date, status) VALUES
('rx-001', 'ten-0001', 'apt-001', 'pp-001', 'dp-001', 'RX-20260510-11001', 'Hypertension Stage 1',
 'Monitor BP daily. Low sodium diet recommended. Avoid excessive caffeine.', '2026-08-10', 'active'),

('rx-002', 'ten-0001', 'apt-002', 'pp-002', 'dp-001', 'RX-20260512-11002', 'Type 2 Diabetes Mellitus — Uncontrolled',
 'Check blood sugar before each meal. Increase physical activity. Reduce carbohydrate intake.', '2026-09-12', 'active'),

('rx-003', 'ten-0001', 'apt-003', 'pp-003', 'dp-002', 'RX-20260515-11003', 'Stable Angina with Dyslipidemia',
 'Avoid strenuous activity. Nitroglycerin for acute episodes. Follow cardiac diet.', '2026-08-15', 'dispensed'),

('rx-004', 'ten-0001', 'apt-004', 'pp-007', 'dp-001', 'RX-20260520-11004', 'Osteoarthritis — Left Knee',
 'Physical therapy recommended. Apply ice 20 min 3x daily. Avoid high-impact activities.', '2026-07-20', 'active'),

('rx-005', 'ten-0001', 'apt-005', 'pp-008', 'dp-001', 'RX-20260601-11005', 'Allergic Contact Dermatitis',
 'Avoid triggering allergens. Moisturize twice daily.', NULL, 'dispensed'),

('rx-006', 'ten-0002', 'apt-006', 'pp-004', 'dp-003', 'RX-20260522-11006', 'Post-vaccination care',
 'Normal to feel mild fever/soreness for 1-2 days. Paracetamol as needed.', NULL, 'dispensed'),

('rx-007', 'ten-0002', 'apt-007', 'pp-005', 'dp-004', 'RX-20260528-11007', 'ACL Tear — Right Knee',
 'Rest, ice, compression, elevation (RICE). Physiotherapy pre-surgery.', '2026-07-10', 'active');

-- ============================================================
-- 11. PRESCRIPTION ITEMS
-- ============================================================
INSERT INTO prescription_items (id, prescription_id, medicine_id, medicine_name, dosage, frequency, duration, quantity, instructions) VALUES
-- rx-001 (Hypertension)
('pi-001', 'rx-001', 'med-007', 'Lisinopril 10mg',       '10mg',  'Once daily',   '90 days', 90, 'Take in the morning with or without food'),
('pi-002', 'rx-001', 'med-011', 'Amlodipine 5mg',        '5mg',   'Once daily',   '90 days', 90, 'Take at the same time each day'),
('pi-003', 'rx-001', 'med-023', 'Hydrochlorothiazide 25mg','25mg', 'Once daily',   '90 days', 90, 'Take in the morning, avoid evening dose'),

-- rx-002 (Diabetes)
('pi-004', 'rx-002', 'med-004', 'Metformin 500mg',       '500mg', 'Twice daily',  '90 days', 180,'Take with meals to reduce GI side effects'),
('pi-005', 'rx-002', 'med-005', 'Atorvastatin 20mg',     '20mg',  'Once at night','90 days', 90, 'Take at bedtime'),
('pi-006', 'rx-002', 'med-013', 'Levothyroxine 100mcg',  '100mcg','Once daily',   '90 days', 90, 'Take 30 minutes before breakfast'),

-- rx-003 (Angina + Dyslipidemia)
('pi-007', 'rx-003', 'med-012', 'Metoprolol 50mg',       '50mg',  'Twice daily',  '60 days', 120,'Do not stop abruptly'),
('pi-008', 'rx-003', 'med-018', 'Rosuvastatin 10mg',     '10mg',  'Once at night','60 days', 60, 'Avoid grapefruit juice'),
('pi-009', 'rx-003', 'med-014', 'Warfarin 5mg',          '5mg',   'Once daily',   '60 days', 60, 'Regular INR monitoring required'),

-- rx-004 (Osteoarthritis)
('pi-010', 'rx-004', 'med-002', 'Ibuprofen 400mg',       '400mg', 'Three times daily','30 days', 90,'Take with food. Avoid if stomach upset'),
('pi-011', 'rx-004', 'med-006', 'Omeprazole 20mg',       '20mg',  'Once daily',   '30 days', 30, 'Take before breakfast to protect stomach'),

-- rx-005 (Dermatitis)
('pi-012', 'rx-005', 'med-015', 'Prednisone 10mg',       '10mg',  'Once daily (taper)','14 days',14,'Take with food. Do not stop abruptly'),
('pi-013', 'rx-005', 'med-009', 'Cetirizine 10mg',       '10mg',  'Once at night', '30 days', 30, 'May cause drowsiness'),

-- rx-006 (Post-vaccination)
('pi-014', 'rx-006', 'med-003', 'Paracetamol 500mg',     '500mg', 'Every 6 hours if needed','5 days', 20,'Only if fever or pain. Max 4g/day'),

-- rx-007 (ACL Tear)
('pi-015', 'rx-007', 'med-021', 'Diclofenac 50mg',       '50mg',  'Twice daily',  '14 days', 28, 'Take with food. Not for long-term use'),
('pi-016', 'rx-007', 'med-003', 'Paracetamol 500mg',     '500mg', 'Every 6 hours as needed','14 days',56,'Max 8 tablets per day'),
('pi-017', 'rx-007', 'med-024', 'Gabapentin 300mg',       '300mg', 'Three times daily','21 days',63,'Reduces nerve pain. Do not drive initially');

-- ============================================================
-- 12. MEDICAL REPORTS (S3 URLs are illustrative)
-- ============================================================
INSERT INTO medical_reports (id, tenant_id, patient_id, doctor_id, appointment_id, report_type, title, description, file_url, file_name, file_size, report_date) VALUES
('mr-001', 'ten-0001', 'pp-001', 'dp-001', 'apt-001', 'lab',     'Complete Blood Count & Metabolic Panel',   'CBC and comprehensive metabolic panel results', 'https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-001.pdf', 'CBC_John_Doe_20260510.pdf',       245000, '2026-05-10'),
('mr-002', 'ten-0001', 'pp-001', 'dp-001', 'apt-001', 'lab',     '24-Hour Ambulatory Blood Pressure Monitor', 'BP readings over 24 hours',                    'https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-002.pdf', 'ABPM_John_Doe_20260510.pdf',      180000, '2026-05-11'),
('mr-003', 'ten-0001', 'pp-002', 'dp-001', 'apt-002', 'lab',     'HbA1c & Lipid Panel',                      'Glycated hemoglobin and lipid profile',         'https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-003.pdf', 'HbA1c_Alice_Smith_20260512.pdf',  210000, '2026-05-12'),
('mr-004', 'ten-0001', 'pp-003', 'dp-002', 'apt-003', 'imaging', 'ECG 12-Lead',                               '12-lead electrocardiogram report',              'https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-004.pdf', 'ECG_Robert_Brown_20260515.pdf',   320000, '2026-05-15'),
('mr-005', 'ten-0001', 'pp-003', 'dp-002', 'apt-003', 'imaging', 'Chest X-Ray PA View',                       'Posteroanterior chest X-ray',                   'https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-005.jpg', 'CXR_Robert_Brown_20260515.jpg',  1500000, '2026-05-15'),
('mr-006', 'ten-0002', 'pp-005', 'dp-004', 'apt-007', 'imaging', 'Right Knee MRI',                            'MRI of right knee joint — ACL assessment',      'https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-006.pdf', 'MRI_Knee_William_20260528.pdf',  4200000, '2026-05-29'),
('mr-007', 'ten-0001', 'pp-007', 'dp-001', 'apt-004', 'lab',     'Fasting Blood Sugar & HbA1c',               'Diabetes monitoring panel',                     'https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-007.pdf', 'Diabetes_David_Lee_20260520.pdf', 195000, '2026-05-20'),
('mr-008', 'ten-0001', 'pp-008', 'dp-001', 'apt-005', 'pathology','Skin Patch Test Results',                  'Allergen patch test panel for contact dermatitis','https://doctor-saas-uploads.s3.amazonaws.com/reports/mr-008.pdf','SkinPatch_Olivia_20260601.pdf',  165000, '2026-06-01');

-- ============================================================
-- 13. REFERRALS
-- ============================================================
INSERT INTO referrals (id, tenant_id, patient_id, referring_doctor_id, referred_doctor_id, appointment_id, reason, notes, urgency, status) VALUES
-- Dr. Johnson → Dr. Chen (Cardiology) for Robert Brown
('ref-001', 'ten-0001', 'pp-003', 'dp-001', 'dp-002', 'apt-004',
 'Patient presenting with recurrent chest tightness and history of smoking. Requires comprehensive cardiac evaluation.',
 'Please assess for CAD. Patient is on Metoprolol and Atorvastatin. ECG attached.',
 'urgent', 'accepted'),

-- Dr. Johnson → Dr. Wilson (Orthopedics) for John Doe
('ref-002', 'ten-0001', 'pp-001', 'dp-001', 'dp-004', 'apt-004',
 'Patient has chronic bilateral knee pain consistent with osteoarthritis. Conservative management has been insufficient.',
 'Please evaluate for potential TKR candidacy. Imaging reports attached.',
 'routine', 'pending'),

-- Dr. Chen → Dr. Johnson for David Lee (follow-up)
('ref-003', 'ten-0001', 'pp-007', 'dp-002', 'dp-001', 'apt-012',
 'Cardiac workup complete. Patient stable. Returning to primary care for ongoing diabetes and BP management.',
 'Recommend continuing current cardiac medications. Recheck in 6 months.',
 'routine', 'accepted'),

-- Dr. Patel → Dr. Wilson for Emily Davis
('ref-004', 'ten-0002', 'pp-004', 'dp-003', 'dp-004', NULL,
 'Adolescent patient with knee pain during sports activity. Rule out meniscal injury.',
 'No prior imaging available. Please arrange X-ray and MRI as clinically indicated.',
 'routine', 'pending');

-- ============================================================
-- 14. DISPENSING RECORDS
-- ============================================================
INSERT INTO dispensing_records (id, tenant_id, prescription_id, pharmacy_id, dispensed_by, dispensed_at, notes) VALUES
('disp-001', 'ten-0001', 'rx-003', 'pharm-001', 'usr-ph-001', '2026-05-16 10:30:00', 'All 3 medications dispensed. Patient counseled on Warfarin diet.'),
('disp-002', 'ten-0001', 'rx-005', 'pharm-001', 'usr-ph-001', '2026-06-02 14:15:00', 'Prednisone taper schedule explained to patient.'),
('disp-003', 'ten-0002', 'rx-006', 'pharm-002', 'usr-ph-002', '2026-05-22 11:45:00', 'Paracetamol dispensed. Advised to return if fever persists >72h.');

-- ============================================================
-- 15. INVOICES
-- ============================================================
INSERT INTO invoices (id, tenant_id, dispensing_id, patient_id, pharmacy_id, invoice_no, subtotal, tax_percent, tax_amount, total_amount, status, notes) VALUES
('inv-001', 'ten-0001', 'disp-001', 'pp-003', 'pharm-001', 'INV-202605-30001', 145.50, 13.00, 18.92, 164.42, 'paid',   'Paid by patient via debit card'),
('inv-002', 'ten-0001', 'disp-002', 'pp-008', 'pharm-001', 'INV-202606-30002',  42.00, 13.00,  5.46,  47.46, 'issued', NULL),
('inv-003', 'ten-0002', 'disp-003', 'pp-004', 'pharm-002', 'INV-202605-30003',   8.99, 13.00,  1.17,  10.16, 'paid',   'Paid by cash');

-- ============================================================
-- 16. INVOICE ITEMS
-- ============================================================
INSERT INTO invoice_items (id, invoice_id, medicine_name, quantity, unit_price, total_price) VALUES
-- inv-001 (rx-003: Angina)
('ii-001', 'inv-001', 'Metoprolol 50mg',       120, 0.35, 42.00),
('ii-002', 'inv-001', 'Rosuvastatin 10mg',       60, 0.85, 51.00),
('ii-003', 'inv-001', 'Warfarin 5mg',            60, 0.88, 52.50),
-- inv-002 (rx-005: Dermatitis)
('ii-004', 'inv-002', 'Prednisone 10mg',         14, 1.50, 21.00),
('ii-005', 'inv-002', 'Cetirizine 10mg',         30, 0.70, 21.00),
-- inv-003 (rx-006: Post-vaccination)
('ii-006', 'inv-003', 'Paracetamol 500mg',       20, 0.45,  8.99);

-- ============================================================
-- 17. AUDIT LOGS (sample entries)
-- ============================================================
INSERT INTO audit_logs (id, user_id, tenant_id, action, entity, entity_id, ip_address) VALUES
('al-001', 'usr-dr-001', 'ten-0001', 'CREATE', 'prescription', 'rx-001', '192.168.1.10'),
('al-002', 'usr-dr-002', 'ten-0001', 'CREATE', 'prescription', 'rx-003', '192.168.1.11'),
('al-003', 'usr-ph-001', 'ten-0001', 'CREATE', 'dispensing',   'disp-001','192.168.1.20'),
('al-004', 'usr-sa-001', NULL,        'CREATE', 'tenant',       'ten-0002', '10.0.0.1'),
('al-005', 'usr-dr-001', 'ten-0001', 'CREATE', 'referral',     'ref-001', '192.168.1.10'),
('al-006', 'usr-pt-001', 'ten-0001', 'CREATE', 'appointment',  'apt-008', '203.0.113.5');

-- ============================================================
-- Done
-- ============================================================
SELECT 'Seed data inserted successfully!' AS status;

SELECT 'TENANTS'    AS entity, COUNT(*) AS count FROM tenants     UNION ALL
SELECT 'USERS',      COUNT(*) FROM users            UNION ALL
SELECT 'DOCTORS',    COUNT(*) FROM doctor_profiles  UNION ALL
SELECT 'PATIENTS',   COUNT(*) FROM patient_profiles UNION ALL
SELECT 'PHARMACIES', COUNT(*) FROM pharmacy_profiles UNION ALL
SELECT 'MEDICINES',  COUNT(*) FROM medicines         UNION ALL
SELECT 'APPOINTMENTS',COUNT(*) FROM appointments     UNION ALL
SELECT 'PRESCRIPTIONS',COUNT(*) FROM prescriptions   UNION ALL
SELECT 'RX ITEMS',   COUNT(*) FROM prescription_items UNION ALL
SELECT 'REPORTS',    COUNT(*) FROM medical_reports   UNION ALL
SELECT 'REFERRALS',  COUNT(*) FROM referrals         UNION ALL
SELECT 'DISPENSING', COUNT(*) FROM dispensing_records UNION ALL
SELECT 'INVOICES',   COUNT(*) FROM invoices          UNION ALL
SELECT 'AUDIT LOGS', COUNT(*) FROM audit_logs;
