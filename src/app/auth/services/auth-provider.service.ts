import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, throwError } from 'rxjs';
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
    return this.authProvider
  }

  getCurrentUsername(): string {
    return this.authProvider?.getUsername() || "Unknown User"
  }

  resolveAuthProvider(): Observable<AuthProvider | null> {
    this.authProvider = null
    return this.http.get(this.registryBaseUrl)
      .pipe(
        map(() => {
          console.warn("Warning: " + this.registryBaseUrl + " seems to be an insecure repository!")
          this.authProvider = new EmptyAuthProvider(this.router, this.storageService, this.eventService, this.tokenSecret)
          return this.authProvider
        }),
        catchError(err => {
          this.authProvider = null
          if (err.status == 401) {
            const authenticate = err.headers.get("www-authenticate")
            if (authenticate) {
              if (authenticate.startsWith("Basic")) {
                this.authProvider = new BasicAuthProvider(this.router, this.storageService, this.eventService, this.tokenSecret, authenticate, this.http, this.registryBaseUrl)
              }
              if (authenticate.startsWith("Bearer")) {
                this.authProvider = new TokenAuthProvider(this.router, this.storageService, this.eventService, this.tokenSecret, authenticate, this.http)
              }
              return of(this.authProvider)
            }
            console.error("Expected header 'www-authenticate' does not exists. Check CORS settings.");
            return of(this.authProvider)
          }
          console.error("Unexpected Error: ",err)
          return of(this.authProvider) //should be null
        })
      )
  }

}
