import { Response, NextFunction } from 'express';
import { AuthRequest, Role } from '../types';

export const PERMISSIONS: Record<string, Role[]> = {
  // Tenant management
  'tenant:create':  ['super_admin'],
  'tenant:read':    ['super_admin'],
  'tenant:update':  ['super_admin'],
  'tenant:delete':  ['super_admin'],

  // Doctor management
  'doctor:create':  ['super_admin'],
  'doctor:read':    ['super_admin', 'doctor', 'patient', 'pharmacy'],
  'doctor:update':  ['super_admin', 'doctor'],
  'doctor:delete':  ['super_admin'],

  // Patient management
  'patient:create': ['super_admin', 'doctor'],
  'patient:read':   ['super_admin', 'doctor', 'patient', 'pharmacy'],
  'patient:update': ['super_admin', 'doctor', 'patient'],
  'patient:delete': ['super_admin'],

  // Appointment management
  'appointment:create': ['super_admin', 'doctor', 'patient'],
  'appointment:read':   ['super_admin', 'doctor', 'patient'],
  'appointment:update': ['super_admin', 'doctor', 'patient'],
  'appointment:delete': ['super_admin', 'doctor'],

  // Prescription management
  'prescription:create': ['doctor'],
  'prescription:read':   ['super_admin', 'doctor', 'patient', 'pharmacy'],
  'prescription:update': ['doctor'],
  'prescription:delete': ['super_admin', 'doctor'],

  // Medicine management
  'medicine:create': ['super_admin'],
  'medicine:read':   ['super_admin', 'doctor', 'patient', 'pharmacy'],
  'medicine:update': ['super_admin'],
  'medicine:delete': ['super_admin'],

  // Report management
  'report:create': ['doctor'],
  'report:read':   ['super_admin', 'doctor', 'patient'],
  'report:update': ['doctor'],
  'report:delete': ['super_admin', 'doctor'],

  // Referral management
  'referral:create': ['doctor'],
  'referral:read':   ['super_admin', 'doctor', 'patient'],
  'referral:update': ['doctor'],

  // Pharmacy operations
  'dispensing:create': ['pharmacy'],
  'dispensing:read':   ['super_admin', 'pharmacy', 'doctor'],
  'invoice:create':    ['pharmacy'],
  'invoice:read':      ['super_admin', 'pharmacy', 'patient'],

  // Analytics
  'analytics:read': ['super_admin'],
};

export function authorize(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
}

export function checkPermission(permission: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const allowed = PERMISSIONS[permission] || [];
    if (!allowed.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
}
