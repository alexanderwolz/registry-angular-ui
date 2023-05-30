import { Manifest } from "./manifest"

export class ManifestContainer {
    constructor(
        readonly digest: string,
        readonly mediaType: string,
        readonly manifests: Array<Manifest>
    ) { }
}
