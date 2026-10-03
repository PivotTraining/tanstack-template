import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const dir = path.resolve('legacy-bundle');
const names = (await readdir(dir)).filter(name => name.startsWith('chunk-')).sort();
if (!names.length) throw new Error('Legacy bundle chunks are missing.');

const b64 = (await Promise.all(names.map(name => readFile(path.join(dir, name), 'utf8')))).join('');
const archive = path.resolve('.legacy-v18.tar.gz');

await writeFile(archive, Buffer.from(b64, 'base64'));
await mkdir(path.resolve('public'), { recursive: true });
await rm(path.resolve('public/legacy'), { recursive: true, force: true });
execFileSync('tar', ['-xzf', archive, '-C', path.resolve('public')], { stdio: 'inherit' });
await rm(archive, { force: true });

console.log(`Restored V18 compatibility academy from ${names.length} chunks.`);
