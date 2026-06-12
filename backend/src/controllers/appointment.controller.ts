import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';
import { generateId, paginate, buildPaginationMeta } from '../utils/helpers';
import { sendMail, appointmentConfirmationEmail, appointmentCancelledEmail } from '../services/email.service';

export async function getAvailableSlots(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { doctorId, date } = req.query as Record<string, string>;
    if (!doctorId || !date) throw createError('doctorId and date required', 400);

    // Parse date parts directly to avoid UTC-vs-local timezone shift
    const [y, mo, dy] = date.split('-').map(Number);
    const dayOfWeek = new Date(y, mo - 1, dy).getDay(); // 0=Sun

    // Get availability for that day
    const availability = await query<Array<{ start_time: string; end_time: string; slot_duration_mins: number }>>(
      `SELECT start_time, end_time, slot_duration_mins FROM doctor_availability
       WHERE doctor_id = ? AND day_of_week = ? AND is_active = 1`,
      [doctorId, dayOfWeek]
    );

    if (!availability.length) {
      res.json({ success: true, message: 'No availability', data: [] });
      return;
    }

    // Check for leave
    const leave = await query<unknown[]>(
      `SELECT id FROM doctor_leaves WHERE doctor_id = ? AND leave_date = ?`,
      [doctorId, date]
    );
    if (leave.length) {
      res.json({ success: true, message: 'Doctor on leave', data: [] });
      return;
    }

    // Get booked slots
    const booked = await query<Array<{ start_time: string }>>(
      `SELECT start_time FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND status NOT IN ('cancelled','no_show')`,
      [doctorId, date]
    );
    const bookedTimes = new Set(booked.map((b) => b.start_time));

    // Generate slots
    const slots: string[] = [];
    const { start_time, end_time, slot_duration_mins } = availability[0];

    const [sh, sm] = start_time.split(':').map(Number);
    const [eh, em] = end_time.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins   = eh * 60 + em;

    for (let m = startMins; m + slot_duration_mins <= endMins; m += slot_duration_mins) {
      const h   = Math.floor(m / 60).toString().padStart(2, '0');
      const min = (m % 60).toString().padStart(2, '0');
      const time = `${h}:${min}:00`;
      if (!bookedTimes.has(time)) slots.push(time);
    }

    res.json({ success: true, message: 'Slots fetched', data: slots });
  } catch (err) { next(err); }
}

export async function bookAppointment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { doctorId, patientId, appointmentDate, startTime, type, reason } = req.body;
    const role     = req.user!.role;
    const userId   = req.user!.userId;
    const tenantId = req.user!.tenantId;

    // Resolve patient profile id
    let patientProfileId = patientId;
    if (role === 'patient') {
      const rows = await query<Array<{ id: string }>>(
        `SELECT id FROM patient_profiles WHERE user_id = ?`, [userId]
      );
      if (!rows.length) throw createError('Patient profile not found', 404);
      patientProfileId = rows[0].id;
    }

    // Verify slot is still available
    const conflict = await query<unknown[]>(
      `SELECT id FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND start_time = ? AND status NOT IN ('cancelled','no_show')`,
      [doctorId, appointmentDate, startTime]
    );
    if (conflict.length) throw createError('This slot is no longer available', 409);

    // Get slot duration — parse locally to avoid UTC shift
    const [ay, amo, ady] = appointmentDate.split('-').map(Number);
    const dayOfWeek = new Date(ay, amo - 1, ady).getDay();
    const avail = await query<Array<{ slot_duration_mins: number }>>(
      `SELECT slot_duration_mins FROM doctor_availability WHERE doctor_id = ? AND day_of_week = ? AND is_active = 1`,
      [doctorId, dayOfWeek]
    );
    const duration = avail[0]?.slot_duration_mins || 30;

    const [sh, sm] = startTime.split(':').map(Number);
    const endMinutes = sh * 60 + sm + duration;
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}:00`;

    const id = generateId();
    await query(
      `INSERT INTO appointments (id, tenant_id, patient_id, doctor_id, appointment_date, start_time, end_time, type, reason)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, tenantId, patientProfileId, doctorId, appointmentDate, startTime, endTime, type || 'in_person', reason || null]
    );

    // Send confirmation email
    try {
      const [docUser, patUser] = await Promise.all([
        query<Array<{ first_name: string; last_name: string; email: string }>>(
          `SELECT u.first_name, u.last_name, u.email FROM users u JOIN doctor_profiles dp ON dp.user_id = u.id WHERE dp.id = ?`,
          [doctorId]
        ),
        query<Array<{ first_name: string; last_name: string; email: string }>>(
          `SELECT u.first_name, u.last_name, u.email FROM users u JOIN patient_profiles pp ON pp.user_id = u.id WHERE pp.id = ?`,
          [patientProfileId]
        ),
      ]);

      if (patUser.length && docUser.length) {
        await sendMail({
          to:      patUser[0].email,
          subject: 'Appointment Confirmed',
          html:    appointmentConfirmationEmail(
            `${patUser[0].first_name} ${patUser[0].last_name}`,
            `${docUser[0].first_name} ${docUser[0].last_name}`,
            appointmentDate, startTime
          ),
        });
      }
    } catch { /* email failure shouldn't break booking */ }

    const rows = await query<unknown[]>(`SELECT * FROM appointments WHERE id = ?`, [id]);
    res.status(201).json({ success: true, message: 'Appointment booked', data: rows[0] });
  } catch (err) { next(err); }
}

