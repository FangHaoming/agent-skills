import { HttpAudioRenderer } from './http-audio-renderer'
import type { TtsProviderKind } from '../../contracts/podcast'
import { StubAudioRenderer } from './stub-audio-renderer'
import type { AudioRenderer } from './types'

export function createAudioRenderer(provider: TtsProviderKind): AudioRenderer {
  switch (provider) {
    case 'http':
      return new HttpAudioRenderer()
    case 'stub':
    default:
      return new StubAudioRenderer()
  }
}

export type { AudioRenderer, RenderAudioInput, RenderAudioOutput } from './types'
