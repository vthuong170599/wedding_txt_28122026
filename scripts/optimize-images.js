import sharp from 'sharp';
import { readdir, stat, rename, unlink } from 'fs/promises';
import { join, extname, dirname, basename } from 'path';

const IMAGE_DIR = 'client/public/image';
const MAX_WIDTH = 1920;
const QUALITY = 80;

async function optimizeImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  try {
    const info = await sharp(filePath).metadata();

    // Skip if already optimized (width <= MAX_WIDTH)
    if (info.width <= MAX_WIDTH) {
      console.log(`✓ Skipped (already optimized): ${filePath}`);
      return;
    }

    const tempPath = join(dirname(filePath), `temp-${basename(filePath)}`);
    const originalSize = (await stat(filePath)).size;

    await sharp(filePath)
      .resize(MAX_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: QUALITY, progressive: true })
      .toFile(tempPath);

    const optimizedSize = (await stat(tempPath)).size;
    const savedPercent = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

    // Replace original with optimized
    await unlink(filePath);
    await rename(tempPath, filePath);

    console.log(`✓ Optimized: ${filePath}`);
    console.log(`  ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(optimizedSize / 1024 / 1024).toFixed(2)}MB (saved ${savedPercent}%)`);
  } catch (error) {
    console.error(`✗ Error optimizing ${filePath}:`, error.message);
  }
}

async function processDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      await optimizeImage(fullPath);
    }
  }
}

console.log('🖼️  Starting image optimization...\n');
await processDirectory(IMAGE_DIR);
console.log('\n✅ Image optimization complete!');
