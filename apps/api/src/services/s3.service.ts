import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/* ------------------------------------------------------------------ */
/*  S3 Client Singleton                                                */
/* ------------------------------------------------------------------ */

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET_NAME;

/* ------------------------------------------------------------------ */
/*  Folder Prefixes                                                    */
/*  templates/<orgId>/   — uploaded .docx templates                    */
/*  certificates/<orgId>/ — generated certificate PDFs                 */
/*  logos/<orgId>/        — organization logos                          */
/* ------------------------------------------------------------------ */

export type S3Folder = 'templates' | 'certificates' | 'logos';

/**
 * Build the full S3 object key.
 * Example: templates/665a…/1713100000000-abc.docx
 */
export function buildKey(folder: S3Folder, orgId: string, filename: string): string {
  return `${folder}/${orgId}/${filename}`;
}

/* ------------------------------------------------------------------ */
/*  Upload                                                             */
/* ------------------------------------------------------------------ */

/**
 * Upload a file buffer to S3.
 * Returns the full S3 key that was written.
 */
export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return key;
}

/**
 * Convenience: upload to a specific folder with an auto-generated unique filename.
 */
export async function uploadToFolder(
  folder: S3Folder,
  orgId: string,
  originalFilename: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = originalFilename.includes('.')
    ? originalFilename.substring(originalFilename.lastIndexOf('.'))
    : '';
  const filename = `${uniqueSuffix}${ext}`;
  const key = buildKey(folder, orgId, filename);
  await uploadFile(key, body, contentType);
  return key;
}

/* ------------------------------------------------------------------ */
/*  Download / Read                                                     */
/* ------------------------------------------------------------------ */

/**
 * Download a file from S3 as a Buffer.
 * Useful for reading .docx templates to extract placeholders.
 */
export async function getFileBuffer(key: string): Promise<Buffer> {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
  // Convert readable stream to buffer
  const chunks: Uint8Array[] = [];
  const stream = response.Body as NodeJS.ReadableStream;
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Get a pre-signed URL for temporary read access (default 1 hour).
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

/**
 * Get the public URL (works only if the bucket/object has public-read ACL).
 * For private buckets use getSignedDownloadUrl instead.
 */
export function getPublicUrl(key: string): string {
  return `https://${BUCKET}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
}

/* ------------------------------------------------------------------ */
/*  Delete                                                             */
/* ------------------------------------------------------------------ */

/**
 * Delete a single file from S3.
 */
export async function deleteFile(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

/**
 * Delete all files under a given prefix (folder).
 * Example: deleteFolder('templates/665a…/') removes all templates for that org.
 */
export async function deleteFolder(prefix: string): Promise<number> {
  let deleted = 0;
  let continuationToken: string | undefined;

  do {
    const list = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    if (list.Contents) {
      for (const obj of list.Contents) {
        if (obj.Key) {
          await deleteFile(obj.Key);
          deleted++;
        }
      }
    }

    continuationToken = list.NextContinuationToken;
  } while (continuationToken);

  return deleted;
}

/* ------------------------------------------------------------------ */
/*  Replace / Update                                                    */
/* ------------------------------------------------------------------ */

/**
 * Replace a file: delete the old key and upload a new one.
 * Returns the new S3 key.
 */
export async function replaceFile(
  oldKey: string,
  folder: S3Folder,
  orgId: string,
  originalFilename: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  // Upload new file first (so we don't lose data if upload fails)
  const newKey = await uploadToFolder(folder, orgId, originalFilename, body, contentType);

  // Delete old file (non-blocking, best-effort)
  try {
    await deleteFile(oldKey);
  } catch (err) {
    console.warn(`[S3] Could not delete old file ${oldKey}:`, err);
  }

  return newKey;
}

/* ------------------------------------------------------------------ */
/*  Utility                                                            */
/* ------------------------------------------------------------------ */

/**
 * Check whether a key exists in S3.
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
}