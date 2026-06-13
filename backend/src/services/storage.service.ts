import fs from 'fs';
import path from 'path';
import { generateId } from '../utils/helpers';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export function saveFile(
  buffer: Buffer,
  folder: string,
  originalName: string,
  baseUrl: string
): { key: string; url: string } {
  const ext = path.extname(originalName) || '.bin';
  const fileName = `${generateId()}${ext}`;
  const dir = path.join(UPLOADS_DIR, folder);

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, buffer);

  const key = `${folder}/${fileName}`;
  const url = `${baseUrl}/uploads/${key}`;
  return { key, url };
}

export function deleteFile(key: string): void {
  const filePath = path.join(UPLOADS_DIR, key);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
