import { ManifestReference } from "./manifest-reference"

export interface ManifestList {
    mediaType: string
    schemaVersion: number
    manifests: Array<ManifestReference>
}
