export interface StorageService {
  uploadFile(file: File | Blob, filename: string): Promise<{ url: string; key: string }>;
  deleteFile(key: string): Promise<boolean>;
  getUrl(key: string): string;
}

/**
 * Local Development Storage Service
 * Simulates storage by resolving public paths or data URLs
 * Ready to be swapped with S3StorageService or R2StorageService
 */
export class LocalStorageService implements StorageService {
  async uploadFile(file: File | Blob, filename: string): Promise<{ url: string; key: string }> {
    const key = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    // In local development, we return a fallback static URL or placeholder
    return {
      url: `/uploads/${filename}`,
      key,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    console.log(`[Storage] Deleted file key: ${key}`);
    return true;
  }

  getUrl(key: string): string {
    return `/${key}`;
  }
}

export const storage: StorageService = new LocalStorageService();
