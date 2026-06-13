import jwt from 'jsonwebtoken';

const JWT_SECRET          = process.env.JWT_SECRET          || 'change-this-secret';
const JWT_REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET  || 'change-this-refresh-secret';
const JWT_EXPIRES_IN      = process.env.JWT_EXPIRES_IN      || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JwtPayload {
  userId:   string;
  email:    string;
  role:     string;
  tenantId: string | null;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & JwtPayload;
  return { userId: decoded.userId, email: decoded.email, role: decoded.role, tenantId: decoded.tenantId };
}

export function verifyRefreshToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as jwt.JwtPayload & JwtPayload;
  // Strip JWT-reserved fields (exp, iat, nbf) so re-signing doesn't conflict with expiresIn option
  return { userId: decoded.userId, email: decoded.email, role: decoded.role, tenantId: decoded.tenantId };
}
