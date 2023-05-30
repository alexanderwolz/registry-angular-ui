import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthProviderService } from '../services/auth-provider.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private authProviderService: AuthProviderService,
    @Inject('REGISTRY_HOST') private registryHost: string) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
        } else {
          if (error.status == 401 && error.url !== null) {

            if (error.url === this.registryHost + "/v2/") {
              //ignore calls to the basic registry url, as we need that to retrieve the auth provider
              return throwError(() => error);
            }

            if (request.headers.has("authorization")) {
              //we need to fetch the actual provider here, as it would be null during init
              this.authProviderService.getAuthProvider()?.logout()
            }
          }
        }
        return throwError(() => error);
      })
    )
  }

}
