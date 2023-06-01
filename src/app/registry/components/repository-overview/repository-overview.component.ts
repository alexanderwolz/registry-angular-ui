import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthProviderService } from 'src/app/auth/services/auth-provider.service';
import { RegistryService } from 'src/app/registry-core/services/registry.service';
import { Repository } from '../../../registry-core/models/repository';

@Component({
  selector: 'app-repositories',
  templateUrl: './repository-overview.component.html',
  styleUrls: ['./repository-overview.component.scss']
})
export class RepositoryOverviewComponent {

  repositories: Map<string, Array<Repository>> = new Map();
  selectedRepositories: Array<Repository> = []

  otherNamespaces: Array<string> = [];

  userNamespace: string
  currentNamespace: string

  loading = false;

  errorMessage: string | null = null

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private registryService: RegistryService,
    authProviderService: AuthProviderService) {
    this.userNamespace = authProviderService.getCurrentUsername()
    this.currentNamespace = this.userNamespace
  }

  ngOnInit() {
    this.setNamespace(this.activatedRoute.snapshot.queryParams['namespace'])
    this.router.navigate([], { relativeTo: this.activatedRoute }); //remove query param
    this.refresh();
  }

  setNamespace(namespace: string) {
    this.currentNamespace = namespace || this.userNamespace
    this.selectedRepositories = this.repositories.get(this.currentNamespace) || []
  }

  private refresh() {
    this.loading = true
    this.registryService.getAllRepositoriesMappedByNamespace()
      .subscribe({
        next: (repositories) => {
          this.otherNamespaces = Array.from(repositories.keys()).filter(ns => ns !== this.userNamespace).sort()
          this.repositories = repositories
          this.setNamespace(this.currentNamespace)
          this.loading = false
        },
        error: (error) => {
          this.loading = false
          if (error instanceof Error) {
            this.errorMessage = error.message
            return
          }
          if (error instanceof HttpErrorResponse) {
            if (Array.isArray(error.error.errors)) {
              this.errorMessage = ""
              error.error.errors.forEach((error: any) => {
                this.errorMessage += error.message + " "
              });
              return
            }
            this.errorMessage = error.message
            return
          }
          console.error("Unhandled error:", error);
          this.errorMessage = error
        }
      });
  }

}
