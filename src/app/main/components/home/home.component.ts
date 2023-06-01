import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthProviderService } from 'src/app/auth/services/auth-provider.service';
import { RegistryService } from 'src/app/registry-core/services/registry.service';
import { ErrorEvent } from 'src/app/shared/models/error-event';
import { EventService } from 'src/app/shared/services/event.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  username: string
  totalRepositoryCount: number = 0;
  registry: string = this.registryService.registry

  loading = true

  constructor(
    authProviderService: AuthProviderService,
    private eventService: EventService,
    private registryService: RegistryService) {
    this.username = authProviderService.getCurrentUsername()
  }

  ngOnInit() {
    this.registryService.getTotalRepositoryCount()
      .subscribe({
        next: (count) => {
          this.totalRepositoryCount = count
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.eventService.emit(new ErrorEvent(this.getErrorMessage(error), error))
        }
      })
  }

  private getErrorMessage(error: Error): string {

    if (typeof error === 'string') {
      return error;
    }
    if (error instanceof HttpErrorResponse) {
      return error.status + ": " + error.message;
    }
    return error.message;
  }

}
