import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Event } from '../models/event';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  subject = new Subject<Event>();

  emit(event: Event) {
    this.subject.next(event);
  }
}
