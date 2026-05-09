export type PodcastSourceType = 'file' | 'url' | 'text'

export type PodcastFormat = 'dialogue' | 'monologue' | 'debate' | 'brief'

export type PodcastJobStatus =
  | 'queued'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'

export type PodcastJobStage =
  | 'ingesting'
  | 'extracting'
  | 'planning'
  | 'script_generating'
  | 'tts_rendering'
  | 'audio_merging'
  | 'uploading'
  | 'done'

export interface PodcastSource {
  type: PodcastSourceType
  path?: string
  url?: string
  title?: string
  content?: string
}

export interface PodcastConfig {
  language: string
  durationMinutes: number
  format: PodcastFormat
  audience?: string
  tone?: string
  focus?: string
  speakerCount?: 1 | 2
  includeIntro?: boolean
  includeOutro?: boolean
}

export interface PodcastTranscriptLine {
  speaker: 'host' | 'guest'
  text: string
  ssml?: string
}

export interface PodcastTranscriptSection {
  heading: string
  lines: PodcastTranscriptLine[]
}

export interface PodcastTranscript {
  title: string
  summary: string
  sections: PodcastTranscriptSection[]
}

export interface PodcastResult {
  audio: {
    url: string
    durationSeconds: number
    mimeType?: string
  }
  transcript: {
    url: string
    markdownUrl: string
  }
  summary: string
  transcriptContent?: PodcastTranscript
}

export interface PodcastPlanPreview {
  outline: string[]
  speakers: Array<{
    role: 'host' | 'guest'
    style: string
  }>
  estimatedDurationMinutes: number
}

export interface PodcastJobError {
  code: string
  message: string
  detail?: string
}

export interface PodcastJob {
  jobId: string
  title: string
  status: PodcastJobStatus
  stage: PodcastJobStage
  progress: number
  config: PodcastConfig
  sourceRefs: PodcastSource[]
  result?: PodcastResult
  error?: PodcastJobError
  createdAt: string
  updatedAt: string
}

export type ParserProviderKind = 'stub' | 'text-url'

export type LlmProviderKind = 'stub' | 'openai-compatible'

export type TtsProviderKind = 'stub' | 'http'

export type StorageProviderKind = 'stub' | 'local-file'
