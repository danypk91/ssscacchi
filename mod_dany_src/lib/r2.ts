import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

const CDN_BASE = (import.meta.env.PUBLIC_CDN_URL || '').replace(/\/$/, '');
const BUCKET = 'santasabina';

let _s3: S3Client | null = null;

function envVar(name: string): string {
  return ((process.env[name] || import.meta.env[name]) ?? '').trim();
}

function getS3() {
  if (!_s3) {
    _s3 = new S3Client({
      region: 'auto',
      endpoint: envVar('R2_S3_ENDPOINT'),
      credentials: {
        accessKeyId: envVar('R2_ACCESS_KEY_ID'),
        secretAccessKey: envVar('R2_SECRET_ACCESS_KEY'),
      },
    });
  }
  return _s3;
}

/** List images in an R2 folder and return absolute CDN URLs */
export async function scanGallery(prefix: string): Promise<string[]> {
  if (!prefix) return [];
  const cleanPrefix = prefix.replace(/^\//, '');
  try {
    const res = await getS3().send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: cleanPrefix })
    );
    return (res.Contents ?? [])
      .map((obj) => obj.Key!)
      .filter((key) => /\.(jpg|jpeg|png|webp|gif)$/i.test(key))
      .sort()
      .map((key) => `${CDN_BASE}/${key}`);
  } catch (err) {
    console.error('[scanGallery] Failed to list', cleanPrefix, err);
    return [];
  }
}

/** List all "folders" at a given prefix level (e.g. list years or albums) */
export async function listFolders(prefix: string): Promise<string[]> {
  const cleanPrefix = prefix.replace(/^\//, '').replace(/\/?$/, '/');
  try {
    const res = await getS3().send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: cleanPrefix, Delimiter: '/' })
    );
    return (res.CommonPrefixes ?? [])
      .map((p) => p.Prefix!)
      .sort();
  } catch (err) {
    console.error('[listFolders] Failed to list', cleanPrefix, err);
    return [];
  }
}