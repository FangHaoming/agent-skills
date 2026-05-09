import { createServer, type IncomingMessage, type ServerResponse } from 'http'
import { PodcastService } from './modules/podcast/service'
import type {
  CreatePodcastJobRequest,
  PreviewPodcastPlanRequest,
} from './contracts/http'

const service = new PodcastService()

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body, null, 2))
}

function notFound(res: ServerResponse): void {
  sendJson(res, 404, { message: 'Not found' })
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = []

  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk))
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf-8')) as T
}

function getJobIdFromPath(pathname: string): string | undefined {
  const parts = pathname.split('/').filter(Boolean)
  return parts[2]
}

async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const { pathname, searchParams } = url

  if (req.method === 'POST' && pathname === '/api/podcast-jobs') {
    const body = await readJson<CreatePodcastJobRequest>(req)
    sendJson(res, 201, service.createJob(body))
    return
  }

  if (req.method === 'GET' && pathname === '/api/podcast-jobs') {
    const limit = Number(searchParams.get('limit') ?? '10')
    sendJson(res, 200, service.listJobs(limit))
    return
  }

  if (req.method === 'POST' && pathname === '/api/podcast-jobs/preview') {
    const body = await readJson<PreviewPodcastPlanRequest>(req)
    sendJson(res, 200, service.previewPlan(body))
    return
  }

  if (req.method === 'GET' && pathname.startsWith('/api/podcast-jobs/')) {
    const jobId = getJobIdFromPath(pathname)

    if (!jobId) {
      notFound(res)
      return
    }

    if (pathname.endsWith('/result')) {
      const result = service.getResult(jobId)
      if (!result) {
        const job = service.getJob(jobId)
        if (!job) {
          sendJson(res, 404, { message: 'Podcast job not found' })
          return
        }

        sendJson(res, 409, {
          message: 'Podcast result not ready',
          status: job.status,
          stage: job.stage,
          progress: job.progress,
        })
        return
      }
      sendJson(res, 200, result)
      return
    }

    const job = service.getJob(jobId)
    if (!job) {
      sendJson(res, 404, { message: 'Podcast job not found' })
      return
    }
    sendJson(res, 200, job)
    return
  }

  if (req.method === 'POST' && pathname.endsWith('/cancel')) {
    const jobId = getJobIdFromPath(pathname)

    if (!jobId) {
      notFound(res)
      return
    }

    const job = service.cancelJob(jobId)
    if (!job) {
      sendJson(res, 404, { message: 'Podcast job not found' })
      return
    }

    sendJson(res, 200, { jobId, status: job.status })
    return
  }

  notFound(res)
}

const port = Number(process.env.PORT ?? '4310')

createServer((req, res) => {
  handler(req, res).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error'
    sendJson(res, 500, { message })
  })
}).listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`document-to-podcast-api listening on ${port}`)
})
