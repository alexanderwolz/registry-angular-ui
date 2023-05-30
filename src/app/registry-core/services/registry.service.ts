import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { Observable, catchError, concatMap, forkJoin, map, mergeMap, of, tap, throwError } from 'rxjs';
import { Scope } from 'src/app/auth/models/scope';
import { AuthProviderService } from 'src/app/auth/services/auth-provider.service';
import { Configuration } from '../models/docker/configuration';
import { Manifest } from '../models/docker/manifest';
import { ManifestContainer } from '../models/docker/manifest-container';
import { ManifestList } from '../models/docker/manifest-list';
import { Image } from '../models/image';
import { Pagination } from '../models/pagination';
import { Repository } from '../models/repository';
import { Tag } from '../models/tag';

//see also https://docs.docker.com/registry/spec/api/
//this service tries to wrap this API


@Injectable({
  providedIn: 'root'
})
export class RegistryService {

  //TODO find a way to cache paginated repos
  private allRepositoryNames: Array<string> | null = null;

  private allTagNames = new Map<string, Array<string>>();
  private tags = new Map<string, Tag>();

  readonly registry: string;

  constructor(
    private http: HttpClient,
    private authProviderService: AuthProviderService,
    @Inject('REGISTRY_HOST') private registryHost: string) {
    this.registry = registryHost.replace("http://", "").replaceAll("https://", "")
  }

  getAllRepositoryNames(): Observable<Array<string>> {
    if (this.allRepositoryNames) {
      return of(this.allRepositoryNames)
    }
    return this.loadRepositoryNames().pipe(tap(names => this.allRepositoryNames = names))
  }

  getRepositories(pagination?: Pagination, checkPullAccess?: boolean): Observable<Map<string, Array<Repository>>> {
    return this.loadRepositoryNames(pagination)
      .pipe(
        map(repositoryNames => this.converToRepositories(repositoryNames))
      )
      .pipe(
        mergeMap(repositories => {
          if (checkPullAccess) {
            forkJoin(
              repositories.map(repository => this.isPrivilegedRepository(repository)
                .pipe(map(isPrivielged => isPrivielged ? repository : null)))
            )
          }
          return of(repositories)
        })
      )
      .pipe(map(resultArray => resultArray.filter(repository => !!repository)))
      .pipe(map(repositories => this.createNamespaceMap(repositories))
      );
  }

  loadTags(repository: Repository, pagination?: Pagination): Observable<Array<any>> {
    return this.loadTagNames(repository, pagination)
      .pipe(
        concatMap(tagNames => {
          if (tagNames.length > 0) {
            return forkJoin(tagNames.map(
              tagName => this.getTag(repository, tagName)
            ))
          }
          return of([])
        })
      )
  }

  getAllTagNames(repository: Repository): Observable<Array<string>> {
    const key = repository.getAbsolutePath();
    const tagNames = this.allTagNames.get(key)
    if (tagNames) {
      return of(tagNames)
    }
    return this.loadTagNames(repository).pipe(tap(tagNames => this.allTagNames.set(key, tagNames)))
  }

  loadTagNames(repository: Repository, pagination?: Pagination): Observable<Array<string>> {
    const endpoint = repository.getRelativePath() + "/tags/list"
    const scope = new Scope("repository", repository.getRelativePath(), ["pull"])
    return this.get(endpoint, scope, undefined, this.createPaginationQueryParams(pagination))
      .pipe(map(httpResponse => httpResponse.body.tags || []))
  }

  getTag(repository: Repository, tagName: string): Observable<Tag> {
    const key = repository.getAbsolutePath + ":" + tagName;
    const tag = this.tags.get(key)
    if (tag) {
      return of(tag)
    }
    return this.loadTag(repository, tagName).pipe(tap(tag => this.tags.set(key, tag)));
  }

  private loadTag(repository: Repository, tagName: string): Observable<Tag> {
    return this.loadManifests(repository, tagName)
      .pipe(
        mergeMap(container => {
          return forkJoin(
            container.manifests.map(
              manifest => this.loadConfiguration(repository, manifest.config.digest)
                .pipe(
                  map(config => new Image(manifest, config))
                )
            )
          ).pipe(map(images => new Tag(container.digest, container.mediaType, repository, tagName, images)))
        })
      )
  }

  deleteTag(tag: Tag): Observable<boolean> {
    const endpoint = tag.repository.getRelativePath() + "/manifests/" + tag.digest
    const scope = new Scope("repository", tag.repository.getRelativePath(), ["delete"])
    return this.delete(endpoint, scope)
      .pipe(
        map(response => {
          const success = (response.status >= 200 && response.status < 300)
          if (success) {
            const key = tag.repository.getAbsolutePath() + ":" + tag.name
            this.tags.delete(key)
          }
          //does it just return 204?
          return success
        })
      )
  }

  createRepository(namespaces: Array<string> | null, name: string): Repository {
    return new Repository(this.registry, namespaces, name)
  }




  /** private methods **/

  private converToRepositories(repositoryNames: Array<string>): Array<Repository> {
    if (!repositoryNames) {
      return [];
    }
    return repositoryNames.map((repositoryName: string) => Repository.fromString(this.registry, repositoryName))
  }

