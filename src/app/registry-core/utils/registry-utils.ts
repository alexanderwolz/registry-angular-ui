import { HttpHeaders } from "@angular/common/http"

export class RegistryUtils {

    static readonly MEDIA_DOCKER_MANIFEST_LIST = "application/vnd.docker.distribution.manifest.list.v2+json"
    static readonly MEDIA_DOCKER_MANIFEST = "application/vnd.docker.distribution.manifest.v2+json"
    static readonly MEDIA_OCI_INDEX = "application/vnd.oci.image.index.v1+json"
    static readonly MEDIA_OCI_MANIFEST = "application/vnd.oci.image.manifest.v1+json"

    static readonly TYPE_IMAGE = "Image"
    static readonly TYPE_UNKNOWN = "Unknown"



    static getType(mediaType:string): string {
        if (mediaType == RegistryUtils.MEDIA_DOCKER_MANIFEST_LIST ){
            return RegistryUtils.TYPE_IMAGE
        }
        if (mediaType == RegistryUtils.MEDIA_DOCKER_MANIFEST ){
            return RegistryUtils.TYPE_IMAGE
        }
        if (mediaType == RegistryUtils.MEDIA_OCI_INDEX ){
            return RegistryUtils.TYPE_IMAGE
        }
        if (mediaType == RegistryUtils.MEDIA_OCI_MANIFEST ){
            return RegistryUtils.TYPE_IMAGE
        }
        return RegistryUtils.TYPE_UNKNOWN;
    }

    static getManifestAcceptHeader(): HttpHeaders{
        return new HttpHeaders(
            { "Accept": RegistryUtils.MEDIA_DOCKER_MANIFEST + "," + RegistryUtils.MEDIA_OCI_MANIFEST }
        )
    }
    
    static getAllManifestsAcceptHeader(): HttpHeaders{
        return new HttpHeaders(
            { "Accept": RegistryUtils.MEDIA_DOCKER_MANIFEST + "," + RegistryUtils.MEDIA_DOCKER_MANIFEST_LIST + "," + RegistryUtils.MEDIA_OCI_INDEX + "," + RegistryUtils.MEDIA_OCI_MANIFEST }
        )
    }
}
