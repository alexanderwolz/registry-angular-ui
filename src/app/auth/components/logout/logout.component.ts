import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { AuthProvider } from '../../providers/auth-provider';
import { AuthProviderService } from '../../services/auth-provider.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<html><head><title>Logout</title></head><body>logging out ..</body></html>',
})
export class LogoutComponent implements OnInit {
  private router = inject(Router);

  private authProvider: AuthProvider | null;

  constructor() {
    const authProviderService = inject(AuthProviderService);

    this.authProvider = authProviderService.getAuthProvider();
  }

  ngOnInit() {
    this.authProvider?.logout();
    this.router.navigate(['/login']);
  }
}
