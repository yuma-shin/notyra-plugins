import { notyra } from '@notyra/plugin-api'
import type { ActiveNote, Disposable } from '@notyra/plugin-api'
import { parseHeadings } from './headings'

const icon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M3 5h2v2H3zm4 0h14v2H7zM3 11h2v2H3zm4 0h14v2H7zM3 17h2v2H3zm4 0h14v2H7z"/></svg>'
const registrations: Disposable[] = []
const mounted = new Set<HTMLElement>()
let current: ActiveNote | null = null

function render(container: HTMLElement): void {
  const doc = container.ownerDocument
  const list = doc.createElement('nav')
  list.setAttribute('aria-label', 'Table of contents / 目次')
  list.className = 'notyra-toc'
  const title = doc.createElement('p')
  title.className = 'notyra-toc-title'
  title.textContent =
    current?.title ?? 'No active note / ノートが選択されていません'
  list.append(title)
  const headings = current
    ? parseHeadings(
        current.body,
        notyra.settings.get<number>('maxDepth') ?? 3,
        notyra.settings.get<boolean>('includeTitle') ?? false
      )
    : []
  if (current && headings.length === 0) {
    const empty = doc.createElement('p')
    empty.textContent = 'No matching headings / 対象の見出しがありません'
    list.append(empty)
  }
  const minDepth = headings.reduce(
    (depth, heading) => Math.min(depth, heading.depth),
    6
  )
  for (const heading of headings) {
    const button = doc.createElement('button')
    button.type = 'button'
    button.style.paddingInlineStart = `${8 + (heading.depth - minDepth) * 14}px`
    button.textContent = `${notyra.settings.get<boolean>('showLineNumbers') ? `${heading.line} · ` : ''}${heading.text}`
    button.title = `Line ${heading.line} / ${heading.line} 行目`
    button.addEventListener('click', () => {
      notyra.editor.scrollToLine(heading.line)
    })
    list.append(button)
  }
  container.replaceChildren(list)
}
function refresh(): void {
  for (const container of mounted) render(container)
}

export function activate(): void {
  registrations.push(
    notyra.styles.add(
      `.notyra-toc { padding: 12px; font: inherit; color: var(--foreground); } .notyra-toc-title { font-weight: 600; margin-bottom: 8px; overflow-wrap: anywhere; } .notyra-toc button { display: block; width: 100%; text-align: start; padding: 6px 8px; border: 0; border-radius: 6px; background: transparent; color: inherit; cursor: pointer; overflow-wrap: anywhere; } .notyra-toc button:hover, .notyra-toc button:focus-visible { background: var(--accent); color: var(--theme-accent); }`
    )
  )
  registrations.push(
    notyra.events.onActiveNoteChange(event => {
      current = event.note
      refresh()
    })
  )
  registrations.push(notyra.settings.onDidChange(refresh))
  registrations.push(
    notyra.commands.register({
      id: 'refresh',
      title: 'Refresh table of contents / 目次を更新',
      run: refresh,
    })
  )
  registrations.push(
    notyra.toolbar.addButton({
      command: 'refresh',
      icon,
      tooltip: 'Refresh table of contents / 目次を更新',
    })
  )
  registrations.push(
    notyra.sidePanel.registerView({
      id: 'toc',
      title: 'Table of Contents / 目次',
      icon,
      render(container) {
        mounted.add(container)
        render(container)
        return () => {
          mounted.delete(container)
          container.replaceChildren()
        }
      },
    })
  )
}

export function deactivate(): void {
  for (const registration of registrations.splice(0).reverse())
    registration.dispose()
  for (const container of mounted) container.replaceChildren()
  mounted.clear()
  current = null
}
