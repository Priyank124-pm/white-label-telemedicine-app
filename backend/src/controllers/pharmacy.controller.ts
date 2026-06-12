import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';
import { generateId, generateInvoiceNo, paginate, buildPaginationMeta } from '../utils/helpers';

export async function searchPatients(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q = '' } = req.query as Record<string, string>;
    if (q.length < 2) throw createError('Search query must be at least 2 characters', 400);
    const like = `%${q}%`;

    const rows = await query<unknown[]>(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.date_of_birth,
              pp.id AS profile_id, pp.blood_group
       FROM users u JOIN patient_profiles pp ON pp.user_id=u.id
       WHERE u.role='patient' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)
       LIMIT 20`,
      [like, like, like, like]
    );

    res.json({ success: true, message: 'Patients found', data: rows });
  } catch (err) { next(err); }
}

export async function getPharmacyDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const ph = await query<Array<{ id: string }>>(` SELECT id FROM pharmacy_profiles WHERE user_id=?`, [userId]);
    if (!ph.length) throw createError('Pharmacy profile not found', 404);
    const pharmacyId = ph[0].id;

    const [totalDispensed, pendingInvoices, todayDispensed, recentDispensing] = await Promise.all([
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM dispensing_records WHERE pharmacy_id=?`, [pharmacyId]),
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM invoices WHERE pharmacy_id=? AND status='issued'`, [pharmacyId]),
      query<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total FROM dispensing_records WHERE pharmacy_id=? AND DATE(dispensed_at)=CURDATE()`, [pharmacyId]
      ),
      query<unknown[]>(
        `SELECT dr.*, p.prescription_no, CONCAT(u.first_name,' ',u.last_name) AS patient_name
         FROM dispensing_records dr
         JOIN prescriptions p ON p.id=dr.prescription_id
         JOIN patient_profiles pp ON pp.id=p.patient_id JOIN users u ON u.id=pp.user_id
         WHERE dr.pharmacy_id=? ORDER BY dr.dispensed_at DESC LIMIT 5`,
        [pharmacyId]
      ),
    ]);

    res.json({
      success: true,
      message: 'Dashboard fetched',
      data: {
        stats: {
          totalDispensed:  totalDispensed[0].total,
          pendingInvoices: pendingInvoices[0].total,
          todayDispensed:  todayDispensed[0].total,
        },
        recentDispensing,
      },
    });
  } catch (err) { next(err); }
}

export async function getActivePrescriptions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '10', patientId } = req.query as Record<string, string>;
    const { offset, limit: lim, page: pg } = paginate(+page, +limit);

    let where = 'WHERE p.status=\'active\'';
    const params: unknown[] = [];
    if (patientId) { where += ' AND p.patient_id=?'; params.push(patientId); }

    const countParams = [...params];
    params.push(lim, offset);

    const [rows, countRows] = await Promise.all([
      query<unknown[]>(
        `SELECT p.*,
                CONCAT(ud.first_name,' ',ud.last_name) AS doctor_name,
                CONCAT(up.first_name,' ',up.last_name) AS patient_name, up.phone AS patient_phone
         FROM prescriptions p
         JOIN doctor_profiles dp ON dp.id=p.doctor_id   JOIN users ud ON ud.id=dp.user_id
         JOIN patient_profiles pp ON pp.id=p.patient_id  JOIN users up ON up.id=pp.user_id
         ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
        params
      ),
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM prescriptions p ${where}`, countParams),
    ]);

    res.json({ success: true, message: 'Prescriptions fetched', data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) });
  } catch (err) { next(err); }
}

