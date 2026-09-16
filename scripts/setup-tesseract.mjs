/**
 * Regenerates self-hosted Tesseract.js assets into public/tesseract/.
 * Runs automatically on `npm install` (postinstall), including Vercel builds,
 * so the ~46MB of worker/WASM/language binaries never needs to be committed.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nodeModules = join(root, "node_modules");
const target = join(root, "public", "tesseract");
const coreDir = join(target, "core");
const langDir = join(target, "lang");

const TRAINEDDATA_URLS = [
  "https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int/eng.traineddata.gz",
  "https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz",
];

mkdirSync(coreDir, { recursive: true });
mkdirSync(langDir, { recursive: true });

// 1. Worker script
copyFileSync(
  join(nodeModules, "tesseract.js", "dist", "worker.min.js"),
  join(target, "worker.min.js")
);

// 2. WASM core engine files
for (const file of readdirSync(join(nodeModules, "tesseract.js-core"))) {
  if (file.endsWith(".js") || file.endsWith(".wasm")) {
    copyFileSync(
      join(nodeModules, "tesseract.js-core", file),
      join(coreDir, file)
    );
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
      const { writeFileSync } = await import("node:fs");
      writeFileSync(traineddataPath, buffer);
      downloaded = true;
      console.log(`[setup-tesseract] downloaded eng.traineddata.gz from ${url}`);
      break;
    } catch {
      // try next mirror
    }
  }
  if (!downloaded) {
    console.warn(
      "[setup-tesseract] WARNING: could not download eng.traineddata.gz — OCR will fall back to CDN at runtime."
    );
  }
}

console.log("[setup-tesseract] done.");
