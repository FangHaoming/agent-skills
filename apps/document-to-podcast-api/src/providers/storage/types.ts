import type { PodcastTranscript } from '../../contracts/podcast'
import type { RenderAudioOutput } from '../tts'

export interface StoreArtifactsInput {
  jobId: string
  transcript: PodcastTranscript
  audio: RenderAudioOutput
}

export interface StoreArtifactsOutput {
  audioUrl: string
  transcriptUrl: string
  transcriptMarkdownUrl: string
}

export interface ArtifactStorage {
  store(input: StoreArtifactsInput): Promise<StoreArtifactsOutput>
}
