import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';
import { generateId, paginate, buildPaginationMeta } from '../utils/helpers';

export async function getMedicines(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '20', search = '', category } = req.query as Record<string, string>;
    const { offset, limit: lim, page: pg } = paginate(+page, +limit);
    const like = `%${search}%`;

    let where = 'WHERE is_active=1 AND (name LIKE ? OR generic_name LIKE ?)';
    const params: unknown[] = [like, like];
    if (category) { where += ' AND category=?'; params.push(category); }
    const countParams = [...params];
    params.push(lim, offset);

    const [rows, countRows] = await Promise.all([
      query<unknown[]>(`SELECT * FROM medicines ${where} ORDER BY name ASC LIMIT ? OFFSET ?`, params),
      query<Array<{ total: number }>>(`SELECT COUNT(*) AS total FROM medicines ${where}`, countParams),
    ]);

    res.json({ success: true, message: 'Medicines fetched', data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) });
  } catch (err) { next(err); }
}

export async function getMedicineById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const rows = await query<unknown[]>(`SELECT * FROM medicines WHERE id=?`, [id]);
    if (!rows.length) throw createError('Medicine not found', 404);
    res.json({ success: true, message: 'Medicine fetched', data: rows[0] });
  } catch (err) { next(err); }
}

export async function createMedicine(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, genericName, category, form, strength, manufacturer, description, sideEffects } = req.body;

    const id = generateId();
    await query(
      `INSERT INTO medicines (id, name, generic_name, category, form, strength, manufacturer, description, side_effects, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [id, name, genericName || null, category || null, form || 'tablet', strength || null, manufacturer || null, description || null, sideEffects || null, req.user!.userId]
    );

    const rows = await query<unknown[]>(`SELECT * FROM medicines WHERE id=?`, [id]);
    res.status(201).json({ success: true, message: 'Medicine created', data: rows[0] });
  } catch (err) { next(err); }
}

export async function updateMedicine(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { name, genericName, category, form, strength, manufacturer, description, sideEffects, isActive } = req.body;

    await query(
      `UPDATE medicines SET name=?,generic_name=?,category=?,form=?,strength=?,manufacturer=?,description=?,side_effects=?,is_active=? WHERE id=?`,
      [name, genericName || null, category || null, form || 'tablet', strength || null, manufacturer || null, description || null, sideEffects || null, isActive ?? 1, id]
    );

    const rows = await query<unknown[]>(`SELECT * FROM medicines WHERE id=?`, [id]);
    res.json({ success: true, message: 'Medicine updated', data: rows[0] });
  } catch (err) { next(err); }
}

export async function deleteMedicine(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await query(`UPDATE medicines SET is_active=0 WHERE id=?`, [id]);
    res.json({ success: true, message: 'Medicine deactivated' });
  } catch (err) { next(err); }
}

export async function getMedicineCategories(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await query<Array<{ category: string }>>(
      `SELECT DISTINCT category FROM medicines WHERE is_active=1 AND category IS NOT NULL ORDER BY category`
    );
    res.json({ success: true, data: rows.map((r) => r.category) });
  } catch (err) { next(err); }
}
