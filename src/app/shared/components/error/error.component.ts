import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ErrorEvent } from 'src/app/shared/models/error-event';
import { InfoEvent } from 'src/app/shared/models/info-event';
import { Notification } from 'src/app/shared/models/notification';
import { EventService } from 'src/app/shared/services/event.service';


@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {

  notifications: Array<Notification> = []

  private subscription: Subscription

  constructor(eventService: EventService) {
    this.subscription = eventService.subject.subscribe({
      next: (event) => {
        if (event instanceof ErrorEvent) {
          let message = event.message
          if (event.cause) {
            message += "<br><br>" + event.cause?.message
          }
          this.notifications.push(new Notification("Error:", message, "alert-danger"))
        }
        if (event instanceof InfoEvent) {
          this.notifications.push(new Notification("Info:", event.message, "alert-primary"))
        }
      }
    });
  }

  removeNotification(notification: Notification) {
    this.notifications = this.notifications.filter(n => n != notification);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

}
