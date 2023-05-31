import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthProviderService } from 'src/app/auth/services/auth-provider.service';
import { RegistryService } from 'src/app/registry-core/services/registry.service';
import { Pagination } from '../../../registry-core/models/pagination';
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
    private activatedRoute: ActivatedRoute,
    private registryService: RegistryService,
    authProviderService: AuthProviderService) {
    this.userNamespace = authProviderService.getCurrentUsername()
    this.currentNamespace = this.userNamespace
  }

  ngOnInit() {
    this.setNamespace(this.activatedRoute.snapshot.queryParams['namespace']);
    this.refresh();
  }

  setNamespace(namespace: string | null) {
    this.currentNamespace = namespace || this.userNamespace
    this.selectedRepositories = this.repositories.get(this.currentNamespace) || []
  }

  refresh() {
    this.loading = true
    this.registryService.getRepositories(new Pagination(100), false)
      .subscribe({
        next: (repositories) => {
          const namespaces = new Array()
          for (const key of repositories.keys()) {
            if (key !== this.userNamespace) {
              namespaces.push(key)
            }
          }
          namespaces.sort();
          this.otherNamespaces = namespaces
          this.repositories = repositories
          if (!repositories.has(this.currentNamespace)) {
            this.setNamespace(this.userNamespace)
          }
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