  private loadManifests(repository: Repository, tag: string): Observable<ManifestContainer> {
    const endpoint = repository.getRelativePath() + "/manifests/" + tag
    const scope = new Scope("repository", repository.getRelativePath(), ["pull"])
    //we have to differ between these two content types
    //see https://docs.docker.com/registry/spec/api/
    const manifest = "application/vnd.docker.distribution.manifest.v2+json"
    const manifestList = "application/vnd.docker.distribution.manifest.list.v2+json"
    const headers = new HttpHeaders({ "Accept": manifest + "," + manifestList })
    return this.get(endpoint, scope, headers, undefined)
      .pipe(
        mergeMap((response: HttpResponse<any>) => {
          const digest = response.headers.get('docker-content-digest') || response.headers.get('etag')
          //TODO docker-content-digest, ETag headers for delete
          const contentType = response.headers.get("content-type")
          if (contentType === manifest) {
            return of(new ManifestContainer(digest!, contentType, [response.body as Manifest]))
          }
          if (contentType === manifestList) {
            const manifestList = response.body as ManifestList
            return forkJoin(
              manifestList.manifests.map(
                reference => this.loadSingleManifestFromDigest(repository, reference.digest)
              )
            ).pipe(
              map(manifests => new ManifestContainer(digest!, contentType, manifests))
            )
          }
          return throwError(() => new Error("Unsupported content type: '" + contentType + "'"))
        })
      )
  }

  private loadRepositoryNames(pagination?: Pagination): Observable<Array<string>> {
    const endpoint = "_catalog"
    const scope = new Scope("registry", "catalog", ["*"])
    return this.get(endpoint, scope, undefined, this.createPaginationQueryParams(pagination))
      .pipe(map(httpResponse => httpResponse.body.repositories))
  }

  private createNamespaceMap(repositories: Array<Repository>): Map<string, Array<Repository>> {
    const namespaceMap = new Map<string, Array<Repository>>()
    repositories.forEach(repository => {
      const namespace = repository.namespace ? repository.namespace : Repository.DEFAULT_NAMESPACE
      let array = namespaceMap.get(namespace)
      if (!array) {
        array = new Array()
        namespaceMap.set(namespace, array)
      }
      array.push(repository)
    });
    return namespaceMap
  }

  private loadSingleManifestFromDigest(repository: Repository, digest: string): Observable<Manifest> {
    const endpoint = repository.getRelativePath() + "/manifests/" + digest
    const scope = new Scope("repository", repository.getRelativePath(), ["pull"])
    const headers = new HttpHeaders({ "Accept": "application/vnd.docker.distribution.manifest.v2+json" })
    return this.get(endpoint, scope, headers, undefined)
      .pipe(
        map((response: HttpResponse<any>) => {
          return response.body as Manifest
        })
      )
  }

  private loadConfiguration(repository: Repository, digest: string): Observable<Configuration> {
    const endpoint = repository.getRelativePath() + "/blobs/" + digest
    const scope = new Scope("repository", repository.getRelativePath(), ["pull"])
    return this.get(endpoint, scope)
      .pipe(map(response => response.body))
  }

  private createPaginationQueryParams(pagination?: Pagination): HttpParams | undefined {
    let queryParams: HttpParams | undefined = undefined
    if (pagination) {
      queryParams = new HttpParams()
      queryParams = queryParams.append("n", pagination.limit)
      if (pagination.last) {
        queryParams = queryParams.append("last", pagination.last)
      }
    }
    return queryParams;
  }

  private get(endpoint: string, scope: Scope, headers?: HttpHeaders, params?: HttpParams): Observable<HttpResponse<any>> {
    return this.createAuthorizationHeader(scope)
      .pipe(
        mergeMap(authorization => {
          let httpOptions: Params = {}
          httpOptions['observe'] = "response"

          let httpheaders = headers ? headers : new HttpHeaders();

          if (authorization) {
            httpheaders = httpheaders.append('Authorization', authorization)
            httpOptions['withCredentials'] = false //do not show basic auth prompt
          }
          if (params) {
            httpOptions['params'] = params
          }
          if (httpheaders.keys().length > 0) {
            httpOptions['headers'] = httpheaders
          }

          const url = this.registryHost + "/v2/" + endpoint
          return this.http.get(url, httpOptions) as Observable<HttpResponse<any>>
        })
      );
  }

  private delete(endpoint: string, scope: Scope, headers?: HttpHeaders, params?: HttpParams): Observable<HttpResponse<any>> {
    return this.createAuthorizationHeader(scope)
      .pipe(
        mergeMap(authorization => {
          let httpOptions: Params = {}
          httpOptions['observe'] = "response"

          let httpheaders = headers ? headers : new HttpHeaders();

          if (authorization) {
            httpheaders = httpheaders.append('Authorization', authorization)
            httpOptions['withCredentials'] = false //do not show basic auth prompt
          }
          if (params) {
            httpOptions['params'] = params
          }
          if (httpheaders.keys().length > 0) {
            httpOptions['headers'] = httpheaders
          }

          const url = this.registryHost + "/v2/" + endpoint
          return this.http.delete(url, httpOptions) as Observable<HttpResponse<any>>
        })
      );
  }

  private isPrivilegedRepository(repository: Repository): Observable<boolean> {
    return this.createAuthorizationHeader(new Scope("repository", repository.getRelativePath(), ["pull"]))
      .pipe(
        map(() => {
          return true
        }),
        catchError((() => {
          return of(false)
        }))
      );
  }

  private createAuthorizationHeader(scope: Scope): Observable<string> {
    const provider = this.authProviderService.getAuthProvider()
    if (!provider) {
      return throwError(() => { "No AuthProvider" })
    }
    return provider.getAuthorizationFor(scope)
  }

}