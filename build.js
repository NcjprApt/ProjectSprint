import esbuild from "esbuild";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Building Plugin...");

const EXCLUDED_DIRS = new Set([
  "dist",
  "node_modules",
  ".plugin_cookie",
  ".git",
  ".idea",
  ".vscode",
  "coverage",
  "logs",
  "tmp",
  "temp"
]);

// Keep only text-based / source files
const ALLOWED_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".css",
  ".html",
  ".md"
]);

function walkDir(dir, prefix = "") {
  const result = {};

  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const relPath = path.join(prefix, file);

    if (EXCLUDED_DIRS.has(file)) {
      continue;
    }

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      Object.assign(result, walkDir(fullPath, relPath));
      continue;
    }

    const ext = path.extname(file).toLowerCase();

    // Only include safe source files
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      continue;
    }

    try {
      result[relPath] = fs.readFileSync(fullPath, "utf8");
    } catch (err) {
      console.warn(`❌ Failed reading ${relPath}:`, err.message);
    }
  }

  return result;
}

const projectRoot = __dirname;
const allFiles = walkDir(projectRoot);

const sourceJson = JSON.stringify(allFiles);

const sourceSizeMB = (
  Buffer.byteLength(sourceJson) /
  1024 /
  1024
).toFixed(2);

console.log(`📦 Embedded Source Size: ${sourceSizeMB} MB`);

const embedCode = `
window.__PLUGIN_SOURCE_BASE64__ =
"${Buffer.from(sourceJson).toString("base64")}";
`;

try {
  await esbuild.build({
    entryPoints: [path.join(__dirname, "src/component.jsx")],
    bundle: true,
    minify: true,
    sourcemap: true,
    format: "iife",
    outfile: path.join(__dirname, "dist/TimesheetOverviewPlugin.js"),
    globalName: "TimesheetOverviewPlugin",
    loader: {
      ".jsx": "jsx"
    },
    banner: {
      js: embedCode
    },
    target: ["es2020"]
  });

  const bundleSize = fs.statSync(
    path.join(__dirname, "dist/TimesheetOverviewPlugin.js")
  ).size;

  console.log("✅ Build Complete");

  console.log(
    `📄 Bundle Size: ${(bundleSize / 1024 / 1024).toFixed(2)} MB`
  );
} catch (err) {
  console.error("❌ Build Failed");
  console.error(err);
  process.exit(1);
}