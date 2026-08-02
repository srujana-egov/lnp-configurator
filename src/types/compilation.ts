export type ValidationCheckStatus = 'passed' | 'failed'

export interface ValidationCheck {
  id: string
  label: string
  status: ValidationCheckStatus
}

export type CompilationStatus = 'idle' | 'validating' | 'failed' | 'compiling' | 'complete'

export type GeneratedFileId = 'registry' | 'workflow' | 'calculation' | 'notification'

export interface GeneratedFile {
  id: GeneratedFileId
  filename: string
  json: unknown
  generatedAt: number
}

export interface TraceEntry {
  id: string
  time: string
  message: string
}
