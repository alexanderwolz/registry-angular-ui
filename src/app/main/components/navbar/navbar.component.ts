import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Type } from 'src/app/auth/providers/auth-provider';
import { AuthProviderService } from 'src/app/auth/services/auth-provider.service';
import { Segment } from 'src/app/shared/models/segment';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./navbar.component.scss'],
  imports: [RouterLink, LogoComponent, NgClass],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);

  segments = signal<Segment[]>([]);

  username: string;
  isAuthActive: boolean;

  private subscription: Subscription | null = null;

  constructor() {
    const authProviderService = inject(AuthProviderService);

    this.username = authProviderService.getCurrentUsername();
    this.isAuthActive = authProviderService.getAuthProvider()?.getType() !== Type.EMPTY;
  }

  ngOnInit() {
    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateSegments();
      }
    });
    this.updateSegments();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private updateSegments() {
    const url = this.router.url;
    this.segments.set([
      new Segment('Home', '/', url === '/'),
      new Segment('Repositories', '/repositories', url.startsWith('/repositories')),
    ]);
  }
}
