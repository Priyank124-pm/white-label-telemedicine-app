import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}

export function generatePrescriptionNo(): string {
  const date = new Date();
  const y  = date.getFullYear();
  const m  = String(date.getMonth() + 1).padStart(2, '0');
  const d  = String(date.getDate()).padStart(2, '0');
  const rnd = Math.floor(10000 + Math.random() * 90000);
  return `RX-${y}${m}${d}-${rnd}`;
}

export function generateInvoiceNo(): string {
  const date = new Date();
  const y  = date.getFullYear();
  const m  = String(date.getMonth() + 1).padStart(2, '0');
  const rnd = Math.floor(100000 + Math.random() * 900000);
  return `INV-${y}${m}-${rnd}`;
}

export function paginate(page = 1, limit = 10): { offset: number; limit: number; page: number } {
  const p = Math.max(1, page);
  const l = Math.min(100, Math.max(1, limit));
  return { offset: (p - 1) * l, limit: l, page: p };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function sanitizeUser(user: Record<string, unknown>) {
  const { password_hash, ...safe } = user;
  void password_hash;
  return safe;
}
