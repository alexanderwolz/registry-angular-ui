import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-title-box',
  templateUrl: './title-box.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./title-box.component.scss'],
})
export class TitleBoxComponent {
  @Input() segments: string[] = [];
  @Input() title = 'Title';
}
