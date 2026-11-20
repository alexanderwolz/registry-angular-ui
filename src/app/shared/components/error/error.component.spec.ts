import { TestBed } from '@angular/core/testing';
import { ErrorEvent } from '../../models/error-event';
import { InfoEvent } from '../../models/info-event';
import { EventService } from '../../services/event.service';
import { ErrorComponent } from './error.component';

describe('ErrorComponent', () => {
  function create() {
    TestBed.configureTestingModule({ imports: [ErrorComponent] });
    const fixture = TestBed.createComponent(ErrorComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance, events: TestBed.inject(EventService) };
  }

  it('should show nothing without events', () => {
    expect((create().fixture.nativeElement as HTMLElement).querySelectorAll('.alert').length).toBe(
      0,
    );
  });

  it('should show info events as primary alerts', () => {
    const { fixture, component, events } = create();
    events.emit(new InfoEvent('saved'));
    fixture.detectChanges();
    expect(component.notifications().length).toBe(1);
    const alert = (fixture.nativeElement as HTMLElement).querySelector('.alert')!;
    expect(alert.classList.contains('alert-primary')).toBe(true);
    expect(alert.textContent).toContain('saved');
  });

  it('should show error events with their cause as danger alerts', () => {
    const { fixture, events } = create();
    events.emit(new ErrorEvent('failed', new Error('why')));
    fixture.detectChanges();
    const alert = (fixture.nativeElement as HTMLElement).querySelector('.alert')!;
    expect(alert.classList.contains('alert-danger')).toBe(true);
    expect(alert.textContent).toContain('failed');
    expect(alert.textContent).toContain('why');
  });

  it('should render html in messages (used for emphasis)', () => {
    const { fixture, events } = create();
    events.emit(new InfoEvent('deleted <strong>app:v1</strong>'));
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.alert span strong')?.textContent,
    ).toBe('app:v1');
  });

  it('should remove a dismissed notification only', () => {
    const { fixture, component, events } = create();
    events.emit(new InfoEvent('one'));
    events.emit(new InfoEvent('two'));
    component.removeNotification(component.notifications()[0]);
    fixture.detectChanges();
    expect(component.notifications().map((n) => n.message)).toEqual(['two']);
  });

  it('should stop listening when destroyed', () => {
    const { fixture, component, events } = create();
    fixture.destroy();
    events.emit(new InfoEvent('late'));
    expect(component.notifications()).toEqual([]);
  });
});
