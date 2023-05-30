import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-title-box',
  templateUrl: './title-box.component.html',
  styleUrls: ['./title-box.component.scss']
})
export class TitleBoxComponent {
  @Input() segments: Array<String> = [];
  @Input() title: string = "Title"
}
