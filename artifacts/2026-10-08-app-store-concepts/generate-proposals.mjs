import fs from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const run = promisify(execFile);
const cli = '/Users/ekc-m5max/.local/bin/higgsfield';
const root = path.dirname(new URL(import.meta.url).pathname);
const project = path.resolve(root, '../..');
const output = path.join(project, 'assets/generated/app-store-concepts-2026-10-08');
const brief = JSON.parse(await fs.readFile(path.join(root, 'design-brief.json'), 'utf8'));
const receipt = [];
await fs.mkdir(output, { recursive: true });

for (const concept of brief.concepts) {
  const prefix = path.join(root, concept.id);
  const upload = JSON.parse(await fs.readFile(`${prefix}-upload.json`, 'utf8'));
  let raw;
  try { raw = JSON.parse(await fs.readFile(`${prefix}-job.json`, 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const prompt = await fs.readFile(`${prefix}-prompt.txt`, 'utf8');
    const { stdout } = await run(cli, ['generate', 'create', brief.model,
      '--prompt', prompt, '--variant', brief.variant, '--quality', brief.quality,
      '--resolution', brief.resolution, '--aspect-ratio', brief.aspectRatio,
      '--image-references', upload.id, '--json'], { timeout: 60_000 });
    await fs.writeFile(`${prefix}-job.json`, stdout);
    raw = JSON.parse(stdout);
  }
  const first = Array.isArray(raw) ? raw[0] : raw;
  const jobId = typeof first === 'string' ? first : first.id;
  if (!/^[a-f0-9-]{36}$/.test(jobId)) throw Error('Generation job identifier missing');
  console.log(JSON.stringify({ concept: concept.id, jobId, stage: 'waiting' }));
  const waited = await run(cli, ['generate', 'wait', jobId, '--quiet', '--timeout', '15m', '--interval', '10s', '--json'], { timeout: 920_000 });
  await fs.writeFile(`${prefix}-wait.json`, waited.stdout);
  const { stdout } = await run(cli, ['generate', 'get', jobId, '--json'], { timeout: 30_000 });
  await fs.writeFile(`${prefix}-result.json`, stdout);
  const result = JSON.parse(stdout);
  if (result.status !== 'completed' || result.params.quality !== brief.quality || result.params.resolution !== brief.resolution) {
    throw Error('Generated proposal does not match requested completion/quality/resolution');
  }
  if (!result.result_url || new URL(result.result_url).protocol !== 'https:') throw Error('Result URL missing');
  const response = await fetch(result.result_url);
  if (!response.ok) throw Error('Result download failed');
  const file = path.join(output, `${concept.id}.png`);
  await fs.writeFile(file, Buffer.from(await response.arrayBuffer()));
  receipt.push({ concept: concept.id, name: concept.name, transport: 'higgsfield_cli', model: brief.model,
    requestedVariant: brief.variant, resolvedModel: result.params.model, quality: result.params.quality,
    resolution: result.params.resolution, aspectRatio: result.params.aspect_ratio, jobId,
    referenceUploadId: upload.id, pinterestPin: `https://www.pinterest.com/pin/${concept.pin}/`,
    output: path.relative(project, file), status: result.status, generatedAt: result.created_at });
  await fs.writeFile(path.join(root, 'generation-receipt.json'), JSON.stringify({ recordedAt: new Date().toISOString(), proposals: receipt }, null, 2) + '\n');
  console.log(JSON.stringify({ concept: concept.id, stage: 'downloaded', file }));
}