export async function getAppointments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '10', status, date } = req.query as Record<string, string>;
    const { offset, limit: lim, page: pg } = paginate(+page, +limit);
    const { role, userId, tenantId } = req.user!;

    let where = 'WHERE 1=1';
    const params: unknown[] = [];

    if (role === 'doctor') {
      const docRows = await query<Array<{ id: string }>>(`SELECT id FROM doctor_profiles WHERE user_id = ?`, [userId]);
      if (!docRows.length) throw createError('Doctor profile not found', 404);
      where += ' AND a.doctor_id = ?';
      params.push(docRows[0].id);
    } else if (role === 'patient') {
      const patRows = await query<Array<{ id: string }>>(`SELECT id FROM patient_profiles WHERE user_id = ?`, [userId]);
      if (!patRows.length) throw createError('Patient profile not found', 404);
      where += ' AND a.patient_id = ?';
      params.push(patRows[0].id);
    } else if (role === 'super_admin' && tenantId) {
      where += ' AND a.tenant_id = ?';
      params.push(tenantId);
    }

    if (status) { where += ' AND a.status = ?'; params.push(status); }
    if (date)   { where += ' AND a.appointment_date = ?'; params.push(date); }

    const countParams = [...params];
    params.push(lim, offset);

    const [rows, countRows] = await Promise.all([
      query<unknown[]>(
        `SELECT a.*,
                CONCAT(ud.first_name,' ',ud.last_name) AS doctor_name, dp.specialization,
                CONCAT(up.first_name,' ',up.last_name) AS patient_name, up.phone AS patient_phone
         FROM appointments a
         JOIN doctor_profiles dp ON dp.id  = a.doctor_id
         JOIN users ud            ON ud.id  = dp.user_id
         JOIN patient_profiles pp ON pp.id = a.patient_id
         JOIN users up            ON up.id  = pp.user_id
         ${where}
         ORDER BY a.appointment_date DESC, a.start_time DESC LIMIT ? OFFSET ?`,
        params
      ),
      query<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total FROM appointments a ${where}`,
        countParams
      ),
    ]);

    res.json({ success: true, message: 'Appointments fetched', data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) });
  } catch (err) { next(err); }
}

export async function updateAppointmentStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, notes, cancelReason } = req.body;

    const existing = await query<Array<{ status: string; patient_id: string }>>(
      `SELECT status, patient_id FROM appointments WHERE id = ?`, [id]
    );
    if (!existing.length) throw createError('Appointment not found', 404);

    await query(
      `UPDATE appointments SET status=?, notes=COALESCE(?,notes), cancel_reason=?, cancelled_by=? WHERE id=?`,
      [status, notes || null, cancelReason || null, status === 'cancelled' ? req.user!.userId : null, id]
    );

    // Send cancellation email if cancelled
    if (status === 'cancelled') {
      try {
        const appt = await query<Array<{ appointment_date: string; first_name: string; last_name: string; email: string }>>(
          `SELECT a.appointment_date, u.first_name, u.last_name, u.email
           FROM appointments a JOIN patient_profiles pp ON pp.id = a.patient_id JOIN users u ON u.id = pp.user_id
           WHERE a.id = ?`, [id]
        );
        if (appt.length) {
          await sendMail({
            to: appt[0].email,
            subject: 'Appointment Cancelled',
            html: appointmentCancelledEmail(
              `${appt[0].first_name} ${appt[0].last_name}`,
              appt[0].appointment_date,
              cancelReason || ''
            ),
          });
        }
      } catch { /* silent */ }
    }

    res.json({ success: true, message: 'Appointment updated' });
  } catch (err) { next(err); }
}

export async function getAppointmentById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const rows = await query<unknown[]>(
      `SELECT a.*,
              CONCAT(ud.first_name,' ',ud.last_name) AS doctor_name, dp.specialization,
              CONCAT(up.first_name,' ',up.last_name) AS patient_name
       FROM appointments a
       JOIN doctor_profiles dp ON dp.id  = a.doctor_id
       JOIN users ud ON ud.id = dp.user_id
       JOIN patient_profiles pp ON pp.id = a.patient_id
       JOIN users up ON up.id = pp.user_id
       WHERE a.id = ?`,
      [id]
    );
    if (!rows.length) throw createError('Appointment not found', 404);
    res.json({ success: true, message: 'Appointment fetched', data: rows[0] });
  } catch (err) { next(err); }
}