export async function dispensePrescription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { prescriptionId, notes, invoiceItems, taxPercent } = req.body;

    const ph = await query<Array<{ id: string; tenant_id: string }>>(` SELECT id, tenant_id FROM pharmacy_profiles WHERE user_id=?`, [userId]);
    if (!ph.length) throw createError('Pharmacy profile not found', 404);
    const { id: pharmacyId, tenant_id: tenantId } = ph[0];

    // Validate prescription exists and is active
    const prescription = await query<Array<{ id: string; patient_id: string; status: string }>>(
      `SELECT id, patient_id, status FROM prescriptions WHERE id=?`, [prescriptionId]
    );
    if (!prescription.length) throw createError('Prescription not found', 404);
    if (prescription[0].status !== 'active') throw createError('Prescription is not active', 400);

    // Create dispensing record
    const dispensingId = generateId();
    await query(
      `INSERT INTO dispensing_records (id, tenant_id, prescription_id, pharmacy_id, dispensed_by, notes)
       VALUES (?,?,?,?,?,?)`,
      [dispensingId, tenantId, prescriptionId, pharmacyId, userId, notes || null]
    );

    // Update prescription status
    await query(`UPDATE prescriptions SET status='dispensed' WHERE id=?`, [prescriptionId]);

    // Generate invoice
    const invoiceNo = generateInvoiceNo();
    const invoiceId = generateId();

    const subtotal = (invoiceItems || []).reduce((sum: number, item: { quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = subtotal * ((taxPercent || 0) / 100);
    const total = subtotal + taxAmount;

    await query(
      `INSERT INTO invoices (id, tenant_id, dispensing_id, patient_id, pharmacy_id, invoice_no, subtotal, tax_percent, tax_amount, total_amount)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [invoiceId, tenantId, dispensingId, prescription[0].patient_id, pharmacyId, invoiceNo, subtotal, taxPercent || 0, taxAmount, total]
    );

    for (const item of (invoiceItems || [])) {
      const itemId = generateId();
      await query(
        `INSERT INTO invoice_items (id, invoice_id, medicine_name, quantity, unit_price, total_price) VALUES (?,?,?,?,?,?)`,
        [itemId, invoiceId, item.medicineName, item.quantity, item.unitPrice, item.quantity * item.unitPrice]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Prescription dispensed and invoice created',
      data: { dispensingId, invoiceId, invoiceNo, total },
    });
  } catch (err) { next(err); }
}

export async function getInvoices(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '10' } = req.query as Record<string, string>;
    const { offset, limit: lim, page: pg } = paginate(+page, +limit);

    const ph = await query<Array<{ id: string }>>(` SELECT id FROM pharmacy_profiles WHERE user_id=?`, [userId]);
    if (!ph.length) throw createError('Pharmacy profile not found', 404);
    const pharmacyId = ph[0].id;

    const [rows, countRows] = await Promise.all([
      query<unknown[]>(
        `SELECT i.*, CONCAT(u.first_name,' ',u.last_name) AS patient_name, p.prescription_no
         FROM invoices i
         JOIN patient_profiles pp ON pp.id=i.patient_id JOIN users u ON u.id=pp.user_id
         JOIN dispensing_records dr ON dr.id=i.dispensing_id
         JOIN prescriptions p ON p.id=dr.prescription_id
         WHERE i.pharmacy_id=?
         ORDER BY i.created_at DESC LIMIT ? OFFSET ?`,
        [pharmacyId, lim, offset]
      ),
      query<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total FROM invoices WHERE pharmacy_id=?`, [pharmacyId]
      ),
    ]);

    res.json({ success: true, message: 'Invoices fetched', data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) });
  } catch (err) { next(err); }
}

export async function getInvoiceById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const [invoice, items] = await Promise.all([
      query<unknown[]>(
        `SELECT i.*, CONCAT(u.first_name,' ',u.last_name) AS patient_name, p.prescription_no
         FROM invoices i
         JOIN patient_profiles pp ON pp.id=i.patient_id JOIN users u ON u.id=pp.user_id
         JOIN dispensing_records dr ON dr.id=i.dispensing_id
         JOIN prescriptions p ON p.id=dr.prescription_id
         WHERE i.id=?`,
        [id]
      ),
      query<unknown[]>(`SELECT * FROM invoice_items WHERE invoice_id=?`, [id]),
    ]);

    if (!invoice.length) throw createError('Invoice not found', 404);
    res.json({ success: true, message: 'Invoice fetched', data: { ...invoice[0] as object, items } });
  } catch (err) { next(err); }
}
