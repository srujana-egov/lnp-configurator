import { useState } from 'react'
import { Check, Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JsonViewer } from '@/components/definition/JsonViewer'
import type { GeneratedFile } from '@/types/compilation'

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function formatTimestamp(ms: number) {
  return new Date(ms).toLocaleTimeString('en-GB', { hour12: false })
}

export function FileViewer({ file }: { file: GeneratedFile }) {
  const [copied, setCopied] = useState(false)
  const json = JSON.stringify(file.json, null, 2)
  const size = new TextEncoder().encode(json).length

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be denied by browser permissions/insecure context — no-op.
    }
  }

  const handleDownload = () => {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-hidden">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {formatSize(size)} · generated {formatTimestamp(file.generatedAt)}
        </span>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="size-3.5" />
            Download
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <JsonViewer data={file.json} />
      </div>
    </div>
  )
}
