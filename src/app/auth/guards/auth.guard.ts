import { inject } from '@angular/core';
import { CanActivateFn, NavigationExtras, Router } from '@angular/router';
import { AuthProviderService } from '../services/auth-provider.service';

const LOGIN_PAGE = "/login"

export const authGuard: CanActivateFn = (route, state) => {

  const authProviderService = inject(AuthProviderService);
  const router = inject(Router);

  const provider = authProviderService.getAuthProvider()
  if (provider && provider.isAuthenticated()) {
    return true;
  }

  let extras: NavigationExtras = {}
  if (state.url != "/") {
    extras.queryParams = { redirect: state.url }
  }

  return router.navigate([LOGIN_PAGE], extras);
};
