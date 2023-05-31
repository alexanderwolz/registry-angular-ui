import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, mergeMap, of, throwError } from 'rxjs';
import { StorageService } from 'src/app/shared/services/storage.service';
import { AuthProvider } from '../providers/auth-provider';
import { BasicAuthProvider } from '../providers/basic-auth-provider';
import { EmptyAuthProvider } from '../providers/empty-auth-provider';
import { TokenAuthProvider } from '../providers/token-auth-provider';
import { EventService } from 'src/app/shared/services/event.service';

@Injectable({
  providedIn: 'root'
})
export class AuthProviderService {

  private error: Error | null = null;
  private authProvider: AuthProvider | null = null;

  private registryBaseUrl: string

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService,
    private eventService: EventService,
    @Inject('REGISTRY_HOST') registryHost: string,
    @Inject('TOKEN_SECRET') private tokenSecret: string) {
    this.registryBaseUrl = registryHost + "/v2/"
  }

  getAuthProvider(): AuthProvider | null {
    return this.authProvider;
  }

  getError(): Error | null {
    return this.error;
  }

  getCurrentUsername(): string {
    return this.authProvider?.getUsername() || "Unknown User"
  }

  resolveAuthProvider(): Observable<AuthProvider | null> {
    this.authProvider = null
    return this.http.head(this.registryBaseUrl)
      .pipe(
        map(() => {
          console.warn("Warning: " + this.registryBaseUrl + " seems to be an insecure repository!")
          this.authProvider = new EmptyAuthProvider(this.router, this.storageService, this.eventService, this.tokenSecret)
          return this.authProvider
        }),
        catchError(error => {
          if (error.status == 401) {
            const authenticate = error.headers.get("www-authenticate")
            if (authenticate) {
              if (authenticate.startsWith("Basic")) {
                const provider = new BasicAuthProvider(this.router, this.storageService, this.eventService, this.tokenSecret, this.http, this.registryBaseUrl)
                return this.setAuthProvider(provider)
              }
              if (authenticate.startsWith("Bearer")) {
                try {
                  const provider = this.createTokenAuthProviderFromAuthenticate(authenticate);
                  return this.setAuthProvider(provider)
                } catch (error: any) {
                  this.error = new Error("Header 'www-authenticate' could not be parsed.")
                  return this.setAuthProvider(null)
                }
              }
              //no authenticate header
              this.error = new Error("Unsupported Authenticate: '" + authenticate + "'")
              return this.setAuthProvider(null)
            }
            this.error = new Error("Expected header 'www-authenticate' does not exists. Check CORS settings.")
            return this.setAuthProvider(null)
          }
          if (error.status == 0) {
            console.log(error)
            this.error = new Error("Host seems to be down. Check CORS settings.")
            return this.setAuthProvider(null)
          }

          //any other unexpected error
          this.error = error
          return this.setAuthProvider(null)
        })
      )
  }

  private createTokenAuthProviderFromAuthenticate(authenticate: string): TokenAuthProvider {
    const cleanedAuthenticate = authenticate.replace("Bearer ", "").replaceAll('"', "").replaceAll(" ", "");
    const parsedAuthenticate = JSON.parse('{"' + cleanedAuthenticate.replaceAll(",", '", "').replaceAll("=", '": "') + '"}')
    const server = parsedAuthenticate.realm;
    const clientId = parsedAuthenticate.service;
    return new TokenAuthProvider(this.router, this.storageService, this.eventService, this.tokenSecret, server, clientId, this.http)
  }

  private setAuthProvider(authProvider: AuthProvider | null): Observable<AuthProvider | null> {
    this.authProvider = authProvider
    return of(this.authProvider)
  }

}
