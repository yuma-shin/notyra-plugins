import { readFileSync, readdirSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseManifest } from '@notyra/plugin-api/manifest'

const crc32 = data => {
  let crc = 0xffffffff
  for (const byte of data) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}
function unzip(file) {
  const data = readFileSync(file), files = new Map()
  assert.ok(data.length < 20 * 1024 * 1024)
  let cursor = 0
  while (data.readUInt32LE(cursor) === 0x04034b50) {
    assert.equal(data.readUInt16LE(cursor + 8), 0, 'package writer uses stored ZIP entries')
    const size = data.readUInt32LE(cursor + 18)
    const nameSize = data.readUInt16LE(cursor + 26), extraSize = data.readUInt16LE(cursor + 28)
    const name = data.subarray(cursor + 30, cursor + 30 + nameSize).toString()
    const start = cursor + 30 + nameSize + extraSize
    const content = data.subarray(start, start + size)
    assert.equal(crc32(content), data.readUInt32LE(cursor + 14))
    files.set(name, content.toString())
    cursor = start + size
  }
  return files
}
test('every registry entry resolves to its own complete ZIP in the collection release', () => {
  const registry = JSON.parse(readFileSync('registry.json', 'utf8'))
  assert.equal(registry.plugins.length, 5)
  const ids = new Set(), themeIds = new Set()
  for (const entry of registry.plugins) {
    assert.equal(entry.repo, 'yuma-shin/notyra-plugins')
    assert.ok(!ids.has(entry.id)); ids.add(entry.id)
    const files = unzip(`dist/${entry.id}.zip`)
    const parsed = parseManifest(files.get('package.json'))
    assert.ok(parsed.ok, JSON.stringify(parsed))
    assert.equal(parsed.value.id, entry.id)
    const manifest = parsed.value
    if (manifest.type === 'theme') {
      assert.ok(files.has(manifest.theme))
      assert.ok(files.has(manifest.themeCss))
      const theme = JSON.parse(files.get(manifest.theme))
      assert.ok(!themeIds.has(theme.id)); themeIds.add(theme.id)
      assert.ok(theme.light && theme.dark)
      assert.ok(![...files.keys()].some(name => name.endsWith('.js')))
    } else assert.ok(files.has(manifest.main))
  }
  assert.equal(themeIds.size, 4)
  assert.deepEqual([...ids].sort(), readdirSync('plugins').sort())
})
test('repository-only installation keeps ToC as the default package', () => {
  assert.deepEqual(readFileSync('dist/notyra-plugin.zip'), readFileSync('dist/notyra-toc.zip'))
})
