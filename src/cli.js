const fs = require("fs");
const path = require("path");

const SCALES = [1, 1.5, 2, 3, 4, 5];

function printUsage() {
  const usage = `Usage: hqimgresize <input> <out_dir> <baseWidth>

Generate mobile image variants from an original image.

Arguments:
  <input>      Path to the source image
  <out_dir>    Base output directory (a subfolder named after the image is created inside)
  <baseWidth>  1x width in pixels (positive integer)

Output:
  <out_dir>/<name>/<name><ext>        (1x)
  <out_dir>/<name>/<name>@1.5x<ext>   (1.5x)
  <out_dir>/<name>/<name>@2x<ext>     (2x)
  <out_dir>/<name>/<name>@3x<ext>     (3x)
  <out_dir>/<name>/<name>@4x<ext>     (4x)
  <out_dir>/<name>/<name>@5x<ext>     (5x)

All variants are resized directly from the original image.
`;
  console.log(usage);
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

async function run(argv) {
  const args = argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    printUsage();
    process.exit(0);
  }

  if (args.length !== 3) {
    printUsage();
    fail("expected exactly 3 arguments: <input> <out_dir> <baseWidth>");
  }

  const [inputArg, outDirArg, baseWidthArg] = args;
  const inputPath = path.resolve(inputArg);
  const outDir = path.resolve(outDirArg);

  if (!/^\d+$/.test(baseWidthArg)) {
    fail("baseWidth must be a positive integer");
  }
  const baseWidth = Number(baseWidthArg);
  if (!Number.isInteger(baseWidth) || baseWidth <= 0) {
    fail("baseWidth must be a positive integer");
  }

  let stat;
  try {
    stat = fs.statSync(inputPath);
  } catch (err) {
    fail(`cannot read input file: ${inputPath}`);
  }
  if (!stat.isFile()) {
    fail(`input is not a file: ${inputPath}`);
  }

  const parsed = path.parse(inputPath);
  const stem = parsed.name;
  const ext = parsed.ext;
  if (!stem) {
    fail("input file must have a name");
  }

  const outputDir = path.join(outDir, stem);

  try {
    const { resizeAll } = require("./resize");
    await resizeAll({
      inputPath,
      outputDir,
      stem,
      ext,
      baseWidth,
      scales: SCALES,
    });
  } catch (err) {
    fail(err && err.message ? err.message : String(err));
  }
}

module.exports = { run };
