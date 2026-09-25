import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const task = process.argv[2];
if (!['build', 'check'].includes(task)) {
  throw new Error(`Unsupported package task: ${task}`);
}

const cwd = process.cwd();
const pkg = JSON.parse(await readFile(resolve(cwd, 'package.json'), 'utf8'));
if (!pkg.name?.startsWith('@crewcommand/')) {
  throw new Error(`Package name must use @crewcommand/*: ${pkg.name ?? '<missing>'}`);
}

const internalDeps = {
  ...(pkg.dependencies ?? {}),
  ...(pkg.devDependencies ?? {}),
  ...(pkg.peerDependencies ?? {})
};
for (const [name, range] of Object.entries(internalDeps)) {
  if (name.startsWith('@crewcommand/') && !String(range).startsWith('workspace:')) {
    throw new Error(`${pkg.name} must reference ${name} with workspace:, got ${range}`);
  }
}

if (task === 'build') {
  const outDir = resolve(cwd, '.poc');
  await mkdir(outDir, { recursive: true });
  await writeFile(
    resolve(outDir, 'build.json'),
    JSON.stringify({ package: pkg.name, task: 'build', ok: true }, null, 2) + '\n'
  );
}

console.log(`[${pkg.name}] ${task} ok`);
