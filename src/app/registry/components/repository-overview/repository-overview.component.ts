import { HttpErrorResponse } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthProviderService } from 'src/app/auth/services/auth-provider.service';
import { RegistryService } from 'src/app/registry-core/services/registry.service';
import { Repository } from '../../../registry-core/models/repository';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { BreadcrumbMenuComponent } from '../../../registry-core/components/breadcrumb-menu/breadcrumb-menu.component';
import { NgClass } from '@angular/common';
import { TitleBoxComponent } from '../../../shared/components/title-box/title-box.component';
import { LinkBoxComponent } from '../../../shared/components/link-box/link-box.component';
import { TitleComponent } from '../../../shared/components/title/title.component';

@Component({
  selector: 'app-repositories',
  templateUrl: './repository-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./repository-overview.component.scss'],
  imports: [
    SpinnerComponent,
    BreadcrumbMenuComponent,
    RouterLink,
    NgClass,
    TitleBoxComponent,
    LinkBoxComponent,
    TitleComponent,
  ],
})
export class RepositoryOverviewComponent implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private registryService = inject(RegistryService);

  repositories = signal(new Map<string, Repository[]>());
  selectedRepositories = signal<Repository[]>([]);

  otherNamespaces = signal<string[]>([]);

  userNamespace: string;
  currentNamespace = signal('');

  loading = signal(false);

  errorMessage = signal<string | null>(null);

  constructor() {
    const authProviderService = inject(AuthProviderService);

    this.userNamespace = authProviderService.getCurrentUsername();
    this.currentNamespace.set(this.userNamespace);
  }

  ngOnInit() {
    this.setNamespace(this.activatedRoute.snapshot.queryParams['namespace']);
    this.router.navigate([], { relativeTo: this.activatedRoute }); //remove query param
    this.refresh();
  }

  setNamespace(namespace: string) {
    this.currentNamespace.set(namespace || this.userNamespace);
    this.selectedRepositories.set(this.repositories().get(this.currentNamespace()) || []);
  }

  private refresh() {
    this.loading.set(true);
    this.registryService.getAllRepositoriesMappedByNamespace().subscribe({
      next: (repositories) => {
        this.otherNamespaces.set(
          Array.from(repositories.keys())
            .filter((ns) => ns !== this.userNamespace)
            .sort(),
        );
        this.repositories.set(repositories);
        this.setNamespace(this.currentNamespace());
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        if (error instanceof Error) {
          this.errorMessage.set(error.message);
          return;
        }
        if (error instanceof HttpErrorResponse) {
          if (Array.isArray(error.error.errors)) {
            this.errorMessage.set(
              error.error.errors.map((item: { message: string }) => item.message + ' ').join(''),
            );
            return;
          }
          this.errorMessage.set(error.message);
          return;
        }
        console.error('Unhandled error:', error);
        this.errorMessage.set(String(error));
      },
    });
  }
}
