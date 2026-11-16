const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const FORMAT_TO_EXT = {
  jpeg: ".jpg",
  jpg: ".jpg",
  png: ".png",
  webp: ".webp",
  gif: ".gif",
  avif: ".avif",
  tiff: ".tiff",
  tif: ".tiff",
  heif: ".heif",
  heic: ".heic",
};

function formatScale(scale) {
  return String(scale);
}

function extFromFormat(format) {
  if (!format) return null;
  return FORMAT_TO_EXT[format] || `.${format}`;
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
    throw new Error(
      `unsupported or unreadable image "${inputPath}": ${err && err.message ? err.message : String(err)}`
    );
  }

  const srcWidth = metadata.width;
  const srcHeight = metadata.height;
  if (!srcWidth || !srcHeight) {
    throw new Error(`could not determine source image dimensions for "${inputPath}"`);
  }

  const outputExt = ext || extFromFormat(metadata.format);
  if (!outputExt) {
    throw new Error(
      `cannot determine output file extension for "${inputPath}" (format: ${metadata.format || "unknown"}); provide an input file with an extension`
    );
  }

  try {
    fs.mkdirSync(outputDir, { recursive: true });
  } catch (err) {
    throw new Error(
      `cannot create output directory "${outputDir}": ${err && err.message ? err.message : String(err)}`
    );
  }

  const tasks = scales.map(async (scale) => {
    const targetWidth = Math.round(baseWidth * scale);
    const targetHeight = Math.max(1, Math.round((srcHeight * targetWidth) / srcWidth));

    if (targetWidth > srcWidth || targetHeight > srcHeight) {
      console.warn(
        `Warning: ${formatScale(scale)}x (${targetWidth}x${targetHeight}) upscales source (${srcWidth}x${srcHeight})`
      );
    }

    const fileName = outputFileName(stem, outputExt, scale);
    const outPath = path.join(outputDir, fileName);

    await sharp(originalBuffer)
      .resize(targetWidth, targetHeight)
      .toFile(outPath);

    return outPath;
  });

  return Promise.all(tasks);
}

module.exports = { resizeAll };
