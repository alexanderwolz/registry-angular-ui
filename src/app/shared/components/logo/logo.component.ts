import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./logo.component.scss'],
  imports: [NgClass],
})
export class LogoComponent {
  @Input() dark = false;
}
