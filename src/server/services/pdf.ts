import { promises as fs } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "library");

export async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function savePdfFile(
  fileName: string,
  buffer: Buffer,
): Promise<string> {
  await ensureUploadDir();

  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storedName = `${timestamp}-${safeName}`;
  const filePath = path.join(UPLOAD_DIR, storedName);

  await fs.writeFile(filePath, buffer);

  return `uploads/library/${storedName}`;
}

export async function deletePdfFile(relativePath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), "public", relativePath);
  try {
    await fs.unlink(fullPath);
  } catch {
    // File may already be deleted — ignore
  }
}

export async function saveSchedulePhoto(
  fileName: string,
  buffer: Buffer,
): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads", "schedules");
  await fs.mkdir(dir, { recursive: true });

  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storedName = `${timestamp}-${safeName}`;
  const filePath = path.join(dir, storedName);

  await fs.writeFile(filePath, buffer);

  return `uploads/schedules/${storedName}`;
}
