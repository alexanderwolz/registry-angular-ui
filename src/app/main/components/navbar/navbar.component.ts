import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Type } from 'src/app/auth/providers/auth-provider';
import { AuthProviderService } from 'src/app/auth/services/auth-provider.service';
import { Segment } from 'src/app/shared/models/segment';

const DEFAULT_USERNAME = 'Unknown User';

@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  segments: Segment[] = [];

  username: string;
  isAuthActive: boolean;

  private subscription: Subscription | null = null;

  constructor(
    private router: Router,
    authProviderService: AuthProviderService,
  ) {
    this.username = authProviderService.getCurrentUsername();
    this.isAuthActive = authProviderService.getAuthProvider()?.getType() !== Type.EMPTY;
  }

  ngOnInit() {
    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.updateSegments();
      }
    });
    this.updateSegments();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private updateSegments() {
    this.segments = [];
    const url = this.router.url;
    const segments = [];
    segments.push(new Segment('Home', '/', url === '/'));
    segments.push(new Segment('Repositories', '/repositories', url.startsWith('/repositories')));
    this.segments = segments;
  }
}
