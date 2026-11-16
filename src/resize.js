const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

function formatScale(scale) {
  return Number.isInteger(scale) ? String(scale) : String(scale);
}

function outputFileName(stem, ext, scale) {
  if (scale === 1) {
    return `${stem}${ext}`;
  }
  return `${stem}@${formatScale(scale)}x${ext}`;
}

async function resizeAll({ inputPath, outputDir, stem, ext, baseWidth, scales }) {
  const originalBuffer = fs.readFileSync(inputPath);

  let metadata;
  try {
    metadata = await sharp(originalBuffer).metadata();
  } catch (err) {
    throw new Error(`unsupported or unreadable image: ${inputPath}`);
  }

  const srcWidth = metadata.width;
  const srcHeight = metadata.height;
  if (!srcWidth || !srcHeight) {
    throw new Error("could not determine source image dimensions");
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const tasks = scales.map(async (scale) => {
    const targetWidth = Math.round(baseWidth * scale);
    const targetHeight = Math.max(1, Math.round((srcHeight * targetWidth) / srcWidth));

    if (targetWidth > srcWidth || targetHeight > srcHeight) {
      console.warn(
        `Warning: ${formatScale(scale)}x (${targetWidth}x${targetHeight}) upscales source (${srcWidth}x${srcHeight})`
      );
    }

    const fileName = outputFileName(stem, ext, scale);
    const outPath = path.join(outputDir, fileName);

    await sharp(originalBuffer)
      .resize(targetWidth, targetHeight)
      .toFile(outPath);

    return outPath;
  });

  const outputs = await Promise.all(tasks);
  return outputs;
}

module.exports = { resizeAll };
