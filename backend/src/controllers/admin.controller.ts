import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';
import { generateId, paginate, buildPaginationMeta } from '../utils/helpers';

// ---- TENANTS ----

export async function getTenants(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '10', search = '' } = req.query as Record<string, string>;
    const { offset, limit: lim, page: pg } = paginate(+page, +limit);

    const like = `%${search}%`;
    const [rows, countRows] = await Promise.all([
      query<unknown[]>(
        `SELECT * FROM tenants WHERE (name LIKE ? OR slug LIKE ?) ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [like, like, lim, offset]
      ),
      query<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total FROM tenants WHERE name LIKE ? OR slug LIKE ?`,
        [like, like]
      ),
    ]);

    res.json({ success: true, message: 'Tenants fetched', data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) });
  } catch (err) { next(err); }
}

export async function createTenant(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, slug, address, city, state, country, phone, email,
            adminEmail, adminPassword, adminFirstName, adminLastName } = req.body;

    if (!adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
      throw createError('Clinic admin credentials (adminEmail, adminPassword, adminFirstName, adminLastName) are required', 400);
    }

    const existing = await query<unknown[]>(`SELECT id FROM tenants WHERE slug = ?`, [slug]);
    if (existing.length) throw createError('Slug already in use', 409);

    const adminExists = await query<unknown[]>(`SELECT id FROM users WHERE email = ?`, [adminEmail]);
    if (adminExists.length) throw createError('Admin email already registered', 409);

    const tenantId = generateId();
    await query(
      `INSERT INTO tenants (id, name, slug, address, city, state, country, phone, email) VALUES (?,?,?,?,?,?,?,?,?)`,
      [tenantId, name, slug, address, city, state, country || 'Canada', phone, email]
    );

    const hash   = await bcrypt.hash(adminPassword, 12);
    const userId = generateId();
    await query(
      `INSERT INTO users (id, tenant_id, role, email, password_hash, first_name, last_name, is_verified)
       VALUES (?,?,'clinic_admin',?,?,?,?,1)`,
      [userId, tenantId, adminEmail, hash, adminFirstName, adminLastName]
    );

    const tenant = await query<unknown[]>(`SELECT * FROM tenants WHERE id = ?`, [tenantId]);
    res.status(201).json({
      success: true,
      message: 'Clinic created with admin account',
      data: {
        clinic: tenant[0],
        admin: { email: adminEmail, firstName: adminFirstName, lastName: adminLastName, userId },
      },
    });
  } catch (err) { next(err); }
}

export async function updateTenant(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { name, address, city, state, country, phone, email, isActive } = req.body;

    await query(
      `UPDATE tenants SET name=?, address=?, city=?, state=?, country=?, phone=?, email=?, is_active=? WHERE id=?`,
      [name, address, city, state, country, phone, email, isActive ?? 1, id]
    );

    const rows = await query<unknown[]>(`SELECT * FROM tenants WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Clinic updated', data: rows[0] });
  } catch (err) { next(err); }
}

export async function deleteTenant(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await query(`UPDATE tenants SET is_active = 0 WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Clinic deactivated' });
  } catch (err) { next(err); }
}

// ---- DOCTORS ----

export async function getDoctors(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '10', search = '', tenantId } = req.query as Record<string, string>;
    const { offset, limit: lim, page: pg } = paginate(+page, +limit);

    const like = `%${search}%`;
    const tenantFilter = tenantId ? 'AND dp.tenant_id = ?' : '';
    const params: unknown[] = [like, like, like];
    if (tenantId) params.push(tenantId);
    params.push(lim, offset);

    const [rows, countRows] = await Promise.all([
      query<unknown[]>(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
                dp.id AS profile_id, dp.specialization, dp.qualification, dp.license_number,
                dp.experience_years, dp.consultation_fee, dp.is_available, dp.tenant_id,
                t.name AS clinic_name
         FROM users u
         JOIN doctor_profiles dp ON dp.user_id = u.id
         LEFT JOIN tenants t ON t.id = dp.tenant_id
         WHERE u.role = 'doctor'
           AND (u.first_name LIKE ? OR u.last_name LIKE ? OR dp.specialization LIKE ?)
           ${tenantFilter}
         ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
        params
      ),
      query<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total FROM users u JOIN doctor_profiles dp ON dp.user_id = u.id
         WHERE u.role='doctor' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR dp.specialization LIKE ?)
         ${tenantFilter}`,
        tenantId ? [like, like, like, tenantId] : [like, like, like]
      ),
    ]);

    res.json({ success: true, message: 'Doctors fetched', data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) });
  } catch (err) { next(err); }
}

export async function createDoctor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, firstName, lastName, phone, tenantId, specialization, qualification, licenseNumber, experienceYears, consultationFee, bio } = req.body;

    const existing = await query<unknown[]>(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existing.length) throw createError('Email already registered', 409);

    const hash   = await bcrypt.hash(password || 'Doctor@123', 12);
    const userId = generateId();
    await query(
      `INSERT INTO users (id, tenant_id, role, email, password_hash, first_name, last_name, phone, is_verified)
       VALUES (?,?,  'doctor',?,?,?,?,?,1)`,
      [userId, tenantId, email, hash, firstName, lastName, phone || null]
    );

    const profileId = generateId();
    await query(
      `INSERT INTO doctor_profiles (id, user_id, tenant_id, specialization, qualification, license_number, experience_years, consultation_fee, bio)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [profileId, userId, tenantId, specialization, qualification || null, licenseNumber || null, experienceYears || 0, consultationFee || 0, bio || null]
    );

    res.status(201).json({ success: true, message: 'Doctor created', data: { userId, profileId } });
  } catch (err) { next(err); }
}

// ---- PATIENTS ----

