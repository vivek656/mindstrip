import { put } from '@vercel/blob';

/**
 * Checks if Vercel Blob storage is configured via BLOB_READ_WRITE_TOKEN.
 * On Vercel, this is auto-injected when you create a Blob store in the dashboard.
 */
export function isBlobConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN &&
    process.env.BLOB_READ_WRITE_TOKEN.trim().length > 0
  );
}

export interface BlobUploadResult {
  url: string;
  isPermanent: boolean;
  provider: 'vercel-blob' | 'direct-url' | 'base64';
}

/**
 * Persists an image (from a remote CDN URL or a Base64 string) into our own
 * permanent Vercel Blob CDN.
 * 
 * Benefits:
 * 1. Zero dependence on third-party uptime or cache eviction.
 * 2. High-speed global edge CDN distribution under your own Vercel storage.
 * 3. Keeps MongoDB documents tiny (<1KB) by storing only the permanent clean URL.
 * 4. Graceful fallback if Vercel Blob is not yet linked in local dev.
 */
export async function persistToPermanentBlob(
  source: string,
  filenamePrefix = 'comic-page'
): Promise<BlobUploadResult> {
  if (!source) {
    return { url: '', isPermanent: false, provider: 'direct-url' };
  }

  // If Vercel Blob is not configured, gracefully return the original source
  if (!isBlobConfigured()) {
    const isBase64 = source.startsWith('data:') || (!source.startsWith('http') && source.length > 500);
    return {
      url: source,
      isPermanent: false,
      provider: isBase64 ? 'base64' : 'direct-url'
    };
  }

  try {
    let buffer: Buffer;
    let contentType = 'image/jpeg';

    if (source.startsWith('data:') || (!source.startsWith('http') && source.length > 500)) {
      // Base64 image payload (e.g. from Meta Muse Image API)
      const base64Data = source.includes('base64,')
        ? source.split('base64,')[1]
        : source;

      if (source.startsWith('data:image/webp')) contentType = 'image/webp';
      else if (source.startsWith('data:image/png')) contentType = 'image/png';
      else contentType = 'image/jpeg';

      buffer = Buffer.from(base64Data, 'base64');
    } else if (source.startsWith('http')) {
      // Remote image URL (e.g. from Fireworks or Pollinations)
      // Download bytes to permanently archive into our own Blob store
      const imgRes = await fetch(source, {
        headers: { 'User-Agent': 'MindStrip-Blob-Archiver/1.0' }
      });

      if (!imgRes.ok) {
        console.warn(`Failed to fetch image from ${source} for Blob archival: ${imgRes.status}`);
        return { url: source, isPermanent: false, provider: 'direct-url' };
      }

      const mime = imgRes.headers.get('content-type');
      if (mime) contentType = mime.split(';')[0].trim();
      const arrayBuf = await imgRes.arrayBuffer();
      buffer = Buffer.from(arrayBuf);
    } else {
      return { url: source, isPermanent: false, provider: 'direct-url' };
    }

    const ext = contentType.includes('webp') ? 'webp' : contentType.includes('png') ? 'png' : 'jpg';
    const cleanPrefix = filenamePrefix.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 30);
    const pathname = `episodes/${cleanPrefix}-${Date.now()}.${ext}`;

    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType
    });

    return {
      url: blob.url,
      isPermanent: true,
      provider: 'vercel-blob'
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('Vercel Blob persistence non-fatal warning:', msg);
    // Graceful fallback to original source
    return {
      url: source,
      isPermanent: false,
      provider: source.startsWith('http') ? 'direct-url' : 'base64'
    };
  }
}
