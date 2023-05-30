import { Platform } from "./platform"

export interface ManifestReference {
    mediaType: string
    digest: string
    size: number
    platform: Platform
}
