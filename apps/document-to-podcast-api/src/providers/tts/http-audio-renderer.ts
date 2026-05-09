import { documentToPodcastConfig } from '../../config'
import type { AudioRenderer, RenderAudioInput, RenderAudioOutput } from './types'

interface HttpTtsResponse {
  durationSeconds?: unknown
  mimeType?: unknown
  suggestedFileName?: unknown
  audioBase64?: unknown
}

function ensureTtsConfig(): { baseUrl: string; apiKey: string; voice: string } {
  const { ttsBaseUrl, ttsApiKey, ttsVoice } = documentToPodcastConfig

  if (!ttsBaseUrl || !ttsApiKey || !ttsVoice) {
    throw new Error(
      'Missing TTS env config. Expected DOCUMENT_TO_PODCAST_TTS_BASE_URL, DOCUMENT_TO_PODCAST_TTS_API_KEY and DOCUMENT_TO_PODCAST_TTS_VOICE.',
    )
  }

  return {
    baseUrl: ttsBaseUrl,
    apiKey: ttsApiKey,
    voice: ttsVoice,
  }
}

function decodeBase64(base64: string): Uint8Array {
  return Uint8Array.from(Buffer.from(base64, 'base64'))
}

function getDefaultFileName(title: string): string {
  return `${title.replace(/\s+/g, '-').toLowerCase()}.mp3`
}

export class HttpAudioRenderer implements AudioRenderer {
  async render(input: RenderAudioInput): Promise<RenderAudioOutput> {
    const { baseUrl, apiKey, voice } = ensureTtsConfig()
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        voice,
        language: input.config.language,
        format: input.config.format,
        transcript: input.transcript,
      }),
    })

    if (!response.ok) {
      throw new Error(`TTS request failed: ${response.status} ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') ?? ''

    if (!contentType.includes('application/json')) {
      const audioBytes = new Uint8Array(await response.arrayBuffer())

      return {
        durationSeconds: input.config.durationMinutes * 60,
        mimeType: contentType || 'audio/mpeg',
        suggestedFileName: getDefaultFileName(input.transcript.title),
        audioBytes,
      }
    }

    const payload = (await response.json()) as HttpTtsResponse

    return {
      durationSeconds:
        typeof payload.durationSeconds === 'number'
          ? payload.durationSeconds
          : input.config.durationMinutes * 60,
      mimeType: typeof payload.mimeType === 'string' ? payload.mimeType : 'audio/mpeg',
      suggestedFileName:
        typeof payload.suggestedFileName === 'string'
          ? payload.suggestedFileName
          : getDefaultFileName(input.transcript.title),
      audioBase64:
        typeof payload.audioBase64 === 'string' ? payload.audioBase64 : undefined,
      audioBytes:
        typeof payload.audioBase64 === 'string' ? decodeBase64(payload.audioBase64) : undefined,
    }
  }
}
