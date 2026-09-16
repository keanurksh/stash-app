/**
 * Regenerates self-hosted Tesseract.js assets into public/tesseract/.
 * Runs automatically on `npm install` (postinstall), including Vercel builds,
 * so the ~46MB of worker/WASM/language binaries never needs to be committed.
 *
 * The script is defensive by design: every filesystem operation is guarded,
 * missing sources only produce warnings, and the script always exits 0 so
 * `npm install` / Vercel builds never fail because of it.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TAG = "[setup-tesseract]";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nodeModules = join(root, "node_modules");
const target = join(root, "public", "tesseract");
const coreDir = join(target, "core");
const langDir = join(target, "lang");

const TRAINEDDATA_URLS = [
  "https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int/eng.traineddata.gz",
  "https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz",
];

function ensureDir(dir) {
  try {
    mkdirSync(dir, { recursive: true });
    return true;
  } catch (error) {
    console.warn(`${TAG} WARNING: cannot create directory ${dir}:`, error?.message ?? error);
    return false;
  }
}

function safeCopy(sourcePath, destPath) {
  if (!existsSync(sourcePath)) {
    console.warn(`${TAG} WARNING: source not found, skipping: ${sourcePath}`);
    return false;
  }
  try {
    copyFileSync(sourcePath, destPath);
    return true;
  } catch (error) {
    console.warn(`${TAG} WARNING: failed to copy ${sourcePath}:`, error?.message ?? error);
    return false;
  }
}

try {
  // 0. Pastikan direktori tujuan ada sebelum menyalin file
  ensureDir(join(root, "public"));
  ensureDir(target);
  ensureDir(coreDir);
  ensureDir(langDir);

  // 1. Worker script
  safeCopy(
    join(nodeModules, "tesseract.js", "dist", "worker.min.js"),
    join(target, "worker.min.js")
  );

  // 2. WASM core engine files
  const coreSourceDir = join(nodeModules, "tesseract.js-core");
  if (!existsSync(coreSourceDir)) {
    console.warn(`${TAG} WARNING: source not found, skipping: ${coreSourceDir}`);
  } else {
    let entries = [];
    try {
      entries = readdirSync(coreSourceDir);
    } catch (error) {
      console.warn(`${TAG} WARNING: cannot read ${coreSourceDir}:`, error?.message ?? error);
    }
    for (const file of entries) {
      if (file.endsWith(".js") || file.endsWith(".wasm")) {
        safeCopy(join(coreSourceDir, file), join(coreDir, file));
      }
    }
  }

  // 3. English traineddata (download once, skip if already present)
  const traineddataPath = join(langDir, "eng.traineddata.gz");
  if (!existsSync(traineddataPath)) {
    let downloaded = false;
    for (const url of TRAINEDDATA_URLS) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length < 1_000_000) continue;
        writeFileSync(traineddataPath, buffer);
        downloaded = true;
        console.log(`${TAG} downloaded eng.traineddata.gz from ${url}`);
        break;
      } catch {
        // try next mirror
      }
    }
    if (!downloaded) {
      console.warn(
        `${TAG} WARNING: could not download eng.traineddata.gz — OCR will fall back to CDN at runtime.`
      );
    }
  }

  console.log(`${TAG} done.`);
  process.exit(0);
} catch (error) {
  // Jangan pernah gagalkan npm install / build Vercel karena skrip ini
  console.warn(`${TAG} WARNING: setup skipped due to unexpected error:`, error?.message ?? error);
  process.exit(0);
}
