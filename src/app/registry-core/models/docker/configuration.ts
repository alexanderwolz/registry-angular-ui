import { History } from "./history"
import { ImageConfig } from "./image-config"


export interface Configuration {
    docker_version: string
    architecture: string
    variant: string
    os: string
    config: ImageConfig
    created: string
    history: Array<History>
    size: number
    "moby.buildkit.buildinfo.v1": string
}