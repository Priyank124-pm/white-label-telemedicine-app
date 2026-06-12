import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';
import { generateId, paginate, buildPaginationMeta } from '../utils/helpers';

export async function listDoctors(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search = '', specialization = '', limit = '50' } = req.query as Record<string, string>;
    const like = `%${search}%`;
    const specFilter = specialization ? 'AND dp.specialization = ?' : '';
    const params: unknown[] = [like, like, like];
    if (specialization) params.push(specialization);
    params.push(parseInt(limit));

    const rows = await query<unknown[]>(
      `SELECT dp.id AS profile_id, u.first_name, u.last_name, u.email,
              dp.specialization, dp.qualification, dp.experience_years,
              dp.consultation_fee, dp.bio, dp.is_available,
              t.name AS clinic_name, t.city, t.address AS clinic_address
       FROM doctor_profiles dp
       JOIN users u ON u.id = dp.user_id
       LEFT JOIN tenants t ON t.id = dp.tenant_id
       WHERE u.is_active = 1 AND dp.is_available = 1
         AND (u.first_name LIKE ? OR u.last_name LIKE ? OR dp.specialization LIKE ?)
         ${specFilter}
       ORDER BY dp.experience_years DESC LIMIT ?`,
      params
    );

    const specializations = await query<Array<{ specialization: string }>>(
      `SELECT DISTINCT dp.specialization FROM doctor_profiles dp
       JOIN users u ON u.id = dp.user_id WHERE u.is_active = 1 AND dp.specialization IS NOT NULL
       ORDER BY dp.specialization`
    );

    res.json({ success: true, message: 'Doctors fetched', data: rows, specializations: specializations.map((s) => s.specialization) });
  } catch (err) { next(err); }
}

export async function getDoctorProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId || req.user!.userId;
    const rows = await query<unknown[]>(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.date_of_birth, u.gender, u.avatar_url,
              dp.id AS profile_id, dp.specialization, dp.qualification, dp.license_number,
              dp.experience_years, dp.consultation_fee, dp.bio, dp.languages, dp.is_available,
              t.name AS clinic_name
       FROM users u
       JOIN doctor_profiles dp ON dp.user_id = u.id
       LEFT JOIN tenants t ON t.id = dp.tenant_id
       WHERE u.id = ?`,
      [userId]
    );
    if (!rows.length) throw createError('Doctor not found', 404);
    res.json({ success: true, message: 'Profile fetched', data: rows[0] });
  } catch (err) { next(err); }
}

export async function updateDoctorProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { firstName, lastName, phone, specialization, qualification, licenseNumber, experienceYears, consultationFee, bio, languages } = req.body;

    await query(
      `UPDATE users SET first_name=?, last_name=?, phone=? WHERE id=?`,
      [firstName, lastName, phone || null, userId]
    );
    await query(
      `UPDATE doctor_profiles SET specialization=?, qualification=?, license_number=?, experience_years=?, consultation_fee=?, bio=?, languages=? WHERE user_id=?`,
      [specialization, qualification || null, licenseNumber || null, experienceYears || 0, consultationFee || 0, bio || null, JSON.stringify(languages || []), userId]
    );

    res.json({ success: true, message: 'Profile updated' });
  } catch (err) { next(err); }
}

export async function getDoctorAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId || req.user!.userId;
    const dp = await query<Array<{ id: string }>>(`SELECT id FROM doctor_profiles WHERE user_id = ?`, [userId]);
    if (!dp.length) throw createError('Doctor profile not found', 404);

    const rows = await query<unknown[]>(
      `SELECT * FROM doctor_availability WHERE doctor_id = ? ORDER BY day_of_week, start_time`,
      [dp[0].id]
    );
    res.json({ success: true, message: 'Availability fetched', data: rows });
  } catch (err) { next(err); }
}

export async function setAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { slots } = req.body; // Array of { dayOfWeek, startTime, endTime, slotDurationMins }

    const dp = await query<Array<{ id: string }>>(`SELECT id FROM doctor_profiles WHERE user_id = ?`, [userId]);
    if (!dp.length) throw createError('Doctor profile not found', 404);
    const doctorId = dp[0].id;

    // Replace all availability
    await query(`DELETE FROM doctor_availability WHERE doctor_id = ?`, [doctorId]);

    for (const slot of slots) {
      const id = generateId();
      await query(
        `INSERT INTO doctor_availability (id, doctor_id, day_of_week, start_time, end_time, slot_duration_mins)
         VALUES (?,?,?,?,?,?)`,
        [id, doctorId, slot.dayOfWeek, slot.startTime, slot.endTime, slot.slotDurationMins || 30]
      );
    }

    res.json({ success: true, message: 'Availability updated' });
  } catch (err) { next(err); }
}

export async function addLeave(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { leaveDate, reason } = req.body;

    const dp = await query<Array<{ id: string }>>(`SELECT id FROM doctor_profiles WHERE user_id = ?`, [userId]);
    if (!dp.length) throw createError('Doctor profile not found', 404);

    const id = generateId();
    await query(`INSERT INTO doctor_leaves (id, doctor_id, leave_date, reason) VALUES (?,?,?,?)`,
      [id, dp[0].id, leaveDate, reason || null]);

    res.status(201).json({ success: true, message: 'Leave added' });
  } catch (err) { next(err); }
}

export async function deleteLeave(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id }  = req.params;

    const dp = await query<Array<{ id: string }>>(`SELECT id FROM doctor_profiles WHERE user_id = ?`, [userId]);
    if (!dp.length) throw createError('Doctor profile not found', 404);

    await query(`DELETE FROM doctor_leaves WHERE id = ? AND doctor_id = ?`, [id, dp[0].id]);
    res.json({ success: true, message: 'Leave removed' });
  } catch (err) { next(err); }
}

export async function getDoctorPatients(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '10', search = '' } = req.query as Record<string, string>;
    const { offset, limit: lim, page: pg } = paginate(+page, +limit);
    const like = `%${search}%`;

    const dp = await query<Array<{ id: string; tenant_id: string }>>(`SELECT id, tenant_id FROM doctor_profiles WHERE user_id = ?`, [userId]);
    if (!dp.length) throw createError('Doctor profile not found', 404);
    const { id: doctorId, tenant_id: tenantId } = dp[0];

    const [rows, countRows] = await Promise.all([
      query<unknown[]>(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.date_of_birth, u.gender,
                pp.id AS profile_id, pp.blood_group, pp.address,
                MAX(a.appointment_date) AS last_visit
         FROM patient_profiles pp
         JOIN users u ON u.id = pp.user_id
         LEFT JOIN appointments a ON a.patient_id = pp.id AND a.doctor_id = ?
         WHERE pp.tenant_id = ?
           AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)
         GROUP BY u.id, pp.id
         ORDER BY last_visit DESC, u.created_at DESC LIMIT ? OFFSET ?`,
        [doctorId, tenantId, like, like, like, lim, offset]
      ),
      query<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total
         FROM patient_profiles pp
         JOIN users u ON u.id = pp.user_id
         WHERE pp.tenant_id = ?
           AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`,
        [tenantId, like, like, like]
      ),
    ]);

    res.json({ success: true, message: 'Patients fetched', data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) });
  } catch (err) { next(err); }
}

export async function addPatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { email, firstName, lastName, phone, dateOfBirth, gender, bloodGroup, address, allergies, chronicConditions, emergencyContactName, emergencyContactPhone } = req.body;

    const dp = await query<Array<{ id: string; tenant_id: string }>>(`SELECT id, tenant_id FROM doctor_profiles WHERE user_id = ?`, [userId]);
    if (!dp.length) throw createError('Doctor profile not found', 404);
    const tenantId = dp[0].tenant_id;

    const existing = await query<unknown[]>(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existing.length) throw createError('Email already registered', 409);

    const hash = await bcrypt.hash('Patient@123', 12);
    const patUserId = generateId();
    await query(
      `INSERT INTO users (id, tenant_id, role, email, password_hash, first_name, last_name, phone, date_of_birth, gender, is_verified)
       VALUES (?,?,'patient',?,?,?,?,?,?,?,1)`,
      [patUserId, tenantId, email, hash, firstName, lastName, phone || null, dateOfBirth || null, gender || null]
    );

    const profileId = generateId();
    await query(
      `INSERT INTO patient_profiles (id, user_id, tenant_id, blood_group, address, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [profileId, patUserId, tenantId, bloodGroup || 'unknown', address || null,
       JSON.stringify(allergies || []), JSON.stringify(chronicConditions || []),
       emergencyContactName || null, emergencyContactPhone || null]
    );

    res.status(201).json({ success: true, message: 'Patient added', data: { userId: patUserId, profileId } });
  } catch (err) { next(err); }
}

