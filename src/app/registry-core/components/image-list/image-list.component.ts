import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Tag } from '../../models/tag';
import { RouterLink } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./image-list.component.scss'],
  imports: [RouterLink, NgbTooltip, DatePipe, TimeAgoPipe],
})
export class ImageListComponent {
  @Input() tag: Tag | null = null;
}
