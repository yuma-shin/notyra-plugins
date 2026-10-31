import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseHeadings } from '../src/headings.ts'

test('ignores fenced code, quoted headings and H1 by default; accepts setext and inline formatting', () => {
  const markdown =
    '# Title\n\n## One **bold** `code`\n\n```md\n## Not a heading\n```\n\n> ## Quote\n\nSetext\n------\n\n### Three\n\n#### Four'
  assert.deepEqual(parseHeadings(markdown), [
    { depth: 2, line: 3, text: 'One bold code' },
    { depth: 2, line: 11, text: 'Setext' },
    { depth: 3, line: 14, text: 'Three' },
  ])
})
test('preserves duplicate headings and handles image alt text and depth settings', () => {
  assert.deepEqual(
    parseHeadings(
      '# Title\n## Same\n## Same\n### ![Image](x.png)',
      6,
      true
    ).map(h => h.text),
    ['Title', 'Same', 'Same', 'Image']
  )
  assert.equal(parseHeadings('## Two', -5).length, 0)
  assert.equal(parseHeadings('## Two', NaN).length, 1)
})
