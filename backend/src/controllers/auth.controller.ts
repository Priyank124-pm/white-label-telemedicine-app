import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../config/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../config/jwt';
import { generateId } from '../utils/helpers';
import { createError } from '../middlewares/errorHandler';
import { AuthRequest, User } from '../types';

const SALT_ROUNDS = 12;

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, firstName, lastName, phone, dateOfBirth, gender, tenantId } = req.body;

    const existing = await query<User[]>('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) throw createError('Email already registered', 409);

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const id   = generateId();

    await query(
      `INSERT INTO users (id, tenant_id, role, email, password_hash, first_name, last_name, phone, date_of_birth, gender)
       VALUES (?, ?, 'patient', ?, ?, ?, ?, ?, ?, ?)`,
      [id, tenantId || null, email, hash, firstName, lastName, phone || null, dateOfBirth || null, gender || null]
    );

    // Create patient profile
    const profileId = generateId();
    await query(
      `INSERT INTO patient_profiles (id, user_id, tenant_id) VALUES (?, ?, ?)`,
      [profileId, id, tenantId || null]
    );

    const payload = { userId: id, email, role: 'patient', tenantId: tenantId || null };
    const accessToken  = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Store refresh token
    const tokenId = generateId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
      [tokenId, id, refreshToken, expiresAt]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { accessToken, refreshToken, user: { id, email, role: 'patient', firstName, lastName } },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const rows = await query<User[]>(
      `SELECT id, tenant_id, role, email, password_hash, first_name, last_name, is_active FROM users WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) throw createError('Invalid credentials', 401);

    const user = rows[0] as unknown as (User & { password_hash: string });
    if (!user.is_active) throw createError('Account is deactivated', 403);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw createError('Invalid credentials', 401);


    await query(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [user.id]);

    const payload = { userId: user.id, email: user.email, role: user.role, tenantId: user.tenant_id };
    const accessToken  = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const tokenId   = generateId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
      [tokenId, user.id, refreshToken, expiresAt]
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken, refreshToken,
        user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name, tenantId: user.tenant_id },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw createError('Refresh token required', 400);

    const payload = verifyRefreshToken(token);

    const rows = await query<Array<{ id: string; is_revoked: number }>>(
      `SELECT id, is_revoked FROM refresh_tokens WHERE token = ? AND user_id = ?`,
      [token, payload.userId]
    );

    if (rows.length === 0 || rows[0].is_revoked) throw createError('Invalid refresh token', 401);

    // Revoke old token
    await query(`UPDATE refresh_tokens SET is_revoked = 1 WHERE id = ?`, [rows[0].id]);

    const newAccess  = signAccessToken(payload);
    const newRefresh = signRefreshToken(payload);

    const tokenId   = generateId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
      [tokenId, payload.userId, newRefresh, expiresAt]
    );

    res.json({ success: true, message: 'Token refreshed', data: { accessToken: newAccess, refreshToken: newRefresh } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await query(`UPDATE refresh_tokens SET is_revoked = 1 WHERE token = ?`, [token]);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const rows = await query<User[]>(
      `SELECT id, tenant_id, role, email, first_name, last_name, phone, date_of_birth, gender, avatar_url, is_active, is_verified, created_at
       FROM users WHERE id = ?`,
      [userId]
    );
    if (!rows.length) throw createError('User not found', 404);
    res.json({ success: true, message: 'Profile fetched', data: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    const rows = await query<Array<{ password_hash: string }>>(
      `SELECT password_hash FROM users WHERE id = ?`, [userId]
    );
    if (!rows.length) throw createError('User not found', 404);

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) throw createError('Current password is incorrect', 400);

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await query(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, userId]);

    // Revoke all refresh tokens
    await query(`UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ?`, [userId]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}
