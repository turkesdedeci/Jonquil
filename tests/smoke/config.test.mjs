import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

test('proxy convention is used instead of middleware', () => {
  const proxyPath = path.join(rootDir, 'proxy.ts');
  const middlewarePath = path.join(rootDir, 'middleware.ts');

  assert.equal(fs.existsSync(proxyPath), true, 'proxy.ts should exist');
  assert.equal(fs.existsSync(middlewarePath), false, 'middleware.ts should not exist');
});

test('next config does not bypass type errors', () => {
  const nextConfig = fs.readFileSync(path.join(rootDir, 'next.config.ts'), 'utf8');
  assert.equal(nextConfig.includes('ignoreBuildErrors'), false);
});

test('admin dev fallback is explicit', () => {
  const adminCheck = fs.readFileSync(path.join(rootDir, 'lib', 'adminCheck.ts'), 'utf8');
  assert.equal(adminCheck.includes('ALLOW_DEV_ADMIN'), true);
});
