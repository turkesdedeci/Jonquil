const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const TARGET_EXTS = new Set([".jpg", ".jpeg", ".png"]);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function optimizeImage(filePath, maxWidth, quality) {
  const ext = path.extname(filePath).toLowerCase();
  if (!TARGET_EXTS.has(ext)) return;

  const image = sharp(filePath);
  const meta = await image.metadata();
  if (!meta.width || !meta.height) return;

  const shouldResize = meta.width > maxWidth;
  const pipeline = shouldResize ? image.resize({ width: maxWidth }) : image;

  if (ext === ".jpg" || ext === ".jpeg") {
    await pipeline.jpeg({ quality, mozjpeg: true }).toFile(filePath + ".opt");
  } else if (ext === ".png") {
    await pipeline.png({ compressionLevel: 9, palette: true, quality }).toFile(filePath + ".opt");
  }

  await fs.rename(filePath + ".opt", filePath);
}

async function optimizeDir(dir, maxWidth, quality) {
  const files = await walk(dir);
  for (const file of files) {
    await optimizeImage(file, maxWidth, quality);
  }
}

async function main() {
  const root = process.argv[2];
  const maxWidth = Number(process.argv[3] || "2000");
  const quality = Number(process.argv[4] || "75");

  if (!root) {
    console.error("Usage: node scripts/optimize-images.js <dir> [maxWidth] [quality]");
    process.exit(1);
  }

  await optimizeDir(root, maxWidth, quality);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
