import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { routes } from './app.routes';
import { errorInterceptor } from './auth/interceptors/error.interceptor';
import { Type } from './auth/providers/auth-provider';
import { AuthProviderService } from './auth/services/auth-provider.service';
import { REGISTRY_HOST, TOKEN_SECRET, CHECK_PULL_ACCESS } from './app.tokens';

function initializeAuthProvider() {
  return inject(AuthProviderService)
    .resolveAuthProvider()
    .pipe(
      tap((provider) => {
        if (provider) {
          console.debug('AuthProvider Type: ' + Type[provider.getType()]);
        }
      }),
    );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor])),
    { provide: REGISTRY_HOST, useValue: environment.registryHost },
    { provide: TOKEN_SECRET, useValue: environment.tokenSecret },
    { provide: CHECK_PULL_ACCESS, useValue: String(environment.checkPullAccess) === 'true' },
    provideAppInitializer(initializeAuthProvider),
  ],
};
