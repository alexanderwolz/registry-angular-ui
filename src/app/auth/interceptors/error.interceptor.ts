import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthProviderService } from '../services/auth-provider.service';
import { REGISTRY_HOST } from '../../app.tokens';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const authProviderService = inject(AuthProviderService);
  const registryHost = inject(REGISTRY_HOST);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!(error.error instanceof ErrorEvent) && error.status == 401 && error.url !== null) {
        if (error.url === registryHost + '/v2/') {
          //ignore calls to the basic registry url, as we need that to retrieve the auth provider
          return throwError(() => error);
        }

        if (request.headers.has('authorization')) {
          //we need to fetch the actual provider here, as it would be null during init
          authProviderService.getAuthProvider()?.logout();
        }
      }
      return throwError(() => error);
    }),
  );
};
