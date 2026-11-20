import { TestBed } from '@angular/core/testing';
import { InfoEvent } from '../models/info-event';
import { EventService } from './event.service';

describe('EventService', () => {
  it('should deliver emitted events to subscribers', () => {
    const service = TestBed.inject(EventService);
    const received: unknown[] = [];
    service.subject.subscribe((event) => received.push(event));
    const event = new InfoEvent('hi');
    service.emit(event);
    expect(received).toEqual([event]);
  });
});
