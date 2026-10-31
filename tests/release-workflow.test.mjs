import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, basename, sep } from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
const workflow=readFileSync(new URL('../.github/workflows/release.yml',import.meta.url),'utf8')
const block=/run: \|\r?\n([\s\S]*?)\r?\n        env:/.exec(workflow)?.[1]
assert.ok(block,'Release workflow must contain its publishing script')
const script=block.split(/\r?\n/).map(line=>line.slice(10)).join('\n')
const bash=process.platform==='win32'?resolve(execFileSync('git',['--exec-path'],{encoding:'utf8'}).trim(),'../../../bin/bash.exe'):'bash'
function publish(existing,fail=false){
  const dir=mkdtempSync(resolve(tmpdir(),'notyra-release-test-'))
  try{
    writeFileSync(resolve(dir,'notyra-toc.zip'),'fixture')
    writeFileSync(resolve(dir,'notyra-theme-blue.zip'),'fixture')
    return spawnSync(bash,['--noprofile','--norc','-e','-o','pipefail','-c',`gh() {
  if [ "$2" = "view" ]; then return "$VIEW_STATUS"; fi
  printf '%s\\n' "$*"
  if [ "$FAIL_UPLOAD" = "1" ]; then return 1; fi
}
${script}`],{cwd:dir,encoding:'utf8',env:{...process.env,TAG:'v1.0.0',REPO:'yuma-shin/notyra-plugins',VIEW_STATUS:existing?'0':'1',FAIL_UPLOAD:fail?'1':'0'}})
  }finally{
    if(!dir.startsWith(resolve(tmpdir())+sep)||!basename(dir).startsWith('notyra-release-test-'))throw new Error('Cleanup escaped fixture directory')
    rmSync(dir,{recursive:true,force:true})
  }
}
test('an existing release receives ZIP assets without creating a second release',()=>{
  const result=publish(true)
  assert.equal(result.status,0,result.stderr)
  assert.match(result.stdout,/release upload v1\.0\.0/)
  assert.match(result.stdout,/notyra-toc\.zip/)
  assert.match(result.stdout,/notyra-theme-blue\.zip/)
  assert.doesNotMatch(result.stdout,/release create/)
})
test('a new version creates a release with ZIP assets',()=>{
  const result=publish(false)
  assert.equal(result.status,0,result.stderr)
  assert.match(result.stdout,/release create v1\.0\.0/)
  assert.match(result.stdout,/--verify-tag --generate-notes/)
})
test('an asset upload failure fails the release job',()=>{
  const result=publish(true,true)
  assert.notEqual(result.status,0)
})
