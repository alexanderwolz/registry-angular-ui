import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AuthProvider } from '../../providers/auth-provider';
import { AuthProviderService } from '../../services/auth-provider.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-logout',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: '<html><head><title>Logout</title></head><body>logging out ..</body></html>',
})
export class LogoutComponent implements OnInit {
  private authProvider: AuthProvider | null;

  constructor(
    private router: Router,
    authProviderService: AuthProviderService,
  ) {
    this.authProvider = authProviderService.getAuthProvider();
  }

  ngOnInit() {
    this.authProvider?.logout();
    this.router.navigate(['/login']);
  }
}
