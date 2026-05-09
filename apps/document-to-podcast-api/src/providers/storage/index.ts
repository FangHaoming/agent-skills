import { LocalFileArtifactStorage } from './local-file-artifact-storage'
import type { StorageProviderKind } from '../../contracts/podcast'
import { StubArtifactStorage } from './stub-artifact-storage'
import type { ArtifactStorage } from './types'

export function createArtifactStorage(provider: StorageProviderKind): ArtifactStorage {
  switch (provider) {
    case 'local-file':
      return new LocalFileArtifactStorage()
    case 'stub':
    default:
      return new StubArtifactStorage()
  }
}

export type { ArtifactStorage, StoreArtifactsInput, StoreArtifactsOutput } from './types'
