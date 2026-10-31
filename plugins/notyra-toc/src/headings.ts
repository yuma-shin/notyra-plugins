import { remark } from 'remark'

export interface Heading {
  depth: number
  line: number
  text: string
}

function inlineText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const value = node as {
    type?: string
    value?: string
    alt?: string
    children?: unknown[]
  }
  if (value.type === 'text' || value.type === 'inlineCode')
    return value.value ?? ''
  if (value.type === 'image') return value.alt ?? ''
  return (value.children ?? []).map(inlineText).join('')
}

/** Parse Markdown syntax rather than matching # inside fenced code or blockquotes. */
export function parseHeadings(
  markdown: string,
  maxDepth = 3,
  includeTitle = false
): Heading[] {
  const limit = Number.isFinite(maxDepth)
    ? Math.min(6, Math.max(1, Math.trunc(maxDepth)))
    : 3
  return remark()
    .parse(markdown)
    .children.flatMap(node => {
      if (
        node.type !== 'heading' ||
        node.depth > limit ||
        (!includeTitle && node.depth === 1)
      )
        return []
      return [
        {
          depth: node.depth,
          line: node.position?.start.line ?? 1,
          text: inlineText(node) || 'Untitled heading / 無題の見出し',
        },
      ]
    })
}
