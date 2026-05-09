export type PodcastSourceType = 'file' | 'url' | 'text'

export type PodcastFormat = 'dialogue' | 'monologue' | 'debate' | 'brief'

export interface PodcastSourceInput {
  type: PodcastSourceType
  path?: string
  url?: string
  title?: string
  content?: string
}

export interface PodcastConfigInput {
  language: string
  duration_minutes: number
  format: PodcastFormat
  audience?: string
  tone?: string
  focus?: string
  speaker_count?: 1 | 2
  include_intro?: boolean
  include_outro?: boolean
}

export interface CreatePodcastJobInput {
  sources: PodcastSourceInput[]
  config: PodcastConfigInput
}

export interface GetPodcastJobInput {
  job_id: string
}

export interface GetPodcastResultInput {
  job_id: string
}

export interface ListPodcastJobsInput {
  limit?: number
}

export interface CancelPodcastJobInput {
  job_id: string
}

export interface PreviewPodcastPlanInput {
  sources: PodcastSourceInput[]
  config: PodcastConfigInput
}

export interface PodcastToolRegistry {
  create_podcast_job: CreatePodcastJobInput
  get_podcast_job: GetPodcastJobInput
  get_podcast_result: GetPodcastResultInput
  list_podcast_jobs: ListPodcastJobsInput
  cancel_podcast_job: CancelPodcastJobInput
  preview_podcast_plan: PreviewPodcastPlanInput
}
