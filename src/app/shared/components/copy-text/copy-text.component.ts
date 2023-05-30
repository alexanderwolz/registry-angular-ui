import { Component, Input } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-copy-text',
  templateUrl: './copy-text.component.html',
  styleUrls: ['./copy-text.component.scss']
})
export class CopyTextComponent {

  @Input() text: string = "Empty Text"
  @Input() tooltipText: string = "Empty Tooltip"

  constructor(private clipboard: Clipboard) { }

  copyToClipboard() {
    this.clipboard.copy(this.text);
  }

}
