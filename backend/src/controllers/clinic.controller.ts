import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';
import { generateId, paginate, buildPaginationMeta } from '../utils/helpers';

function getTenantId(req: AuthRequest): string {
  if (!req.user?.tenantId) throw createError('Clinic admin has no associated clinic', 403);
  return req.user.tenantId;
}

// ── DASHBOARD ────────────────────────────────────────────────────

export async function getClinicDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = getTenantId(req);

    const [doctors, pharmacies, patients, appointments, prescriptions] = await Promise.all([
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM users u JOIN doctor_profiles dp ON dp.user_id=u.id WHERE dp.tenant_id=? AND u.is_active=1`, [tenantId]),
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM users u JOIN pharmacy_profiles ph ON ph.user_id=u.id WHERE ph.tenant_id=? AND u.is_active=1`, [tenantId]),
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM users u JOIN patient_profiles pp ON pp.user_id=u.id WHERE pp.tenant_id=? AND u.is_active=1`, [tenantId]),
      query<Array<{ total: number; status: string }>>(`SELECT status, COUNT(*) AS total FROM appointments WHERE tenant_id=? GROUP BY status`, [tenantId]),
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM prescriptions WHERE tenant_id=? AND status='active'`, [tenantId]),
    ]);

    res.json({
      success: true,
      message: 'Dashboard data fetched',
      data: {
        counts: {
          doctors:       doctors[0].total,
          pharmacies:    pharmacies[0].total,
          patients:      patients[0].total,
          prescriptions: prescriptions[0].total,
        },
        appointments,
      },
    });
  } catch (err) { next(err); }
}

// ── DOCTORS ──────────────────────────────────────────────────────

export async function getClinicDoctors(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { page = '1', limit = '10', search = '' } = req.query as Record<string, string>;
    const { offset, limit: lim, page: pg } = paginate(+page, +limit);
    const like = `%${search}%`;

    const [rows, countRows] = await Promise.all([
      query<unknown[]>(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
                dp.id AS profile_id, dp.specialization, dp.qualification,
                dp.license_number, dp.experience_years, dp.consultation_fee, dp.is_available
         FROM users u
         JOIN doctor_profiles dp ON dp.user_id = u.id
         WHERE dp.tenant_id = ? AND (u.first_name LIKE ? OR u.last_name LIKE ? OR dp.specialization LIKE ?)
         ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
        [tenantId, like, like, like, lim, offset]
      ),
      query<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total FROM users u JOIN doctor_profiles dp ON dp.user_id=u.id
         WHERE dp.tenant_id=? AND (u.first_name LIKE ? OR u.last_name LIKE ? OR dp.specialization LIKE ?)`,
        [tenantId, like, like, like]
      ),
    ]);

    res.json({ success: true, message: 'Doctors fetched', data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) });
  } catch (err) { next(err); }
}

export async function createClinicDoctor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { email, password, firstName, lastName, phone, specialization, qualification, licenseNumber, experienceYears, consultationFee, bio } = req.body;

    const existing = await query<unknown[]>(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existing.length) throw createError('Email already registered', 409);

    const hash   = await bcrypt.hash(password || 'Doctor@123', 12);
    const userId = generateId();
    await query(
      `INSERT INTO users (id, tenant_id, role, email, password_hash, first_name, last_name, phone, is_verified)
       VALUES (?,?,'doctor',?,?,?,?,?,1)`,
      [userId, tenantId, email, hash, firstName, lastName, phone || null]
    );

    const profileId = generateId();
    await query(
      `INSERT INTO doctor_profiles (id, user_id, tenant_id, specialization, qualification, license_number, experience_years, consultation_fee, bio)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [profileId, userId, tenantId, specialization, qualification || null, licenseNumber || null, experienceYears || 0, consultationFee || 0, bio || null]
    );

    res.status(201).json({ success: true, message: 'Doctor created', data: { userId, profileId, email, firstName, lastName } });
  } catch (err) { next(err); }
}

export async function updateClinicDoctor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { id }   = req.params;
    const { firstName, lastName, phone, specialization, qualification, licenseNumber, experienceYears, consultationFee, bio, isActive } = req.body;

    // Verify doctor belongs to this clinic
    const dp = await query<unknown[]>(`SELECT dp.id FROM doctor_profiles dp JOIN users u ON u.id=dp.user_id WHERE u.id=? AND dp.tenant_id=?`, [id, tenantId]);
    if (!dp.length) throw createError('Doctor not found in your clinic', 404);

    await query(`UPDATE users SET first_name=COALESCE(?,first_name), last_name=COALESCE(?,last_name), phone=COALESCE(?,phone), is_active=COALESCE(?,is_active) WHERE id=?`,
      [firstName || null, lastName || null, phone || null, isActive ?? null, id]);
    await query(`UPDATE doctor_profiles SET specialization=COALESCE(?,specialization), qualification=COALESCE(?,qualification), license_number=COALESCE(?,license_number), experience_years=COALESCE(?,experience_years), consultation_fee=COALESCE(?,consultation_fee), bio=COALESCE(?,bio) WHERE user_id=?`,
      [specialization || null, qualification || null, licenseNumber || null, experienceYears ?? null, consultationFee ?? null, bio || null, id]);

    res.json({ success: true, message: 'Doctor updated' });
  } catch (err) { next(err); }
}

