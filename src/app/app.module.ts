import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { Type } from './auth/providers/auth-provider';
import { AuthProviderService } from './auth/services/auth-provider.service';
import { SharedModule } from './shared/shared.module';

function initializeAuthProvider(authProviderService: AuthProviderService): () => Observable<any> {
  return () => authProviderService.resolveAuthProvider()
    .pipe(
      tap(provider => {
        if (provider) {
          console.debug("AuthProvider Type: " + Type[provider.getType()])
        }
      })
    )
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule,
    AuthModule,
    BrowserModule,
    HttpClientModule,
    SharedModule
  ],
  providers: [
    {
      provide: 'REGISTRY_HOST',
      useValue: environment.registryHost
    },
    {
      provide: 'TOKEN_SECRET',
      useValue: environment.tokenSecret
    },
    {
      provide: 'CHECK_PULL_ACCESS',
      useValue: environment.checkPullAccess
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuthProvider,
      deps: [AuthProviderService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
