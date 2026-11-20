import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Tag } from '../../models/tag';

@Component({
  standalone: false,
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./tag-list.component.scss'],
})
export class TagListComponent {
  @Input() tags: Tag[] = [];

  @Input() showMoreLine = false;
}
