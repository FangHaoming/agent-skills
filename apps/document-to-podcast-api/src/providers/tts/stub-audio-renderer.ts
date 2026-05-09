import type { AudioRenderer, RenderAudioInput, RenderAudioOutput } from './types'

export class StubAudioRenderer implements AudioRenderer {
  async render(input: RenderAudioInput): Promise<RenderAudioOutput> {
    return {
      durationSeconds: input.config.durationMinutes * 60,
      mimeType: 'audio/mpeg',
      suggestedFileName: `${input.transcript.title.replace(/\s+/g, '-').toLowerCase()}.mp3`,
    }
  }
}
