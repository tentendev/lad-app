import { createHash } from "node:crypto";
import { copyFile, readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const distDirectory = fileURLToPath(new URL("../dist", import.meta.url));
const projectDirectory = fileURLToPath(new URL("../", import.meta.url));
const internalToolFiles = [
  "roadmap.html",
  "urls.html",
  "changelog.html",
  "internal.css",
  "ux-research.html",
];

await Promise.all(internalToolFiles.map((file) => copyFile(path.join(projectDirectory, file), path.join(distDirectory, file))));

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  }));
  return files.flat();
}

const assets = (await walk(path.join(distDirectory, "_expo", "static")))
  .map((absolute) => `/${path.relative(distDirectory, absolute).split(path.sep).join("/")}`)
  .sort();
const buildId = createHash("sha256").update(assets.join("\n")).digest("hex").slice(0, 12);

await writeFile(
  path.join(distDirectory, "precache-manifest.json"),
  `${JSON.stringify({ version: buildId, assets }, null, 2)}\n`,
  "utf8",
);

const serviceWorkerPath = path.join(distDirectory, "sw.js");
const serviceWorker = await readFile(serviceWorkerPath, "utf8");
await writeFile(serviceWorkerPath, serviceWorker.replaceAll("__BUILD_ID__", buildId), "utf8");

console.log(`Precache manifest: ${assets.length} hashed assets (${buildId}).`);
