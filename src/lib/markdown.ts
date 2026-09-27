// Just enough Markdown for model answers — built as React elements, never as HTML strings.
export type Block =
  | { kind: 'code'; lang: string; text: string }
  | { kind: 'h'; level: number; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'table'; rows: string[][] }
  | { kind: 'quote'; text: string }
  | { kind: 'hr' }
  | { kind: 'p'; text: string }

export function parseMarkdown(md: string): Block[] {
  const lines = md.replace(/\r/g, '').split('\n')
  const blocks: Block[] = []
  const isTableRow = (l: string) => /^\s*\|.*\|\s*$/.test(l)
  const cells = (l: string) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const fence = /^\s*```(\w*)/.exec(line)
    if (fence) {
      const body: string[] = []
      i++
      while (i < lines.length && !/^\s*```/.test(lines[i])) body.push(lines[i++])
      i++ // closing fence (or end of a still-streaming answer)
      blocks.push({ kind: 'code', lang: fence[1].toLowerCase(), text: body.join('\n') })
      continue
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line)
    if (heading) { blocks.push({ kind: 'h', level: heading[1].length, text: heading[2] }); i++; continue }
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) { blocks.push({ kind: 'hr' }); i++; continue }
    if (isTableRow(line)) {
      const rows: string[][] = []
      while (i < lines.length && isTableRow(lines[i])) {
        if (!/^\s*\|[\s:|-]+\|\s*$/.test(lines[i])) rows.push(cells(lines[i]))
        i++
      }
      blocks.push({ kind: 'table', rows })
      continue
    }
    const item = /^\s*([-*•]|\d+[.)])\s+(.*)$/.exec(line)
    if (item) {
      const ordered = /\d/.test(item[1])
      const items: string[] = []
      while (i < lines.length) {
        const m = /^\s*([-*•]|\d+[.)])\s+(.*)$/.exec(lines[i])
        if (m && /\d/.test(m[1]) === ordered) items.push(m[2])
        else if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length) items[items.length - 1] += ' ' + lines[i].trim()
        else break
        i++
      }
      blocks.push({ kind: 'list', ordered, items })
      continue
    }
    if (/^\s*>/.test(line)) { blocks.push({ kind: 'quote', text: line.replace(/^\s*>\s?/, '') }); i++; continue }
    if (!line.trim()) { i++; continue }
    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !/^\s*(```|#{1,4}\s|[-*•]\s|\d+[.)]\s|>|\|)/.test(lines[i])) para.push(lines[i++])
    if (!para.length) para.push(lines[i++]) // a line no rule consumed
    blocks.push({ kind: 'p', text: para.join(' ') })
  }
  return blocks
}
