import { TextUrlDocumentParser } from './text-url-document-parser'
import type { ParserProviderKind } from '../../contracts/podcast'
import { StubDocumentParser } from './stub-parser'
import type { DocumentParser } from './types'

export function createDocumentParser(provider: ParserProviderKind): DocumentParser {
  switch (provider) {
    case 'text-url':
      return new TextUrlDocumentParser()
    case 'stub':
    default:
      return new StubDocumentParser()
  }
}

export type { DocumentParser, ParsedDocument } from './types'
