import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const expected = new Map([
  ['apps/web', '@crewcommand/web'],
  ['apps/api', '@crewcommand/api'],
  ['apps/worker', '@crewcommand/worker'],
  ['apps/mobile', '@crewcommand/mobile'],
  ['packages/types', '@crewcommand/types'],
  ['packages/validation', '@crewcommand/validation'],
  ['packages/api-client', '@crewcommand/api-client'],
  ['packages/design-tokens', '@crewcommand/design-tokens'],
  ['packages/config', '@crewcommand/config']
]);

const rootPkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
if (rootPkg.packageManager !== 'pnpm@12.6.0') throw new Error('pnpm version is not pinned to 12.6.0');
if (rootPkg.devDependencies?.turbo !== '2.11.4') throw new Error('Turborepo version is not pinned to 2.11.4');

for (const [dir, expectedName] of expected) {
  await access(resolve(root, dir, 'package.json'));
  const pkg = JSON.parse(await readFile(resolve(root, dir, 'package.json'), 'utf8'));
  if (pkg.name !== expectedName) throw new Error(`${dir}: expected ${expectedName}, got ${pkg.name}`);
  if (!pkg.private) throw new Error(`${expectedName} must be private during the PoC`);
}

const apiClient = JSON.parse(await readFile(resolve(root, 'packages/api-client/package.json'), 'utf8'));
if (apiClient.dependencies?.['@crewcommand/types'] !== 'workspace:*') throw new Error('api-client must depend on @crewcommand/types via workspace:*');
if (apiClient.dependencies?.['@crewcommand/validation'] !== 'workspace:*') throw new Error('api-client must depend on @crewcommand/validation via workspace:*');

const web = JSON.parse(await readFile(resolve(root, 'apps/web/package.json'), 'utf8'));
if (web.dependencies?.['@crewcommand/api-client'] !== 'workspace:*') throw new Error('web must depend on @crewcommand/api-client via workspace:*');

console.log(`POC-04 structure verified: ${expected.size} workspaces, pinned pnpm/Turbo, workspace dependency graph valid.`);
