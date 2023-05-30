import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EmptyAuthProvider } from 'src/app/auth/providers/empty-auth-provider';
import { AuthProviderService } from 'src/app/auth/services/auth-provider.service';
import { Segment } from 'src/app/shared/models/segment';

const DEFAULT_USERNAME = "Unknown User"

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  segments: Array<Segment> = []

  username: string
  isAuthActive: boolean

  private subscription: Subscription | null = null

  constructor(
    private router: Router,
    authProviderService: AuthProviderService) {
    this.username = authProviderService.getCurrentUsername()
    this.isAuthActive = !(authProviderService.getAuthProvider instanceof EmptyAuthProvider)
  }

  ngOnInit() {
    this.subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.updateSegments()
      }
    });
    this.updateSegments()
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private updateSegments() {
    this.segments = []
    const url = this.router.url
    const segments = []
    segments.push(new Segment("Home", "/", url === "/"))
    segments.push(new Segment("Repositories", "/repositories", url.startsWith("/repositories")))
    this.segments = segments
  }

}
