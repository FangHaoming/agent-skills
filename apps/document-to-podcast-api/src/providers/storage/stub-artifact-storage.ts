import type { ArtifactStorage, StoreArtifactsInput, StoreArtifactsOutput } from './types'

export class StubArtifactStorage implements ArtifactStorage {
  async store(input: StoreArtifactsInput): Promise<StoreArtifactsOutput> {
    return {
      audioUrl: `https://mock.renderbus.local/podcasts/${input.jobId}.mp3`,
      transcriptUrl: `https://mock.renderbus.local/podcasts/${input.jobId}.json`,
      transcriptMarkdownUrl: `https://mock.renderbus.local/podcasts/${input.jobId}.md`,
    }
  }
}
