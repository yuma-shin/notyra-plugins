import { readFileSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
if (process.env.GITHUB_REF_TYPE === 'tag' && process.env.GITHUB_REF_NAME !== `v${pkg.version}`)
  throw new Error('Collection tag must match root package.json version')
mkdirSync(resolve(root, 'dist'), { recursive: true })
for (const name of readdirSync(resolve(root, 'plugins'))) {
  const dir = resolve(root, 'plugins', name)
  const manifest = JSON.parse(readFileSync(resolve(dir, 'package.json'), 'utf8'))
  if (manifest.name !== name) throw new Error('Plugin directory must match package name')
  execFileSync(process.execPath, [resolve(root, 'scripts/package-plugin.mjs'), dir, '--skip-tag-check'], { stdio: 'inherit' })
  copyFileSync(resolve(dir, 'notyra-plugin.zip'), resolve(root, 'dist', `${name}.zip`))
}
// Keep repository-only installation compatible: the default package is ToC.
copyFileSync(resolve(root, 'dist/notyra-toc.zip'), resolve(root, 'dist/notyra-plugin.zip'))
