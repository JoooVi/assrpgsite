const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const rootDir = path.resolve(__dirname, "..");
const buildDir = path.join(rootDir, "build");
const manifestPath = path.join(buildDir, "asset-manifest.json");
const enforce = process.argv.includes("--enforce");

const budgets = {
  initialJsGzip: 150 * 1024,
  initialCssGzip: 30 * 1024,
  largestHomeImage: 500 * 1024,
  totalHomeImages: 1.5 * 1024 * 1024,
};

const homeImages = [
  "src/assets/optimized/home/hero-desktop.avif",
  "src/assets/optimized/home/characters-desktop.avif",
  "src/assets/optimized/home/campaigns-desktop.avif",
  "src/assets/optimized/home/homebrews-desktop.avif",
  "src/assets/optimized/home/vtt-desktop.avif",
  "src/assets/optimized/home/access-desktop.avif",
  "src/assets/optimized/home/final-desktop.avif",
];

const formatBytes = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(2)} KB`;
};

const gzipSize = (filePath) => zlib.gzipSync(fs.readFileSync(filePath), { level: 9 }).length;

if (!fs.existsSync(manifestPath)) {
  console.error("Build não encontrado. Execute `npm run build` antes deste relatório.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const entrypoints = manifest.entrypoints || [];
const initialJsFiles = entrypoints.filter((file) => file.endsWith(".js"));
const initialCssFiles = entrypoints.filter((file) => file.endsWith(".css"));
const initialJsGzip = initialJsFiles.reduce(
  (total, file) => total + gzipSize(path.join(buildDir, file)),
  0
);
const initialCssGzip = initialCssFiles.reduce(
  (total, file) => total + gzipSize(path.join(buildDir, file)),
  0
);
const homeImageSizes = homeImages.map((file) => ({
  file,
  bytes: fs.statSync(path.join(rootDir, file)).size,
}));
const totalHomeImages = homeImageSizes.reduce((total, image) => total + image.bytes, 0);
const largestHomeImage = homeImageSizes.reduce(
  (largest, image) => (image.bytes > largest.bytes ? image : largest),
  { file: "", bytes: 0 }
);

const checks = [
  ["JavaScript inicial (gzip)", initialJsGzip, budgets.initialJsGzip],
  ["CSS inicial (gzip)", initialCssGzip, budgets.initialCssGzip],
  ["Maior arte da Home", largestHomeImage.bytes, budgets.largestHomeImage],
  ["Total de artes da Home", totalHomeImages, budgets.totalHomeImages],
];

console.log("\nRelatório de performance\n");
checks.forEach(([label, value, budget]) => {
  const passed = value <= budget;
  console.log(
    `${passed ? "PASS" : "FAIL"}  ${label}: ${formatBytes(value)} / limite ${formatBytes(budget)}`
  );
});
console.log(`\nMaior arquivo: ${largestHomeImage.file}`);

const failed = checks.filter(([, value, budget]) => value > budget);
if (failed.length && enforce) {
  console.error("\nOs orçamentos de performance foram excedidos.");
  process.exit(1);
}

if (failed.length) {
  console.log("\nModo informativo: use `npm run perf:budget` para bloquear violações.");
}
