import type {
  LlmProviderKind,
  ParserProviderKind,
  StorageProviderKind,
  TtsProviderKind,
} from './contracts/podcast'

export interface DocumentToPodcastConfig {
  parserProvider: ParserProviderKind
  llmProvider: LlmProviderKind
  ttsProvider: TtsProviderKind
  storageProvider: StorageProviderKind
  parserFetchUserAgent?: string
  llmBaseUrl?: string
  llmApiKey?: string
  llmModel?: string
  ttsBaseUrl?: string
  ttsApiKey?: string
  ttsVoice?: string
  storageRootDir?: string
}

function readProviderKind<T extends string>(value: string | undefined, fallback: T): T {
  return (value ?? fallback) as T
}

export const documentToPodcastConfig: DocumentToPodcastConfig = {
  parserProvider: readProviderKind<ParserProviderKind>(
    process.env.DOCUMENT_TO_PODCAST_PARSER_PROVIDER,
    'stub',
  ),
  llmProvider: readProviderKind<LlmProviderKind>(
    process.env.DOCUMENT_TO_PODCAST_LLM_PROVIDER,
    'stub',
  ),
  ttsProvider: readProviderKind<TtsProviderKind>(
    process.env.DOCUMENT_TO_PODCAST_TTS_PROVIDER,
    'stub',
  ),
  storageProvider: readProviderKind<StorageProviderKind>(
    process.env.DOCUMENT_TO_PODCAST_STORAGE_PROVIDER,
    'stub',
  ),
  parserFetchUserAgent: process.env.DOCUMENT_TO_PODCAST_PARSER_USER_AGENT,
  llmBaseUrl: process.env.DOCUMENT_TO_PODCAST_LLM_BASE_URL,
  llmApiKey: process.env.DOCUMENT_TO_PODCAST_LLM_API_KEY,
  llmModel: process.env.DOCUMENT_TO_PODCAST_LLM_MODEL,
  ttsBaseUrl: process.env.DOCUMENT_TO_PODCAST_TTS_BASE_URL,
  ttsApiKey: process.env.DOCUMENT_TO_PODCAST_TTS_API_KEY,
  ttsVoice: process.env.DOCUMENT_TO_PODCAST_TTS_VOICE,
  storageRootDir: process.env.DOCUMENT_TO_PODCAST_STORAGE_ROOT_DIR,
}
