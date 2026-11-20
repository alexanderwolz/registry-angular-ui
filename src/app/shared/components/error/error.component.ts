import { Component, ChangeDetectionStrategy, OnDestroy, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ErrorEvent } from 'src/app/shared/models/error-event';
import { InfoEvent } from 'src/app/shared/models/info-event';
import { Notification } from 'src/app/shared/models/notification';
import { EventService } from 'src/app/shared/services/event.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./error.component.scss'],
  imports: [NgClass],
})
export class ErrorComponent implements OnDestroy {
  notifications = signal<Notification[]>([]);

  private subscription: Subscription;

  constructor() {
    const eventService = inject(EventService);

    this.subscription = eventService.subject.subscribe({
      next: (event) => {
        if (event instanceof ErrorEvent) {
          let message = event.message;
          if (event.cause) {
            message += '<br><br>' + event.cause?.message;
          }
          this.notifications.update((list) => [
            ...list,
            new Notification('Error:', message, 'alert-danger'),
          ]);
        }
        if (event instanceof InfoEvent) {
          this.notifications.update((list) => [
            ...list,
            new Notification('Info:', event.message, 'alert-primary'),
          ]);
        }
      },
    });
  }

  removeNotification(notification: Notification) {
    this.notifications.update((list) => list.filter((n) => n !== notification));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
