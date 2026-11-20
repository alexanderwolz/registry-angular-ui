import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Tag } from '../../models/tag';
import { RouterLink } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./tag-list.component.scss'],
  imports: [RouterLink, NgbTooltip],
})
export class TagListComponent {
  @Input() tags: Tag[] = [];

  @Input() showMoreLine = false;
}
