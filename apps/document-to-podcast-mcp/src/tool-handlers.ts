import type {
  CancelPodcastJobInput,
  CreatePodcastJobInput,
  GetPodcastJobInput,
  GetPodcastResultInput,
  ListPodcastJobsInput,
  PreviewPodcastPlanInput,
} from './contracts'

const apiBaseUrl = process.env.DOCUMENT_TO_PODCAST_API_URL ?? 'http://localhost:4310'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, init)

  if (!response.ok) {
    let detail = ''

    try {
      const errorBody = (await response.json()) as Record<string, unknown>
      detail = Object.entries(errorBody)
        .map(([key, value]) => `${key}=${String(value)}`)
        .join(', ')
    } catch {
      detail = response.statusText
    }

    throw new Error(`API request failed: ${response.status} ${detail}`)
  }

  return (await response.json()) as T
}

function normalizeConfig(input: CreatePodcastJobInput['config']) {
  return {
    language: input.language,
    durationMinutes: input.duration_minutes,
    format: input.format,
    audience: input.audience,
    tone: input.tone,
    focus: input.focus,
    speakerCount: input.speaker_count,
    includeIntro: input.include_intro,
    includeOutro: input.include_outro,
  }
}

export async function createPodcastJob(input: CreatePodcastJobInput): Promise<unknown> {
  return request('/api/podcast-jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sources: input.sources,
      config: normalizeConfig(input.config),
    }),
  })
}

export async function getPodcastJob(input: GetPodcastJobInput): Promise<unknown> {
  return request(`/api/podcast-jobs/${input.job_id}`)
}

export async function getPodcastResult(input: GetPodcastResultInput): Promise<unknown> {
  return request(`/api/podcast-jobs/${input.job_id}/result`)
}

export async function listPodcastJobs(input: ListPodcastJobsInput = {}): Promise<unknown> {
  const limit = input.limit ?? 10
  return request(`/api/podcast-jobs?limit=${limit}`)
}

export async function cancelPodcastJob(input: CancelPodcastJobInput): Promise<unknown> {
  return request(`/api/podcast-jobs/${input.job_id}/cancel`, {
    method: 'POST',
  })
}

export async function previewPodcastPlan(input: PreviewPodcastPlanInput): Promise<unknown> {
  return request('/api/podcast-jobs/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sources: input.sources,
      config: normalizeConfig(input.config),
    }),
  })
}