export async function deleteClinicDoctor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { id }   = req.params;

    const dp = await query<unknown[]>(`SELECT dp.id FROM doctor_profiles dp WHERE dp.user_id=? AND dp.tenant_id=?`, [id, tenantId]);
    if (!dp.length) throw createError('Doctor not found in your clinic', 404);

    await query(`UPDATE users SET is_active=0 WHERE id=?`, [id]);
    res.json({ success: true, message: 'Doctor deactivated' });
  } catch (err) { next(err); }
}

// ── PHARMACIES ───────────────────────────────────────────────────

export async function getClinicPharmacies(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { page = '1', limit = '10', search = '' } = req.query as Record<string, string>;
    const { offset, limit: lim, page: pg } = paginate(+page, +limit);
    const like = `%${search}%`;

    const [rows, countRows] = await Promise.all([
      query<unknown[]>(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
                ph.id AS profile_id, ph.pharmacy_name, ph.license_number, ph.address
         FROM users u
         JOIN pharmacy_profiles ph ON ph.user_id = u.id
         WHERE ph.tenant_id = ? AND (ph.pharmacy_name LIKE ? OR u.email LIKE ?)
         ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
        [tenantId, like, like, lim, offset]
      ),
      query<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total FROM users u JOIN pharmacy_profiles ph ON ph.user_id=u.id
         WHERE ph.tenant_id=? AND (ph.pharmacy_name LIKE ? OR u.email LIKE ?)`,
        [tenantId, like, like]
      ),
    ]);

    res.json({ success: true, message: 'Pharmacies fetched', data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) });
  } catch (err) { next(err); }
}

export async function createClinicPharmacy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { email, password, firstName, lastName, phone, pharmacyName, licenseNumber, address } = req.body;

    const existing = await query<unknown[]>(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existing.length) throw createError('Email already registered', 409);

    const hash   = await bcrypt.hash(password || 'Pharma@123', 12);
    const userId = generateId();
    await query(
      `INSERT INTO users (id, tenant_id, role, email, password_hash, first_name, last_name, phone, is_verified)
       VALUES (?,?,'pharmacy',?,?,?,?,?,1)`,
      [userId, tenantId, email, hash, firstName, lastName, phone || null]
    );

    const profileId = generateId();
    await query(
      `INSERT INTO pharmacy_profiles (id, user_id, tenant_id, pharmacy_name, license_number, address)
       VALUES (?,?,?,?,?,?)`,
      [profileId, userId, tenantId, pharmacyName, licenseNumber || null, address || null]
    );

    res.status(201).json({ success: true, message: 'Pharmacy created', data: { userId, profileId, email, pharmacyName } });
  } catch (err) { next(err); }
}

export async function deleteClinicPharmacy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { id }   = req.params;

    const ph = await query<unknown[]>(`SELECT ph.id FROM pharmacy_profiles ph WHERE ph.user_id=? AND ph.tenant_id=?`, [id, tenantId]);
    if (!ph.length) throw createError('Pharmacy not found in your clinic', 404);

    await query(`UPDATE users SET is_active=0 WHERE id=?`, [id]);
    res.json({ success: true, message: 'Pharmacy deactivated' });
  } catch (err) { next(err); }
}

// ── PATIENTS (read-only) ─────────────────────────────────────────

export async function getClinicPatients(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { page = '1', limit = '10', search = '' } = req.query as Record<string, string>;
    const { offset, limit: lim, page: pg } = paginate(+page, +limit);
    const like = `%${search}%`;

    const [rows, countRows] = await Promise.all([
      query<unknown[]>(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.gender, u.is_active,
                pp.id AS profile_id, pp.address
         FROM users u
         JOIN patient_profiles pp ON pp.user_id = u.id
         WHERE pp.tenant_id = ? AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)
         ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
        [tenantId, like, like, like, lim, offset]
      ),
      query<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total FROM users u JOIN patient_profiles pp ON pp.user_id=u.id
         WHERE pp.tenant_id=? AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`,
        [tenantId, like, like, like]
      ),
    ]);

    res.json({ success: true, message: 'Patients fetched', data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) });
  } catch (err) { next(err); }
}
