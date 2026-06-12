import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';

export async function getPatientProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId || req.user!.userId;
    const rows = await query<unknown[]>(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.date_of_birth, u.gender, u.avatar_url,
              pp.id AS profile_id, pp.blood_group, pp.height_cm, pp.weight_kg,
              pp.allergies, pp.chronic_conditions, pp.emergency_contact_name, pp.emergency_contact_phone, pp.address,
              t.name AS clinic_name
       FROM users u
       JOIN patient_profiles pp ON pp.user_id=u.id
       LEFT JOIN tenants t ON t.id=pp.tenant_id
       WHERE u.id=?`,
      [userId]
    );
    if (!rows.length) throw createError('Patient not found', 404);
    res.json({ success: true, message: 'Profile fetched', data: rows[0] });
  } catch (err) { next(err); }
}

export async function updatePatientProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { firstName, lastName, phone, dateOfBirth, gender, bloodGroup, heightCm, weightKg, allergies, chronicConditions, emergencyContactName, emergencyContactPhone, address } = req.body;

    await query(
      `UPDATE users SET first_name=?,last_name=?,phone=?,date_of_birth=?,gender=? WHERE id=?`,
      [firstName, lastName, phone || null, dateOfBirth || null, gender || null, userId]
    );

    await query(
      `UPDATE patient_profiles SET blood_group=?,height_cm=?,weight_kg=?,allergies=?,chronic_conditions=?,emergency_contact_name=?,emergency_contact_phone=?,address=? WHERE user_id=?`,
      [bloodGroup || 'unknown', heightCm || null, weightKg || null, JSON.stringify(allergies || []), JSON.stringify(chronicConditions || []), emergencyContactName || null, emergencyContactPhone || null, address || null, userId]
    );

    res.json({ success: true, message: 'Profile updated' });
  } catch (err) { next(err); }
}

export async function getPatientDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const pp = await query<Array<{ id: string }>>(`SELECT id FROM patient_profiles WHERE user_id=?`, [userId]);
    if (!pp.length) throw createError('Patient profile not found', 404);
    const patientId = pp[0].id;

    const [upcomingAppts, totalPrescriptions, totalReports, recentActivity] = await Promise.all([
      query<unknown[]>(
        `SELECT a.*, CONCAT(u.first_name,' ',u.last_name) AS doctor_name, dp.specialization
         FROM appointments a
         JOIN doctor_profiles dp ON dp.id=a.doctor_id JOIN users u ON u.id=dp.user_id
         WHERE a.patient_id=? AND a.appointment_date >= CURDATE() AND a.status NOT IN ('cancelled','no_show')
         ORDER BY a.appointment_date, a.start_time LIMIT 5`,
        [patientId]
      ),
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM prescriptions WHERE patient_id=?`, [patientId]),
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM medical_reports WHERE patient_id=?`, [patientId]),
      query<unknown[]>(
        `SELECT a.id, a.appointment_date, a.status, 'appointment' AS type, CONCAT(u.first_name,' ',u.last_name) AS doctor_name
         FROM appointments a JOIN doctor_profiles dp ON dp.id=a.doctor_id JOIN users u ON u.id=dp.user_id
         WHERE a.patient_id=?
         ORDER BY a.created_at DESC LIMIT 5`,
        [patientId]
      ),
    ]);

    res.json({
      success: true,
      message: 'Dashboard fetched',
      data: {
        upcomingAppointments: upcomingAppts,
        stats: {
          totalPrescriptions: totalPrescriptions[0].total,
          totalReports:       totalReports[0].total,
          upcomingCount:      upcomingAppts.length,
        },
        recentActivity,
      },
    });
  } catch (err) { next(err); }
}

export async function getPatientHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId || req.user!.userId;
    const pp = await query<Array<{ id: string }>>(`SELECT id FROM patient_profiles WHERE user_id=?`, [userId]);
    if (!pp.length) throw createError('Patient profile not found', 404);
    const patientId = pp[0].id;

    const [appointments, prescriptions, reports, referrals] = await Promise.all([
      query<unknown[]>(
        `SELECT a.*, CONCAT(u.first_name,' ',u.last_name) AS doctor_name, dp.specialization
         FROM appointments a JOIN doctor_profiles dp ON dp.id=a.doctor_id JOIN users u ON u.id=dp.user_id
         WHERE a.patient_id=? ORDER BY a.appointment_date DESC LIMIT 20`,
        [patientId]
      ),
      query<unknown[]>(
        `SELECT p.*, CONCAT(u.first_name,' ',u.last_name) AS doctor_name
         FROM prescriptions p JOIN doctor_profiles dp ON dp.id=p.doctor_id JOIN users u ON u.id=dp.user_id
         WHERE p.patient_id=? ORDER BY p.created_at DESC LIMIT 20`,
        [patientId]
      ),
      query<unknown[]>(
        `SELECT * FROM medical_reports WHERE patient_id=? ORDER BY report_date DESC LIMIT 20`,
        [patientId]
      ),
      query<unknown[]>(
        `SELECT r.*, CONCAT(uf.first_name,' ',uf.last_name) AS from_doctor, CONCAT(ut.first_name,' ',ut.last_name) AS to_doctor
         FROM referrals r
         JOIN doctor_profiles df ON df.id=r.referring_doctor_id JOIN users uf ON uf.id=df.user_id
         JOIN doctor_profiles dt ON dt.id=r.referred_doctor_id  JOIN users ut ON ut.id=dt.user_id
         WHERE r.patient_id=? ORDER BY r.created_at DESC LIMIT 10`,
        [patientId]
      ),
    ]);

    res.json({ success: true, message: 'History fetched', data: { appointments, prescriptions, reports, referrals } });
  } catch (err) { next(err); }
}
