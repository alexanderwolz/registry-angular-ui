import { RegistryUtils } from "../utils/registry-utils";
import { Configuration } from "./docker/configuration";
import { Manifest } from "./docker/manifest";
import { Platform } from "./docker/platform";
import { Layer } from "./layer";

export class Image {

    readonly digest: string
    readonly digestShort: string
    readonly totalCompressedSizeString: string
    readonly platform: Platform
    readonly platformString: string
    readonly layers: Array<Layer>

    constructor(readonly manifest: Manifest, readonly configuration: Configuration) {
        this.digest = manifest.config.digest
        this.digestShort = this.digest.replace("sha256:", "").slice(0, 12);
        this.totalCompressedSizeString = this.getTotalCompressedSizeString()
        this.platform = ({ os: configuration.os, architecture: configuration.architecture, variant: configuration.variant })
        this.platformString = this.createPlatformString()
        this.layers = this.createLayers();
    }

    private getTotalCompressedSizeString(): string {
        let size = 0;
        this.manifest.layers.forEach(item => {
            size += item.size
        });
        if (size < Layer.KB) {
            return size.toFixed(2) + " B"
        }
        if (size < Layer.MB) {
            return (size / Layer.KB).toFixed(2) + " KB"
        }
        if (size < Layer.GB) {
            return (size / Layer.MB).toFixed(2) + " MB"
        }
        return (size / Layer.GB).toFixed(2) + " GB"
    }

    private createPlatformString() {
        let displayName = this.platform.os + "/" + this.platform.architecture;
        if (this.platform.variant) {
            displayName += "/" + this.platform.variant
        }
        return displayName
    }

    private createLayers(): Array<Layer> {
        const layers = new Array<Layer>
        let layerIndex = -1;
        this.configuration.history.forEach(history => {
            let size = 0;
            if (!history.empty_layer) {
                size = this.manifest.layers[++layerIndex].size
            }
            layers.push(new Layer(history.created_by, size))
        });
        return layers
    }

    getType(): string {
        return RegistryUtils.getType(this.manifest.mediaType)
    }

}
