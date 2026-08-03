const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "src", "assets", "optimized", "home");

const images = [
  ["hero", "src/assets/ass.png"],
  ["characters", "src/assets/homepage1.png"],
  ["campaigns", "src/assets/asssrpg.png"],
  ["homebrews", "src/assets/homepage2.png"],
  ["vtt", "src/assets/05_A_igreja.jpg"],
  ["access", "src/assets/homepage3.png"],
  ["final", "src/assets/assimilation.jpg"],
];

const sizes = [
  ["desktop", 1920],
  ["mobile", 960],
];

const optimize = async () => {
  fs.mkdirSync(outputDir, { recursive: true });

  for (const [name, relativeInput] of images) {
    const input = path.join(rootDir, relativeInput);

    for (const [sizeName, width] of sizes) {
      const basePipeline = sharp(input)
        .rotate()
        .resize({ width, withoutEnlargement: true });

      await Promise.all([
        basePipeline
          .clone()
          .avif({ quality: 55, effort: 5 })
          .toFile(path.join(outputDir, `${name}-${sizeName}.avif`)),
        basePipeline
          .clone()
          .webp({ quality: 74, effort: 5 })
          .toFile(path.join(outputDir, `${name}-${sizeName}.webp`)),
      ]);
    }

    console.log(`Otimizada: ${name}`);
  }
};

optimize().catch((error) => {
  console.error("Falha ao otimizar as artes da Home:", error);
  process.exit(1);
});

