import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { parseManifest } from '@notyra/plugin-api/manifest'
const root = resolve(process.argv[2] ?? '.')
const manifest = readFileSync(resolve(root, 'package.json'), 'utf8')
const parsed = parseManifest(manifest)
assert.ok(parsed.ok, JSON.stringify(parsed))
assert.equal(parsed.value.type, 'theme')
const theme = JSON.parse(readFileSync(resolve(root, parsed.value.theme), 'utf8'))
assert.equal(theme.id, parsed.value.id.replace('notyra-theme-', 'notyra-'))
for (const key of ['name', 'nameJa']) assert.equal(typeof theme[key], 'string')
for (const key of ['swatches', 'swatchesDark']) assert.ok(Array.isArray(theme[key]) && theme[key].length > 0)
for (const key of ['light', 'dark']) {
  assert.ok(theme[key] && typeof theme[key] === 'object')
  for (const [name, value] of Object.entries(theme[key])) {
    assert.ok(name.startsWith('--'))
    assert.equal(typeof value, 'string')
  }
}
console.log(`Validated ${parsed.value.id}: manifest and light/dark palettes`)
