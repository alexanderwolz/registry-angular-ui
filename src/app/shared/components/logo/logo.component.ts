import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./logo.component.scss'],
})
export class LogoComponent {
  @Input() dark = false;
}
