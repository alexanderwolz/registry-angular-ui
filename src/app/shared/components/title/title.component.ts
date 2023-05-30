import { Component, Input } from '@angular/core';
import { Repository } from 'src/app/registry-core/models/repository';

@Component({
  selector: 'app-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss']
})
export class TitleComponent {

  @Input() segments: Array<String> = [];
  @Input() title: string = "Title"

}
