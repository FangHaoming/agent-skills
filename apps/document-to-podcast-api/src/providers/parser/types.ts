import type { PodcastSource } from '../../contracts/podcast'

export interface ParsedDocument {
  source: PodcastSource
  title: string
  text: string
}

export interface DocumentParser {
  parse(sources: PodcastSource[]): Promise<ParsedDocument[]>
}
