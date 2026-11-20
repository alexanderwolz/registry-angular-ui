import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-link-box',
  templateUrl: './link-box.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./link-box.component.scss'],
})
export class LinkBoxComponent {
  @Input() routerLink = '';
}
