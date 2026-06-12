import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';
import { generateId, paginate, buildPaginationMeta } from '../utils/helpers';

export async function createReferral(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId   = req.user!.userId;
    const tenantId = req.user!.tenantId;
    const { patientId, referredDoctorId, appointmentId, reason, notes, urgency } = req.body;

    const dp = await query<Array<{ id: string }>>(`SELECT id FROM doctor_profiles WHERE user_id=?`, [userId]);
    if (!dp.length) throw createError('Doctor profile not found', 404);
    const referringDoctorId = dp[0].id;

    if (referringDoctorId === referredDoctorId) throw createError('Cannot refer to yourself', 400);

    const id = generateId();
    await query(
      `INSERT INTO referrals (id, tenant_id, patient_id, referring_doctor_id, referred_doctor_id, appointment_id, reason, notes, urgency)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, tenantId, patientId, referringDoctorId, referredDoctorId, appointmentId || null, reason, notes || null, urgency || 'routine']
    );

    const rows = await query<unknown[]>(`SELECT * FROM referrals WHERE id=?`, [id]);
    res.status(201).json({ success: true, message: 'Referral created', data: rows[0] });
  } catch (err) { next(err); }
}

export async function getReferrals(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '10', direction = 'both' } = req.query as Record<string, string>;
    const { offset, limit: lim, page: pg } = paginate(+page, +limit);
    const { role, userId } = req.user!;

    let where = 'WHERE 1=1';
    const params: unknown[] = [];

    if (role === 'doctor') {
      const dp = await query<Array<{ id: string }>>(`SELECT id FROM doctor_profiles WHERE user_id=?`, [userId]);
      if (!dp.length) throw createError('Doctor profile not found', 404);
      const doctorId = dp[0].id;

      if (direction === 'sent')     { where += ' AND r.referring_doctor_id=?'; params.push(doctorId); }
      else if (direction === 'received') { where += ' AND r.referred_doctor_id=?'; params.push(doctorId); }
      else {
        where += ' AND (r.referring_doctor_id=? OR r.referred_doctor_id=?)';
        params.push(doctorId, doctorId);
      }
    } else if (role === 'patient') {
      const pp = await query<Array<{ id: string }>>(`SELECT id FROM patient_profiles WHERE user_id=?`, [userId]);
      if (!pp.length) throw createError('Patient profile not found', 404);
      where += ' AND r.patient_id=?'; params.push(pp[0].id);
    }

    const countParams = [...params];
    params.push(lim, offset);

    const [rows, countRows] = await Promise.all([
      query<unknown[]>(
        `SELECT r.*,
                CONCAT(uf.first_name,' ',uf.last_name) AS referring_doctor_name, df.specialization AS from_spec,
                CONCAT(ut.first_name,' ',ut.last_name) AS referred_doctor_name,  dt.specialization AS to_spec,
                CONCAT(up.first_name,' ',up.last_name) AS patient_name
         FROM referrals r
         JOIN doctor_profiles df ON df.id=r.referring_doctor_id JOIN users uf ON uf.id=df.user_id
         JOIN doctor_profiles dt ON dt.id=r.referred_doctor_id  JOIN users ut ON ut.id=dt.user_id
         JOIN patient_profiles pp ON pp.id=r.patient_id         JOIN users up ON up.id=pp.user_id
         ${where} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
        params
      ),
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM referrals r ${where}`, countParams),
    ]);

    res.json({ success: true, message: 'Referrals fetched', data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) });
  } catch (err) { next(err); }
}

export async function updateReferralStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await query(`UPDATE referrals SET status=? WHERE id=?`, [status, id]);
    res.json({ success: true, message: 'Referral updated' });
  } catch (err) { next(err); }
}
