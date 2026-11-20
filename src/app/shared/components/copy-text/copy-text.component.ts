import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  standalone: false,
  selector: 'app-copy-text',
  templateUrl: './copy-text.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./copy-text.component.scss'],
})
export class CopyTextComponent {
  @Input() text = 'Empty Text';
  @Input() tooltipText = 'Empty Tooltip';

  constructor(private clipboard: Clipboard) {}

  copyToClipboard() {
    this.clipboard.copy(this.text);
  }
}
