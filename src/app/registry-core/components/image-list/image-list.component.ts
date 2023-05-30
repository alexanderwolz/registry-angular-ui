import { Component, Input } from '@angular/core';
import { Tag } from '../../models/tag';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.scss']
})
export class ImageListComponent {

  @Input() tag: Tag | null = null;

}
