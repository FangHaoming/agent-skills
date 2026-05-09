import type {
  CreatePodcastJobRequest,
  CreatePodcastJobResponse,
  GetPodcastResultResponse,
  ListPodcastJobsResponse,
  PreviewPodcastPlanRequest,
  PreviewPodcastPlanResponse,
} from '../../contracts/http'
import type { PodcastJob } from '../../contracts/podcast'
import { generatePodcastArtifacts } from '../../pipeline/generate-podcast-artifacts'

interface MockPodcastJobRecord {
  job: PodcastJob
  createdAtMs: number
  frozen: boolean
  artifactGenerationStarted: boolean
}

const MOCK_TIMELINE: Array<{
  atMs: number
  status: PodcastJob['status']
  stage: PodcastJob['stage']
  progress: number
}> = [
  { atMs: 0, status: 'queued', stage: 'ingesting', progress: 0 },
  { atMs: 1200, status: 'processing', stage: 'extracting', progress: 12 },
  { atMs: 2400, status: 'processing', stage: 'planning', progress: 28 },
  { atMs: 3600, status: 'processing', stage: 'script_generating', progress: 46 },
  { atMs: 5200, status: 'processing', stage: 'tts_rendering', progress: 68 },
  { atMs: 6800, status: 'processing', stage: 'audio_merging', progress: 84 },
  { atMs: 8200, status: 'processing', stage: 'uploading', progress: 94 },
  { atMs: 9400, status: 'succeeded', stage: 'done', progress: 100 },
]

function nowIso(): string {
  return new Date().toISOString()
}

function createJobId(): string {
  return `pod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function getSourceLabel(input: CreatePodcastJobRequest): string {
  const firstSource = input.sources[0]

  if (!firstSource) {
    return 'Untitled source'
  }

  if (firstSource.title) {
    return firstSource.title
  }

  if (firstSource.path) {
    const parts = firstSource.path.split('/')
    return parts[parts.length - 1] || 'Untitled source'
  }

  if (firstSource.url) {
    return firstSource.url
  }

  return 'Untitled source'
}

export class PodcastService {
  private readonly jobs = new Map<string, MockPodcastJobRecord>()

  private startArtifactGeneration(record: MockPodcastJobRecord): void {
    if (record.artifactGenerationStarted) {
      return
    }

    record.artifactGenerationStarted = true

    void generatePodcastArtifacts({
      jobId: record.job.jobId,
      sources: record.job.sourceRefs,
      config: record.job.config,
    })
      .then((result) => {
        record.job.result = result
        record.job.updatedAt = nowIso()
        this.jobs.set(record.job.jobId, record)
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unknown artifact generation error'

        record.job.error = {
          code: 'artifact_generation_failed',
          message,
        }
        record.job.status = 'failed'
        record.job.updatedAt = nowIso()
        record.frozen = true
        this.jobs.set(record.job.jobId, record)
      })
  }

  private resolveTimeline(record: MockPodcastJobRecord): PodcastJob {
    if (record.frozen) {
      return record.job
    }

    const elapsedMs = Date.now() - record.createdAtMs
    const snapshot = [...MOCK_TIMELINE]
      .reverse()
      .find((item) => elapsedMs >= item.atMs)

    if (!snapshot) {
      return record.job
    }

    record.job.status = snapshot.status
    record.job.stage = snapshot.stage
    record.job.progress = snapshot.progress
    record.job.updatedAt = nowIso()

    if (record.job.error) {
      record.job.status = 'failed'
      record.frozen = true
      this.jobs.set(record.job.jobId, record)
      return record.job
    }

    if (snapshot.status === 'succeeded') {
      if (record.job.result) {
        record.frozen = true
      } else {
        record.job.status = 'processing'
        record.job.stage = 'uploading'
        record.job.progress = 96
      }
    }

    this.jobs.set(record.job.jobId, record)

    return record.job
  }

  createJob(input: CreatePodcastJobRequest): CreatePodcastJobResponse {
    const jobId = createJobId()
    const createdAt = nowIso()
    const createdAtMs = Date.now()

    const job: PodcastJob = {
      jobId,
      title: getSourceLabel(input),
      status: 'queued',
      stage: 'ingesting',
      progress: 0,
      config: input.config,
      sourceRefs: input.sources,
      createdAt,
      updatedAt: createdAt,
    }

    this.jobs.set(jobId, {
      job,
      createdAtMs,
      frozen: false,
      artifactGenerationStarted: false,
    })

    const record = this.jobs.get(jobId)

    if (record) {
      this.startArtifactGeneration(record)
    }

    return {
      jobId,
      status: job.status,
      message: 'Podcast job queued',
    }
  }

  getJob(jobId: string): PodcastJob | undefined {
    const record = this.jobs.get(jobId)
    return record ? this.resolveTimeline(record) : undefined
  }

  listJobs(limit = 10): ListPodcastJobsResponse {
    const jobs = Array.from(this.jobs.values())
      .map((record) => this.resolveTimeline(record))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit)

    return { jobs }
  }

  cancelJob(jobId: string): PodcastJob | undefined {
    const record = this.jobs.get(jobId)

    if (!record) {
      return undefined
    }

    const job = this.resolveTimeline(record)

    if (job.status === 'succeeded' || job.status === 'failed') {
      return job
    }

    job.status = 'cancelled'
    job.updatedAt = nowIso()
    record.frozen = true
    this.jobs.set(jobId, record)

    return job
  }

  previewPlan(input: PreviewPodcastPlanRequest): PreviewPodcastPlanResponse {
    const focus = input.config.focus ?? '核心主题'
    const isDialogue = input.config.format !== 'monologue'

    return {
      outline: ['开场', `${focus} 拆解`, '关键案例与延展', '总结与建议'],
      speakers: isDialogue
        ? [
            { role: 'host', style: '提问与串联' },
            { role: 'guest', style: '解释与展开' },
          ]
        : [{ role: 'host', style: '单人讲述与总结' }],
      estimatedDurationMinutes: input.config.durationMinutes,
    }
  }

  getResult(jobId: string): GetPodcastResultResponse | undefined {
    const record = this.jobs.get(jobId)

    if (!record) {
      return undefined
    }

    const job = this.resolveTimeline(record)

    if (!job.result) {
      return undefined
    }

    return {
      jobId,
      status: job.status,
      result: job.result,
    }
  }
}
