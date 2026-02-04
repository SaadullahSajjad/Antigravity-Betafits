// In-memory file storage (for development/testing)
// In production, use cloud storage (S3, Cloudinary, Vercel Blob, etc.)

interface FileData {
    buffer: Buffer;
    filename: string;
    mimeType: string;
}

const fileStorage = new Map<string, FileData>();

export function storeFile(fileId: string, data: FileData): void {
    fileStorage.set(fileId, data);
}

export function getFile(fileId: string): FileData | undefined {
    return fileStorage.get(fileId);
}

export function deleteFile(fileId: string): void {
    fileStorage.delete(fileId);
}
