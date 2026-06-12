import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET } from '../config/s3';
import { generateId } from '../utils/helpers';

export async function uploadFile(
  buffer: Buffer,
  mimeType: string,
  folder: string,
  originalName: string
): Promise<{ key: string; url: string }> {
  const ext = originalName.split('.').pop();
  const key = `${folder}/${generateId()}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket:      S3_BUCKET,
      Key:         key,
      Body:        buffer,
      ContentType: mimeType,
    })
  );

  const url = `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
  return { key, url };
}

export async function getSignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
}
