import { mkdtemp, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }))).flat();
}

const outputDirectory = await mkdtemp(path.join(tmpdir(), "deep-space-ledger-ios-"));

try {
  const executable = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(
    executable,
    ["expo", "export", "--platform", "ios", "--output-dir", outputDirectory],
    { cwd: process.cwd(), stdio: "inherit" },
  );
  if (result.status !== 0) throw new Error(`Expo iOS export failed with status ${result.status ?? "unknown"}.`);

  const files = await walk(outputDirectory);
  const bundle = files.find((file) => file.endsWith(".hbc"));
  const background = files.find((file) => file.endsWith("mobile-bg.webp"));
  const metadata = files.find((file) => path.basename(file) === "metadata.json");
  if (!bundle || !background || !metadata) {
    throw new Error("iOS export is missing the Hermes bundle, star background, or metadata.");
  }

  const totalBytes = (await Promise.all(files.map(async (file) => (await stat(file)).size)))
    .reduce((total, size) => total + size, 0);
  if (totalBytes > 10 * 1024 * 1024) {
    throw new Error(`iOS export is ${(totalBytes / 1024 / 1024).toFixed(1)} MiB, above the 10 MiB regression budget.`);
  }

  console.log(`iOS bundle verified: ${(totalBytes / 1024 / 1024).toFixed(1)} MiB, Hermes bundle and original-design background present.`);
} finally {
  await rm(outputDirectory, { recursive: true, force: true });
}
