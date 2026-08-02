import { Fragment } from 'react'

const TOKEN_PATTERN = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g

function classify(token: string) {
  if (token.startsWith('"')) return token.endsWith(':') ? 'text-primary' : 'text-success'
  if (token === 'true' || token === 'false') return 'text-warning'
  if (token === 'null') return 'text-muted-foreground'
  return 'text-accent-foreground'
}

function tokenize(json: string) {
  const parts: { text: string; className?: string }[] = []
  let lastIndex = 0

  for (const match of json.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0
    if (index > lastIndex) parts.push({ text: json.slice(lastIndex, index) })
    parts.push({ text: match[0], className: classify(match[0]) })
    lastIndex = index + match[0].length
  }
  if (lastIndex < json.length) parts.push({ text: json.slice(lastIndex) })

  return parts
}

export function JsonViewer({ data }: { data: unknown }) {
  const json = JSON.stringify(data, null, 2)
  const parts = tokenize(json)

  return (
    <pre className="overflow-auto rounded-lg border border-border bg-muted p-4 font-mono text-xs leading-relaxed text-foreground">
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part.className ? <span className={part.className}>{part.text}</span> : part.text}
        </Fragment>
      ))}
    </pre>
  )
}
