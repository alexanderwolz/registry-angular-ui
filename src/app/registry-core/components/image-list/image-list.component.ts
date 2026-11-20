import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Tag } from '../../models/tag';

@Component({
  standalone: false,
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./image-list.component.scss'],
})
export class ImageListComponent {
  @Input() tag: Tag | null = null;
}
