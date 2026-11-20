import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-link-box',
  templateUrl: './link-box.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./link-box.component.scss'],
  imports: [RouterLink],
})
export class LinkBoxComponent {
  @Input() routerLink = '';
}
