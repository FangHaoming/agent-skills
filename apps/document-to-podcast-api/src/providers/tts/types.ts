import type { PodcastConfig, PodcastTranscript } from '../../contracts/podcast'

export interface RenderAudioInput {
  transcript: PodcastTranscript
  config: PodcastConfig
}

export interface RenderAudioOutput {
  durationSeconds: number
  mimeType: string
  suggestedFileName: string
  audioBase64?: string
  audioBytes?: Uint8Array
}

export interface AudioRenderer {
  render(input: RenderAudioInput): Promise<RenderAudioOutput>
}