export async function getDoctorDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const dp = await query<Array<{ id: string }>>(` SELECT id FROM doctor_profiles WHERE user_id = ?`, [userId]);
    if (!dp.length) throw createError('Doctor profile not found', 404);
    const doctorId = dp[0].id;

    const today = new Date().toISOString().split('T')[0];

    const [todayAppts, totalPatients, pendingAppts, recentPrescriptions] = await Promise.all([
      query<unknown[]>(
        `SELECT a.*, CONCAT(u.first_name,' ',u.last_name) AS patient_name
         FROM appointments a JOIN patient_profiles pp ON pp.id=a.patient_id JOIN users u ON u.id=pp.user_id
         WHERE a.doctor_id=? AND a.appointment_date=? ORDER BY a.start_time`,
        [doctorId, today]
      ),
      query<Array<{ total: number }>>(
        `SELECT COUNT(DISTINCT patient_id) AS total FROM appointments WHERE doctor_id=?`, [doctorId]
      ),
      query<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total FROM appointments WHERE doctor_id=? AND status='pending'`, [doctorId]
      ),
      query<unknown[]>(
        `SELECT p.*, CONCAT(u.first_name,' ',u.last_name) AS patient_name
         FROM prescriptions p JOIN patient_profiles pp ON pp.id=p.patient_id JOIN users u ON u.id=pp.user_id
         WHERE p.doctor_id=? ORDER BY p.created_at DESC LIMIT 5`,
        [doctorId]
      ),
    ]);

    res.json({
      success: true,
      message: 'Dashboard fetched',
      data: {
        todayAppointments: todayAppts,
        stats: {
          totalPatients:        totalPatients[0].total,
          todayAppointments:    todayAppts.length,
          pendingAppointments:  pendingAppts[0].total,
        },
        recentPrescriptions,
      },
    });
  } catch (err) { next(err); }
}
