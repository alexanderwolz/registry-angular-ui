import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthProviderService } from 'src/app/auth/services/auth-provider.service';
import { RegistryService } from 'src/app/registry-core/services/registry.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  username: string
  repositoryNames: Array<string> = []
  totalRepositoryCount: number = 0;
  registry: string = this.registryService.registry

  loading = true
  errorMessage = ""

  constructor(authProviderService: AuthProviderService, private registryService: RegistryService) {
    this.username = authProviderService.getCurrentUsername()
  }

  ngOnInit() {
    this.registryService.getAllRepositoryNames()
      .subscribe({
        next: (repositoryNames) => {
          this.repositoryNames = repositoryNames;
          this.totalRepositoryCount = repositoryNames.length;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          if (typeof error === 'string') {
            this.errorMessage = error;
            return
          }
          if (error instanceof HttpErrorResponse) {
            this.errorMessage = "Error " + error.status + ": " + error.message;
            return
          }
          console.error(error)
          this.errorMessage = error.message;
        }
      })
  }

}
