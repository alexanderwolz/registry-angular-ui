
export class Repository {

    static DEFAULT_NAMESPACE = "_default";

    readonly registry: string
    readonly segments: Array<string>;
    readonly namespace: string | null;
    readonly allNamespaces: Array<string>
    readonly name: string;

    //Images are stored in collections, known as a repository,
    //repository name is a key to an array of images (tags?)
    //constructor(readonly namespace: string | null, readonly imageName: string, readonly tags: Array<string>) { }

    constructor(registryHost: string, namespaces: Array<string> | null, name: string) {
        this.registry = registryHost.replace("http://", "").replaceAll("https://", "")
        this.allNamespaces = namespaces ? namespaces : [];
        if (this.allNamespaces && typeof this.allNamespaces === 'string') {
            this.allNamespaces = (this.allNamespaces as string).split("/")
        }
        this.namespace = this.allNamespaces[0]
        if (this.namespace === Repository.DEFAULT_NAMESPACE) {
            //this.namespace = null
            throw new Error("Must not be this name")
        }
        this.segments = this.allNamespaces.length > 1 ? this.allNamespaces.slice(1,) : [];
        this.name = name;
    }

    static fromString(registryHost: string, repositoryString: string): Repository {
        const parts = repositoryString.split("/");
        if (parts.length == 0) {
            throw new Error("Unsupported repository string: '" + repositoryString + "'");
        }
        const namespaces = parts.length > 1 ? parts.slice(0, parts.length - 1) : [];
        const name = parts[parts.length - 1];
        const repository = new Repository(registryHost, namespaces, name);
        if (repositoryString !== repository.getRelativePath()) {
            throw new Error("Convertion failed. Expected: '" + repositoryString + "', but was '" + repository.getRelativePath() + "'");
        }
        return repository;
    }

    getPushCommand() {
        return "docker push " + this.getAbsolutePath() + ":tagname"
    }

    getAbsolutePath(): string {
        return this.registry + "/" + this.getRelativePath();
    }

    getRelativePath(): string {
        if (!this.namespace) {
            return this.name;
        }
        let repositoryName = this.namespace + "/";
        this.segments.forEach(segment => {
            repositoryName += segment + "/";
        });
        return repositoryName + this.name;
    }

    getAllNamespacesAndNameAsArray(): Array<string> {
        const array = new Array<string>()
        this.allNamespaces.forEach(element => {
            array.push(element)
        });
        array.push(this.name)
        return array
    }

}
