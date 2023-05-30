import { Component } from '@angular/core';
import { AuthProvider } from '../../providers/auth-provider';
import { AuthProviderService } from '../../services/auth-provider.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  template: '<html><head><title>Logout</title></head><body>logging out ..</body></html>',
})
export class LogoutComponent {

  private authProvider: AuthProvider | null

  constructor(private router: Router,
    authProviderService: AuthProviderService) {
    this.authProvider = authProviderService.getAuthProvider()
  }

  ngOnInit() {
    this.authProvider?.logout()
    this.router.navigate(['/login']);
  }

}
