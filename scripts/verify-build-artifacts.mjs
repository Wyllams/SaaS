import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const expected = [
  'apps/web', 'apps/api', 'apps/worker', 'apps/mobile',
  'packages/types', 'packages/validation', 'packages/api-client',
  'packages/design-tokens', 'packages/config'
];

for (const dir of expected) {
  const artifact = resolve(process.cwd(), dir, '.poc', 'build.json');
  await access(artifact);
  const data = JSON.parse(await readFile(artifact, 'utf8'));
  if (data.ok !== true || data.task !== 'build') throw new Error(`Invalid build artifact for ${dir}`);
}
console.log(`POC-04 build artifacts verified for ${expected.length} workspaces.`);
