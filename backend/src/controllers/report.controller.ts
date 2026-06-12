import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';
import { generateId, paginate, buildPaginationMeta } from '../utils/helpers';
import { uploadFile } from '../services/s3.service';

export async function uploadReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId   = req.user!.userId;
    const tenantId = req.user!.tenantId;
    const { patientId, appointmentId, reportType, title, description, reportDate } = req.body;

    if (!req.file) throw createError('File is required', 400);

    const dp = await query<Array<{ id: string }>>(`SELECT id FROM doctor_profiles WHERE user_id=?`, [userId]);
    if (!dp.length) throw createError('Doctor profile not found', 404);
    const doctorId = dp[0].id;

    const { url } = await uploadFile(
      req.file.buffer,
      req.file.mimetype,
      'reports',
      req.file.originalname
    );

    const id = generateId();
    await query(
      `INSERT INTO medical_reports (id, tenant_id, patient_id, doctor_id, appointment_id, report_type, title, description, file_url, file_name, file_size, report_date)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, tenantId, patientId, doctorId, appointmentId || null, reportType || 'lab', title, description || null, url, req.file.originalname, req.file.size, reportDate || new Date().toISOString().split('T')[0]]
    );

    const rows = await query<unknown[]>(`SELECT * FROM medical_reports WHERE id=?`, [id]);
    res.status(201).json({ success: true, message: 'Report uploaded', data: rows[0] });
  } catch (err) { next(err); }
}

export async function getReports(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '10', reportType, patientId } = req.query as Record<string, string>;
    const { offset, limit: lim, page: pg } = paginate(+page, +limit);
    const { role, userId } = req.user!;

    let where = 'WHERE 1=1';
    const params: unknown[] = [];

    if (role === 'doctor') {
      const dp = await query<Array<{ id: string }>>(`SELECT id FROM doctor_profiles WHERE user_id=?`, [userId]);
      if (!dp.length) throw createError('Doctor profile not found', 404);
      where += ' AND r.doctor_id=?'; params.push(dp[0].id);
    } else if (role === 'patient') {
      const pp = await query<Array<{ id: string }>>(`SELECT id FROM patient_profiles WHERE user_id=?`, [userId]);
      if (!pp.length) throw createError('Patient profile not found', 404);
      where += ' AND r.patient_id=?'; params.push(pp[0].id);
    }

    if (reportType) { where += ' AND r.report_type=?'; params.push(reportType); }
    if (patientId)  { where += ' AND r.patient_id=?';  params.push(patientId); }

    const countParams = [...params];
    params.push(lim, offset);

    const [rows, countRows] = await Promise.all([
      query<unknown[]>(
        `SELECT r.*,
                CONCAT(ud.first_name,' ',ud.last_name) AS doctor_name,
                CONCAT(up.first_name,' ',up.last_name) AS patient_name
         FROM medical_reports r
         JOIN doctor_profiles dp ON dp.id=r.doctor_id   JOIN users ud ON ud.id=dp.user_id
         JOIN patient_profiles pp ON pp.id=r.patient_id  JOIN users up ON up.id=pp.user_id
         ${where} ORDER BY r.report_date DESC LIMIT ? OFFSET ?`,
        params
      ),
      query<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total FROM medical_reports r ${where}`,
        countParams
      ),
    ]);

    res.json({ success: true, message: 'Reports fetched', data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) });
  } catch (err) { next(err); }
}

export async function getReportById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const rows = await query<unknown[]>(
      `SELECT r.*,
              CONCAT(ud.first_name,' ',ud.last_name) AS doctor_name,
              CONCAT(up.first_name,' ',up.last_name) AS patient_name
       FROM medical_reports r
       JOIN doctor_profiles dp ON dp.id=r.doctor_id   JOIN users ud ON ud.id=dp.user_id
       JOIN patient_profiles pp ON pp.id=r.patient_id  JOIN users up ON up.id=pp.user_id
       WHERE r.id=?`,
      [id]
    );
    if (!rows.length) throw createError('Report not found', 404);
    res.json({ success: true, message: 'Report fetched', data: rows[0] });
  } catch (err) { next(err); }
}

export async function deleteReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await query(`DELETE FROM medical_reports WHERE id=?`, [id]);
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) { next(err); }
}
