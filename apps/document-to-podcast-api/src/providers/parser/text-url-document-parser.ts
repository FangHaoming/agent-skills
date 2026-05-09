import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { documentToPodcastConfig } from '../../config'
import type { PodcastSource } from '../../contracts/podcast'
import type { DocumentParser, ParsedDocument } from './types'

function getSourceTitle(source: PodcastSource, index: number): string {
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

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
}

function stripHtml(input: string): string {
  return decodeHtmlEntities(
    input
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<!--([\s\S]*?)-->/g, ' ')
      .replace(/<\/(p|div|section|article|li|h1|h2|h3|h4|h5|h6|br)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ ]{2,}/g, ' ')
      .trim(),
  )
}

async function parseUrlSource(source: PodcastSource, title: string): Promise<ParsedDocument> {
  if (!source.url) {
    throw new Error('URL source missing url field.')
  }

  const headers: Record<string, string> = {}

  if (documentToPodcastConfig.parserFetchUserAgent) {
    headers['User-Agent'] = documentToPodcastConfig.parserFetchUserAgent
  }

  const response = await fetch(source.url, { headers })

  if (!response.ok) {
    throw new Error(`Parser request failed: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  const text = stripHtml(html)

  if (!text) {
    throw new Error(`Parser extracted empty text from url "${source.url}".`)
  }

  return {
    source,
    title,
    text,
  }
}

function parseTextSource(source: PodcastSource, title: string): ParsedDocument {
  return {
    source,
    title,
    text: (source.content ?? '').trim(),
  }
}

async function parseFileSource(source: PodcastSource, title: string): Promise<ParsedDocument> {
  if (!source.path) {
    throw new Error('File source missing path field.')
  }

  const resolvedPath = path.resolve(source.path)
  const extension = path.extname(resolvedPath).toLowerCase()
  const rawText = await readFile(resolvedPath, 'utf8')

  if (extension === '.json') {
    try {
      const parsed = JSON.parse(rawText) as unknown

      return {
        source,
        title,
        text: JSON.stringify(parsed, null, 2),
      }
    } catch {
      return {
        source,
        title,
        text: rawText.trim(),
      }
    }
  }

  if (extension === '.txt' || extension === '.md') {
    return {
      source,
      title,
      text: rawText.trim(),
    }
  }

  return {
    source,
    title,
    text: `Parser provider "text-url" only supports .txt, .md and .json files. Current file "${title}" is not supported yet.`,
  }
}

export class TextUrlDocumentParser implements DocumentParser {
  async parse(sources: PodcastSource[]): Promise<ParsedDocument[]> {
    const results: ParsedDocument[] = []

    for (const [index, source] of sources.entries()) {
      const title = getSourceTitle(source, index)

      if (source.type === 'text') {
        results.push(parseTextSource(source, title))
        continue
      }

      if (source.type === 'url') {
        results.push(await parseUrlSource(source, title))
        continue
      }

      results.push(await parseFileSource(source, title))
    }

    return results
  }
}
