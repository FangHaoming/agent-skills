import type { PodcastConfig, PodcastResult, PodcastSource } from '../contracts/podcast'
import { documentToPodcastConfig } from '../config'
import { createScriptGenerator } from '../providers/llm'
import { createDocumentParser } from '../providers/parser'
import { createArtifactStorage } from '../providers/storage'
import { createAudioRenderer } from '../providers/tts'

export interface GeneratePodcastArtifactsInput {
  jobId: string
  sources: PodcastSource[]
  config: PodcastConfig
}

export async function generatePodcastArtifacts(
  input: GeneratePodcastArtifactsInput,
): Promise<PodcastResult> {
  const parser = createDocumentParser(documentToPodcastConfig.parserProvider)
  const scriptGenerator = createScriptGenerator(documentToPodcastConfig.llmProvider)
  const audioRenderer = createAudioRenderer(documentToPodcastConfig.ttsProvider)
  const artifactStorage = createArtifactStorage(documentToPodcastConfig.storageProvider)

  const documents = await parser.parse(input.sources)
  const transcript = await scriptGenerator.generate({
    documents,
    config: input.config,
  })
  const audio = await audioRenderer.render({
    transcript,
    config: input.config,
  })
  const stored = await artifactStorage.store({
    jobId: input.jobId,
    transcript,
    audio,
  })

  return {
    audio: {
      url: stored.audioUrl,
      durationSeconds: audio.durationSeconds,
      mimeType: audio.mimeType,
    },
    transcript: {
      url: stored.transcriptUrl,
      markdownUrl: stored.transcriptMarkdownUrl,
    },
    summary: transcript.summary,
    transcriptContent: transcript,
  }
}
