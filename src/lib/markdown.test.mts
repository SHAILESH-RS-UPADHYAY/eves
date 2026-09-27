// node src/lib/markdown.test.mts
import assert from 'node:assert/strict'
import { parseMarkdown } from './markdown.ts'

const md = `## 2. MISSION
Build the **wholesale** page — see \`OrdersPage.tsx\` [05:18].

- first
- second
  continued
1. one
2) two

| File | Change |
|------|--------|
| a.ts | edit |

\`\`\`html
<div>hi</div>
\`\`\`
> quoted
---
|not a table
\`\`\`ts
const streaming = true`

const b = parseMarkdown(md)
assert.deepEqual(b.map((x) => x.kind), ['h', 'p', 'list', 'list', 'table', 'code', 'quote', 'hr', 'p', 'code'])
assert.deepEqual(b[0], { kind: 'h', level: 2, text: '2. MISSION' })
assert.deepEqual(b[2], { kind: 'list', ordered: false, items: ['first', 'second continued'] })
assert.deepEqual(b[3], { kind: 'list', ordered: true, items: ['one', 'two'] })
assert.deepEqual(b[4], { kind: 'table', rows: [['File', 'Change'], ['a.ts', 'edit']] })
assert.deepEqual(b[5], { kind: 'code', lang: 'html', text: '<div>hi</div>' })
assert.deepEqual(b[8], { kind: 'p', text: '|not a table' })
// an unterminated fence (answer still streaming) is still a code block
assert.deepEqual(b[9], { kind: 'code', lang: 'ts', text: 'const streaming = true' })
// every line is consumed exactly once — no infinite loop on odd input
assert.equal(parseMarkdown('|\n|\n- \n#\n```').length > 0, true)

console.log('markdown: ok')
