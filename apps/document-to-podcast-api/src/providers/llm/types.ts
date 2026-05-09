import type { PodcastConfig, PodcastTranscript } from '../../contracts/podcast'
import type { ParsedDocument } from '../parser'

export interface GenerateScriptInput {
  documents: ParsedDocument[]
  config: PodcastConfig
}

export interface ScriptGenerator {
  generate(input: GenerateScriptInput): Promise<PodcastTranscript>
}
