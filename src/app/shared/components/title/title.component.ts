import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Repository } from 'src/app/registry-core/models/repository';

@Component({
  standalone: false,
  selector: 'app-title',
  templateUrl: './title.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./title.component.scss'],
})
export class TitleComponent {
  @Input() segments: string[] = [];
  @Input() title = 'Title';
}
