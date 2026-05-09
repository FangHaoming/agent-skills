import { OpenAiCompatibleScriptGenerator } from './openai-compatible-script-generator'
import type { LlmProviderKind } from '../../contracts/podcast'
import { StubScriptGenerator } from './stub-script-generator'
import type { ScriptGenerator } from './types'

export function createScriptGenerator(provider: LlmProviderKind): ScriptGenerator {
  switch (provider) {
    case 'openai-compatible':
      return new OpenAiCompatibleScriptGenerator()
    case 'stub':
    default:
      return new StubScriptGenerator()
  }
}

export type { GenerateScriptInput, ScriptGenerator } from './types'
