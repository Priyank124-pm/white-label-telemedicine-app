import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';
import { generateId, generatePrescriptionNo, paginate, buildPaginationMeta } from '../utils/helpers';
import { generatePrescriptionPdf } from '../services/pdf.service';
import { uploadFile } from '../services/s3.service';

export async function createPrescription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId   = req.user!.userId;
    const tenantId = req.user!.tenantId;
    const { appointmentId, patientId, diagnosis, notes, followUpDate, items } = req.body;

    const dp = await query<Array<{ id: string }>>(` SELECT id FROM doctor_profiles WHERE user_id = ?`, [userId]);
    if (!dp.length) throw createError('Doctor profile not found', 404);
    const doctorId = dp[0].id;

    const prescriptionNo = generatePrescriptionNo();
    const id = generateId();

    await query(
      `INSERT INTO prescriptions (id, tenant_id, appointment_id, patient_id, doctor_id, prescription_no, diagnosis, notes, follow_up_date)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, tenantId, appointmentId || null, patientId, doctorId, prescriptionNo, diagnosis, notes || null, followUpDate || null]
    );

    // Insert items
    for (const item of items) {
      const itemId = generateId();
      await query(
        `INSERT INTO prescription_items (id, prescription_id, medicine_id, medicine_name, dosage, frequency, duration, quantity, instructions)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [itemId, id, item.medicineId, item.medicineName, item.dosage, item.frequency, item.duration, item.quantity || 1, item.instructions || null]
      );
    }

    // Update appointment status to completed if from appointment
    if (appointmentId) {
      await query(`UPDATE appointments SET status='completed' WHERE id=?`, [appointmentId]);
    }

    // Generate PDF
    try {
      const [docInfo, patInfo, clinicInfo] = await Promise.all([
        query<Array<{ first_name: string; last_name: string; specialization: string }>>(
          `SELECT u.first_name, u.last_name, dp.specialization FROM users u JOIN doctor_profiles dp ON dp.user_id=u.id WHERE dp.id=?`,
          [doctorId]
        ),
        query<Array<{ first_name: string; last_name: string; date_of_birth: string }>>(
          `SELECT u.first_name, u.last_name, u.date_of_birth FROM users u JOIN patient_profiles pp ON pp.user_id=u.id WHERE pp.id=?`,
          [patientId]
        ),
        tenantId ? query<Array<{ name: string }>>(`SELECT name FROM tenants WHERE id=?`, [tenantId]) : Promise.resolve([{ name: 'Doctor SaaS Clinic' }]),
      ]);

      const pdfBuffer = await generatePrescriptionPdf({
        prescriptionNo,
        date:        new Date().toLocaleDateString(),
        doctorName:  `${docInfo[0].first_name} ${docInfo[0].last_name}`,
        doctorSpec:  docInfo[0].specialization,
        clinicName:  clinicInfo[0]?.name || 'Doctor SaaS',
        patientName: `${patInfo[0].first_name} ${patInfo[0].last_name}`,
        patientDob:  patInfo[0].date_of_birth || 'N/A',
        diagnosis,
        items: items.map((i: Record<string, string>) => ({
          medicineName: i.medicineName,
          dosage:       i.dosage,
          frequency:    i.frequency,
          duration:     i.duration,
          instructions: i.instructions || '',
        })),
        notes:        notes || '',
        followUpDate: followUpDate || '',
      });

      const { url } = await uploadFile(pdfBuffer, 'application/pdf', 'prescriptions', `${prescriptionNo}.pdf`);
      await query(`UPDATE prescriptions SET pdf_url=? WHERE id=?`, [url, id]);
    } catch { /* PDF generation failure shouldn't break the flow */ }

    const rows = await query<unknown[]>(`SELECT * FROM prescriptions WHERE id=?`, [id]);
    res.status(201).json({ success: true, message: 'Prescription created', data: rows[0] });
  } catch (err) { next(err); }
}

export async function getPrescriptions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '10', status, patientId } = req.query as Record<string, string>;
    const { offset, limit: lim, page: pg } = paginate(+page, +limit);
    const { role, userId } = req.user!;

    let where = 'WHERE 1=1';
    const params: unknown[] = [];

    if (role === 'doctor') {
      const dp = await query<Array<{ id: string }>>(`SELECT id FROM doctor_profiles WHERE user_id=?`, [userId]);
      if (!dp.length) throw createError('Doctor profile not found', 404);
      where += ' AND p.doctor_id=?'; params.push(dp[0].id);
    } else if (role === 'patient') {
      const pp = await query<Array<{ id: string }>>(`SELECT id FROM patient_profiles WHERE user_id=?`, [userId]);
      if (!pp.length) throw createError('Patient profile not found', 404);
      where += ' AND p.patient_id=?'; params.push(pp[0].id);
    } else if (role === 'pharmacy') {
      where += ' AND p.status=\'active\'';
    }

    if (status)    { where += ' AND p.status=?';     params.push(status); }
    if (patientId) { where += ' AND p.patient_id=?'; params.push(patientId); }

    const countParams = [...params];
    params.push(lim, offset);

    const [rows, countRows] = await Promise.all([
      query<unknown[]>(
        `SELECT p.*,
                CONCAT(ud.first_name,' ',ud.last_name) AS doctor_name, dp.specialization,
                CONCAT(up.first_name,' ',up.last_name) AS patient_name
         FROM prescriptions p
         JOIN doctor_profiles dp ON dp.id=p.doctor_id  JOIN users ud ON ud.id=dp.user_id
         JOIN patient_profiles pp ON pp.id=p.patient_id JOIN users up ON up.id=pp.user_id
         ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
        params
      ),
      query<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total FROM prescriptions p ${where}`,
        countParams
      ),
    ]);

    res.json({ success: true, message: 'Prescriptions fetched', data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) });
  } catch (err) { next(err); }
}

export async function getPrescriptionById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const [prescription, items] = await Promise.all([
      query<unknown[]>(
        `SELECT p.*,
                CONCAT(ud.first_name,' ',ud.last_name) AS doctor_name, dp.specialization,
                CONCAT(up.first_name,' ',up.last_name) AS patient_name, up.date_of_birth AS patient_dob,
                t.name AS clinic_name
         FROM prescriptions p
         JOIN doctor_profiles dp ON dp.id=p.doctor_id   JOIN users ud ON ud.id=dp.user_id
         JOIN patient_profiles pp ON pp.id=p.patient_id  JOIN users up ON up.id=pp.user_id
         LEFT JOIN tenants t ON t.id=p.tenant_id
         WHERE p.id=?`,
        [id]
      ),
      query<unknown[]>(`SELECT * FROM prescription_items WHERE prescription_id=?`, [id]),
    ]);

    if (!prescription.length) throw createError('Prescription not found', 404);
    res.json({ success: true, message: 'Prescription fetched', data: { ...prescription[0] as object, items } });
  } catch (err) { next(err); }
}

export async function updatePrescription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { diagnosis, notes, followUpDate, status } = req.body;

    await query(
      `UPDATE prescriptions SET diagnosis=COALESCE(?,diagnosis), notes=COALESCE(?,notes), follow_up_date=COALESCE(?,follow_up_date), status=COALESCE(?,status) WHERE id=?`,
      [diagnosis || null, notes || null, followUpDate || null, status || null, id]
    );

    res.json({ success: true, message: 'Prescription updated' });
  } catch (err) { next(err); }
}