export async function getPatients(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '10', search = '', tenantId } = req.query as Record<string, string>;
    const { offset, limit: lim, page: pg } = paginate(+page, +limit);

    const like = `%${search}%`;
    const tenantFilter = tenantId ? 'AND pp.tenant_id = ?' : '';
    const params: unknown[] = [like, like, like];
    if (tenantId) params.push(tenantId);
    params.push(lim, offset);

    const [rows, countRows] = await Promise.all([
      query<unknown[]>(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.date_of_birth, u.gender, u.is_active,
                pp.id AS profile_id, pp.blood_group, pp.address, pp.tenant_id,
                t.name AS clinic_name
         FROM users u
         JOIN patient_profiles pp ON pp.user_id = u.id
         LEFT JOIN tenants t ON t.id = pp.tenant_id
         WHERE u.role = 'patient'
           AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)
           ${tenantFilter}
         ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
        params
      ),
      query<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total FROM users u JOIN patient_profiles pp ON pp.user_id = u.id
         WHERE u.role='patient' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)
         ${tenantFilter}`,
        tenantId ? [like, like, like, tenantId] : [like, like, like]
      ),
    ]);

    res.json({ success: true, message: 'Patients fetched', data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) });
  } catch (err) { next(err); }
}

// ---- PHARMACIES ----

export async function getPharmacies(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '10', search = '' } = req.query as Record<string, string>;
    const { offset, limit: lim, page: pg } = paginate(+page, +limit);

    const like = `%${search}%`;
    const [rows, countRows] = await Promise.all([
      query<unknown[]>(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
                ph.id AS profile_id, ph.pharmacy_name, ph.license_number, ph.address
         FROM users u
         JOIN pharmacy_profiles ph ON ph.user_id = u.id
         WHERE u.role = 'pharmacy' AND (ph.pharmacy_name LIKE ? OR u.email LIKE ?)
         ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
        [like, like, lim, offset]
      ),
      query<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total FROM users u JOIN pharmacy_profiles ph ON ph.user_id = u.id
         WHERE u.role='pharmacy' AND (ph.pharmacy_name LIKE ? OR u.email LIKE ?)`,
        [like, like]
      ),
    ]);

    res.json({ success: true, message: 'Pharmacies fetched', data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) });
  } catch (err) { next(err); }
}

export async function createPharmacy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, firstName, lastName, phone, tenantId, pharmacyName, licenseNumber, address } = req.body;

    const existing = await query<unknown[]>(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existing.length) throw createError('Email already registered', 409);

    const hash   = await bcrypt.hash(password || 'Pharma@123', 12);
    const userId = generateId();
    await query(
      `INSERT INTO users (id, tenant_id, role, email, password_hash, first_name, last_name, phone, is_verified)
       VALUES (?,?,'pharmacy',?,?,?,?,?,1)`,
      [userId, tenantId || null, email, hash, firstName, lastName, phone || null]
    );

    const profileId = generateId();
    await query(
      `INSERT INTO pharmacy_profiles (id, user_id, tenant_id, pharmacy_name, license_number, address)
       VALUES (?,?,?,?,?,?)`,
      [profileId, userId, tenantId || null, pharmacyName, licenseNumber || null, address || null]
    );

    res.status(201).json({ success: true, message: 'Pharmacy created', data: { userId, profileId } });
  } catch (err) { next(err); }
}

// ---- ANALYTICS ----

export async function getAnalytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      tenantsCount,
      doctorsCount,
      patientsCount,
      pharmaciesCount,
      appointmentsCount,
      prescriptionsCount,
      recentAppointments,
    ] = await Promise.all([
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM tenants WHERE is_active=1`),
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM users WHERE role='doctor' AND is_active=1`),
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM users WHERE role='patient' AND is_active=1`),
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM users WHERE role='pharmacy' AND is_active=1`),
      query<Array<{ total: number; status: string }>>(
        `SELECT status, COUNT(*) AS total FROM appointments GROUP BY status`
      ),
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM prescriptions WHERE status='active'`),
      query<unknown[]>(
        `SELECT a.id, a.appointment_date, a.start_time, a.status,
                CONCAT(ud.first_name,' ',ud.last_name) AS doctor_name,
                CONCAT(up.first_name,' ',up.last_name) AS patient_name
         FROM appointments a
         JOIN doctor_profiles dp ON dp.id = a.doctor_id
         JOIN users ud ON ud.id = dp.user_id
         JOIN patient_profiles pp ON pp.id = a.patient_id
         JOIN users up ON up.id = pp.user_id
         ORDER BY a.created_at DESC LIMIT 5`
      ),
    ]);

    res.json({
      success: true,
      message: 'Analytics fetched',
      data: {
        counts: {
          clinics:       tenantsCount[0].total,
          doctors:       doctorsCount[0].total,
          patients:      patientsCount[0].total,
          pharmacies:    pharmaciesCount[0].total,
          prescriptions: prescriptionsCount[0].total,
        },
        appointments:        appointmentsCount,
        recentAppointments,
      },
    });
  } catch (err) { next(err); }
}

export async function toggleTenantStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await query(`UPDATE tenants SET is_active = NOT is_active WHERE id = ?`, [id]);
    const rows = await query<Array<{ is_active: number }>>(`SELECT is_active FROM tenants WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Clinic status updated', data: { isActive: rows[0]?.is_active } });
  } catch (err) { next(err); }
}

export async function toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await query(`UPDATE users SET is_active = NOT is_active WHERE id = ?`, [id]);
    const rows = await query<Array<{ is_active: number }>>(`SELECT is_active FROM users WHERE id = ?`, [id]);
    res.json({ success: true, message: 'User status updated', data: { isActive: rows[0]?.is_active } });
  } catch (err) { next(err); }
}
