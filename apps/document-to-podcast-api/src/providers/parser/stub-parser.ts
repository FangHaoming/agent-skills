import type { PodcastSource } from '../../contracts/podcast'
import type { DocumentParser, ParsedDocument } from './types'

function parseSourceTitle(source: PodcastSource, index: number): string {
  if (source.title) {
    return source.title
  }

  if (source.path) {
    const parts = source.path.split('/')
    return parts[parts.length - 1] || `source-${index + 1}`
  }

  if (source.url) {
    return source.url
  }

  return `source-${index + 1}`
}

function parseSourceText(source: PodcastSource, title: string): string {
  if (source.type === 'text') {
    return source.content ?? ''
  }

  if (source.type === 'file') {
    return `Stub parser extracted text from file "${title}".`
  }

  return `Stub parser extracted text from url "${title}".`
}

export class StubDocumentParser implements DocumentParser {
  async parse(sources: PodcastSource[]): Promise<ParsedDocument[]> {
    return sources.map((source, index) => {
      const title = parseSourceTitle(source, index)

      return {
        source,
        title,
        text: parseSourceText(source, title),
      }
    })
  }
}
