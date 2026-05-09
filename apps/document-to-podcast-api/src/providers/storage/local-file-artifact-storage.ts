import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { documentToPodcastConfig } from '../../config'
import type { ArtifactStorage, StoreArtifactsInput, StoreArtifactsOutput } from './types'

function ensureStorageRootDir(): string {
  const rootDir = documentToPodcastConfig.storageRootDir

  if (!rootDir) {
    throw new Error(
      'Missing storage env config. Expected DOCUMENT_TO_PODCAST_STORAGE_ROOT_DIR for local-file storage provider.',
    )
  }

  return rootDir
}

function toMarkdown(input: StoreArtifactsInput): string {
  const lines: string[] = [`# ${input.transcript.title}`, '', input.transcript.summary, '']

  for (const section of input.transcript.sections) {
    lines.push(`## ${section.heading}`, '')

    for (const line of section.lines) {
      lines.push(`**${line.speaker}**: ${line.text}`, '')
    }
  }

  return lines.join('\n')
}

export class LocalFileArtifactStorage implements ArtifactStorage {
  async store(input: StoreArtifactsInput): Promise<StoreArtifactsOutput> {
    const rootDir = ensureStorageRootDir()
    const jobDir = path.join(rootDir, input.jobId)

    await mkdir(jobDir, { recursive: true })

    const transcriptJsonPath = path.join(jobDir, `${input.jobId}.json`)
    const transcriptMarkdownPath = path.join(jobDir, `${input.jobId}.md`)
    const audioMetadataPath = path.join(jobDir, `${input.jobId}.audio.json`)
    const audioFilePath = path.join(jobDir, input.audio.suggestedFileName)

    await writeFile(transcriptJsonPath, JSON.stringify(input.transcript, null, 2), 'utf8')
    await writeFile(transcriptMarkdownPath, toMarkdown(input), 'utf8')
    await writeFile(
      audioMetadataPath,
      JSON.stringify(
        {
          durationSeconds: input.audio.durationSeconds,
          mimeType: input.audio.mimeType,
          suggestedFileName: input.audio.suggestedFileName,
        },
        null,
        2,
      ),
      'utf8',
    )

    const audioBytes = input.audio.audioBytes
    const hasAudioBytes = audioBytes instanceof Uint8Array && audioBytes.byteLength > 0

    if (hasAudioBytes) {
      await writeFile(audioFilePath, audioBytes)
    }

    return {
      audioUrl: pathToFileURL(hasAudioBytes ? audioFilePath : audioMetadataPath).toString(),
      transcriptUrl: pathToFileURL(transcriptJsonPath).toString(),
      transcriptMarkdownUrl: pathToFileURL(transcriptMarkdownPath).toString(),
    }
  }
}
