import { documentToPodcastConfig } from '../../config'
import type {
  PodcastTranscript,
  PodcastTranscriptLine,
  PodcastTranscriptSection,
} from '../../contracts/podcast'
import type { GenerateScriptInput, ScriptGenerator } from './types'

interface OpenAiCompatibleResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

interface TranscriptPayload {
  title?: unknown
  summary?: unknown
  sections?: unknown
}

function ensureLlmConfig(): { baseUrl: string; apiKey: string; model: string } {
  const { llmBaseUrl, llmApiKey, llmModel } = documentToPodcastConfig

  if (!llmBaseUrl || !llmApiKey || !llmModel) {
    throw new Error(
      'Missing LLM env config. Expected DOCUMENT_TO_PODCAST_LLM_BASE_URL, DOCUMENT_TO_PODCAST_LLM_API_KEY and DOCUMENT_TO_PODCAST_LLM_MODEL.',
    )
  }

  return {
    baseUrl: llmBaseUrl.replace(/\/$/, ''),
    apiKey: llmApiKey,
    model: llmModel,
  }
}

function normalizeLines(value: unknown): PodcastTranscriptLine[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      const candidate = item as Record<string, unknown>
      const speaker = candidate.speaker === 'guest' ? 'guest' : 'host'
      const text = typeof candidate.text === 'string' ? candidate.text : ''

      if (!text) {
        return undefined
      }

      return {
        speaker,
        text,
      }
    })
    .filter((item): item is PodcastTranscriptLine => Boolean(item))
}

function normalizeSections(value: unknown): PodcastTranscriptSection[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      const candidate = item as Record<string, unknown>
      const heading = typeof candidate.heading === 'string' ? candidate.heading : '未命名章节'
      const lines = normalizeLines(candidate.lines)

      if (!lines.length) {
        return undefined
      }

      return {
        heading,
        lines,
      }
    })
    .filter((item): item is PodcastTranscriptSection => Boolean(item))
}

function parseTranscriptPayload(content: string): PodcastTranscript {
  const payload = JSON.parse(content) as TranscriptPayload
  const title = typeof payload.title === 'string' ? payload.title : 'Generated Podcast Script'
  const summary = typeof payload.summary === 'string' ? payload.summary : 'Generated summary'
  const sections = normalizeSections(payload.sections)

  if (!sections.length) {
    throw new Error('LLM response does not contain valid transcript sections.')
  }

  return {
    title,
    summary,
    sections,
  }
}

function buildMessages(input: GenerateScriptInput): Array<Record<string, string>> {
  const focus = input.config.focus ?? '核心主题'
  const audience = input.config.audience ?? 'general-audience'
  const documents = input.documents
    .map((document, index) => `# Source ${index + 1}: ${document.title}\n${document.text}`)
    .join('\n\n')

  return [
    {
      role: 'system',
      content:
        'You generate podcast scripts. Return strict JSON with keys: title, summary, sections. Each section must contain heading and lines. Each line must contain speaker ("host" or "guest") and text.',
    },
    {
      role: 'user',
      content: [
        `Language: ${input.config.language}`,
        `Format: ${input.config.format}`,
        `Audience: ${audience}`,
        `Focus: ${focus}`,
        `Duration minutes: ${input.config.durationMinutes}`,
        'Sources:',
        documents,
      ].join('\n\n'),
    },
  ]
}

export class OpenAiCompatibleScriptGenerator implements ScriptGenerator {
  async generate(input: GenerateScriptInput): Promise<PodcastTranscript> {
    const { baseUrl, apiKey, model } = ensureLlmConfig()
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: {
          type: 'json_object',
        },
        messages: buildMessages(input),
      }),
    })

    if (!response.ok) {
      throw new Error(`LLM request failed: ${response.status} ${response.statusText}`)
    }

    const payload = (await response.json()) as OpenAiCompatibleResponse
    const content = payload.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('LLM response missing message content.')
    }

    return parseTranscriptPayload(content)
  }
}
