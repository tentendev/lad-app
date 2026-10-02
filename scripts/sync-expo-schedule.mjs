import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

// The upstream HTML schedule remains the source of truth for both renderers.
const root = new URL('../', import.meta.url);
const context = { window: {} };
vm.runInNewContext(await readFile(new URL('schedule.js', root), 'utf8'), context, { timeout: 1000 });
const { SCHEDULE, SCHEDULE_META } = context.window;
if (!Array.isArray(SCHEDULE) || !SCHEDULE_META?.updated) throw new Error('Invalid upstream schedule');
const output = `// Generated from schedule.js by npm run sync:expo-data.\nimport type { ScheduleEvent } from "@/domain/types";\n\nexport const SCHEDULE_META = ${JSON.stringify(SCHEDULE_META, null, 2)};\n\nexport const SCHEDULE: ScheduleEvent[] = ${JSON.stringify(SCHEDULE, null, 2)};\n`;
await writeFile(new URL('src/data/schedule.ts', root), output);
console.log(`Synced ${SCHEDULE.length} schedule events (${SCHEDULE_META.updated}) to Expo.`);

vm.runInNewContext(await readFile(new URL('updates.js', root), 'utf8'), context, { timeout: 1000 });
const updates = context.window.SITE_UPDATES;
if (!Array.isArray(updates) || updates.some(update => !update.id || !update.date || !Array.isArray(update.items))) {
  throw new Error('Invalid upstream update notices');
}
await writeFile(new URL('src/data/siteUpdates.ts', root), `// Generated from updates.js by npm run sync:expo-data.\nimport type { SiteUpdate } from "@/domain/siteUpdates";\n\nexport const SITE_UPDATES: SiteUpdate[] = ${JSON.stringify(updates.slice(0, 1), null, 2)};\n`);
console.log(`Synced ${Math.min(updates.length, 1)} latest announcement to Expo.`);
