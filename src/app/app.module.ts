import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgModule, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { Type } from './auth/providers/auth-provider';
import { errorInterceptor } from './auth/interceptors/error.interceptor';
import { AuthProviderService } from './auth/services/auth-provider.service';
import { SharedModule } from './shared/shared.module';

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

@NgModule({
  declarations: [AppComponent],
  imports: [AppRoutingModule, AuthModule, BrowserModule, SharedModule],
  providers: [
    provideZoneChangeDetection(),
    {
      provide: 'REGISTRY_HOST',
      useValue: environment.registryHost,
    },
    {
      provide: 'TOKEN_SECRET',
      useValue: environment.tokenSecret,
    },
    {
      provide: 'CHECK_PULL_ACCESS',
      useValue: environment.checkPullAccess,
    },
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideAppInitializer(initializeAuthProvider),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
