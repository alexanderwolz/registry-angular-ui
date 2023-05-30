import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-link-box',
  templateUrl: './link-box.component.html',
  styleUrls: ['./link-box.component.scss']
})
export class LinkBoxComponent {

  @Input() routerLink: string = "";
  

}
