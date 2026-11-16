# hq-img-resizer

Micro CLI to generate multiple resolution variants of an image from the original source using [sharp](https://sharp.pixelplumbing.com/).

## Install

Install from git as a dev dependency:

```bash
npm i -D git+https://github.com/<user>/<repo>.git
# or a specific tag/commit
npm i -D git+https://github.com/<user>/<repo>.git#v0.1.0
```

This exposes the `hqimgresize` command (e.g. via `npx hqimgresize ...` or npm scripts).

## Usage

```bash
hqimgresize <input> <out_dir> <baseWidth>
```

- `<input>`: path to the source image
- `<out_dir>`: base output directory
- `<baseWidth>`: **1x width in pixels** (positive integer). Heights are calculated proportionally from the source aspect ratio.

Generated scales: **1x, 1.5x, 2x, 3x, 4x, 5x**.

A subfolder named after the input file is created inside `<out_dir>`:

- `1x` → `<out_dir>/<name>/<name><ext>`
- other scales → `<out_dir>/<name>/<name>@<scale>x<ext>` (e.g. `@1.5x`, `@2x`)

The original file format/extension is preserved. **Every variant is resized directly from the original image** (not from another resized output).

## Example

```bash
hqimgresize ./assets/icon.png ./out 128
```

Produces:

```text
out/
  icon/
    icon.png        # 1x   (128w)
    icon@1.5x.png   # 1.5x (192w)
    icon@2x.png     # 2x   (256w)
    icon@3x.png     # 3x   (384w)
    icon@4x.png     # 4x   (512w)
    icon@5x.png     # 5x   (640w)
```

(Heights scale proportionally to the source.)

## Notes

- Requires Node.js >= 18.
- Uses `sharp` (libvips). On most platforms it installs prebuilt binaries via npm; see [sharp installation](https://sharp.pixelplumbing.com/install) if you encounter native install issues.
- If a target size exceeds the source dimensions, the image is still generated and a warning is printed to stderr.

## License

This project is licensed under the [MIT License](LICENSE).

This project depends on [sharp](https://sharp.pixelplumbing.com/) (Apache License 2.0) for image processing. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for third-party license information.
