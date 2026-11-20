import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { TitleComponent } from '../title/title.component';

@Component({
  selector: 'app-title-box',
  templateUrl: './title-box.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./title-box.component.scss'],
  imports: [TitleComponent],
})
export class TitleBoxComponent {
  @Input() segments: string[] = [];
  @Input() title = 'Title';
}
