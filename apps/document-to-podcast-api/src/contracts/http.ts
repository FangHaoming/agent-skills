import type {
  PodcastConfig,
  PodcastJob,
  PodcastPlanPreview,
  PodcastResult,
  PodcastSource,
} from './podcast'

export interface CreatePodcastJobRequest {
  sources: PodcastSource[]
  config: PodcastConfig
}

export interface CreatePodcastJobResponse {
  jobId: string
  status: PodcastJob['status']
  message: string
}

export interface GetPodcastJobResponse extends PodcastJob {}

export interface GetPodcastResultResponse {
  jobId: string
  status: PodcastJob['status']
  result: PodcastResult
}

export interface ListPodcastJobsResponse {
  jobs: PodcastJob[]
}

export interface CancelPodcastJobResponse {
  jobId: string
  status: PodcastJob['status']
}

export interface PreviewPodcastPlanRequest {
  sources: PodcastSource[]
  config: Pick<PodcastConfig, 'language' | 'durationMinutes' | 'format'> &
    Partial<PodcastConfig>
}

export interface PreviewPodcastPlanResponse extends PodcastPlanPreview {}
