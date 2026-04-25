// ============================================================================
// Blob Store Abstraction — Vercel Blob with dummy fallback
// ============================================================================

const isDummy = () => process.env.USE_DUMMY !== "false";

export interface BlobFile {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

// In-memory store for dummy mode
const memoryBlobs: Map<string, { data: Buffer; meta: BlobFile }> = new Map();

export async function uploadFile(
  filename: string,
  buffer: Buffer
): Promise<string> {
  if (isDummy()) {
    const url = `/api/files/dummy-${Date.now()}-${filename}`;
    memoryBlobs.set(url, {
      data: buffer,
      meta: {
        url,
        pathname: filename,
        size: buffer.length,
        uploadedAt: new Date().toISOString(),
      },
    });
    return url;
  }

  const { put } = await import("@vercel/blob");
  const blob = await put(filename, buffer, { access: "public" });
  return blob.url;
}

export async function listFiles(prefix?: string): Promise<BlobFile[]> {
  if (isDummy()) {
    const files = Array.from(memoryBlobs.values()).map((b) => b.meta);
    if (prefix) {
      return files.filter((f) => f.pathname.startsWith(prefix));
    }
    return files;
  }

  const { list } = await import("@vercel/blob");
  const result = await list({ prefix });
  return result.blobs.map((b) => ({
    url: b.url,
    pathname: b.pathname,
    size: b.size,
    uploadedAt: b.uploadedAt.toISOString(),
  }));
}

export async function deleteFile(url: string): Promise<void> {
  if (isDummy()) {
    memoryBlobs.delete(url);
    return;
  }
  const { del } = await import("@vercel/blob");
  await del(url);
}
