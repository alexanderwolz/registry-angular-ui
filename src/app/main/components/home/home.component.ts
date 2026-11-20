import { HttpErrorResponse } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { AuthProviderService } from 'src/app/auth/services/auth-provider.service';
import { RegistryService } from 'src/app/registry-core/services/registry.service';
import { ErrorEvent } from 'src/app/shared/models/error-event';
import { EventService } from 'src/app/shared/services/event.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./home.component.scss'],
  imports: [SpinnerComponent, RouterLink],
})
export class HomeComponent implements OnInit {
  private eventService = inject(EventService);
  private registryService = inject(RegistryService);

  username: string;
  totalRepositoryCount = signal(0);
  registry: string = this.registryService.registry;

  loading = signal(true);

  constructor() {
    const authProviderService = inject(AuthProviderService);

    this.username = authProviderService.getCurrentUsername();
  }

  ngOnInit() {
    this.registryService.getTotalRepositoryCount().subscribe({
      next: (count) => {
        this.totalRepositoryCount.set(count);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.eventService.emit(new ErrorEvent(this.getErrorMessage(error), error));
      },
    });
  }

  private getErrorMessage(error: Error): string {
    if (typeof error === 'string') {
      return error;
    }
    if (error instanceof HttpErrorResponse) {
      return error.status + ': ' + error.message;
    }
    return error.message;
  }
}
