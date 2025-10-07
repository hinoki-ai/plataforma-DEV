import { access, mkdir, readFile, writeFile } from "fs/promises";
import { constants } from "fs";
import { join } from "path";

/**
 * Cornerstone: minimal file lock registry for uploaded assets.
 *
 * - Stores a small JSON index at public/uploads/.cornerstone.json
 * - Prevents deletion of files marked as locked
 * - Allows explicit lock/unlock by API or post-upload flag
 */
export interface CornerstoneEntry {
  filename: string;
  locked: boolean;
  note?: string;
  updatedAt: string; // ISO string
}

interface CornerstoneIndex {
  entries: CornerstoneEntry[];
  updatedAt: string;
}

const uploadsDir = join(process.cwd(), "public", "uploads");
const indexPath = join(uploadsDir, ".cornerstone.json");

async function ensureUploadsDir(): Promise<void> {
  await mkdir(uploadsDir, { recursive: true });
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function loadIndex(): Promise<CornerstoneIndex> {
  await ensureUploadsDir();
  if (!(await fileExists(indexPath))) {
    const empty: CornerstoneIndex = {
      entries: [],
      updatedAt: new Date().toISOString(),
    };
    await writeFile(indexPath, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
  const raw = await readFile(indexPath, "utf8");
  try {
    const parsed = JSON.parse(raw) as CornerstoneIndex;
    if (!parsed || !Array.isArray(parsed.entries)) {
      throw new Error("Invalid index");
    }
    return parsed;
  } catch {
    // Reset on corruption
    const empty: CornerstoneIndex = {
      entries: [],
      updatedAt: new Date().toISOString(),
    };
    await writeFile(indexPath, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
}

async function saveIndex(idx: CornerstoneIndex): Promise<void> {
  idx.updatedAt = new Date().toISOString();
  await writeFile(indexPath, JSON.stringify(idx, null, 2), "utf8");
}

export async function isCornerstoneLocked(filename: string): Promise<boolean> {
  const idx = await loadIndex();
  const entry = idx.entries.find((e) => e.filename === filename);
  return entry?.locked === true;
}

export async function lockCornerstone(
  filename: string,
  note?: string,
): Promise<void> {
  const idx = await loadIndex();
  const now = new Date().toISOString();
  const existing = idx.entries.find((e) => e.filename === filename);
  if (existing) {
    existing.locked = true;
    existing.note = note;
    existing.updatedAt = now;
  } else {
    idx.entries.push({ filename, locked: true, note, updatedAt: now });
  }
  await saveIndex(idx);
}

export async function unlockCornerstone(filename: string): Promise<void> {
  const idx = await loadIndex();
  const existing = idx.entries.find((e) => e.filename === filename);
  if (existing) {
    existing.locked = false;
    existing.updatedAt = new Date().toISOString();
  }
  await saveIndex(idx);
}

export async function listCornerstone(): Promise<CornerstoneEntry[]> {
  const idx = await loadIndex();
  return idx.entries.slice();
}
