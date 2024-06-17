import { RegistryUtils } from "../utils/registry-utils";
import { Platform } from "./docker/platform";
import { Image } from "./image";
import { Repository } from "./repository";

export class Tag {


    readonly platforms = new Map<string, Array<Platform>>()

    constructor(
        readonly digest: string,
        readonly mediaType: string,
        readonly repository: Repository,
        readonly name: string,
        // readonly contentType: string,
        readonly images: Array<Image>
    ) {
        images.forEach(image => {
            const platform = ({
                os: image.configuration.os,
                architecture: image.configuration.architecture,
                variant: image.configuration.variant
            })
            let array = this.platforms.get(platform.os)
            if (!array) {
                array = new Array<Platform>()
                this.platforms.set(platform.os, array)
            }
            array.push(platform)
        });
    }

    getPlatformTooltip(os: string): string {
        let architectures = this.platforms.get(os)?.map(platform => platform.architecture).join(", ")
        return "Operating System: " + os + "\nArchitecture: " + architectures
    }

    getPlatformNames(): Array<string> {
        return Array.from(this.platforms.keys())
    }

    getType(): string {
        return RegistryUtils.getType(this.mediaType)
    }

    getPullCommand() {
        return "docker pull " + this.getAbsolutePath()
    }

    getPushCommand() {
        return "docker push " + this.getAbsolutePath()
    }

    getAbsolutePath(){
        return this.repository.getAbsolutePath() + ":" + this.name
    }

    getRelativePath() {
        return this.repository.getRelativePath() + ":" + this.name
    }

}
