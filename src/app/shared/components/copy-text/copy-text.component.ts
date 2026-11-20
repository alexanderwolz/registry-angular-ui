import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { NgbPopover, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-copy-text',
  templateUrl: './copy-text.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./copy-text.component.scss'],
  imports: [NgbPopover, NgbTooltip],
})
export class CopyTextComponent {
  private clipboard = inject(Clipboard);

  @Input() text = 'Empty Text';
  @Input() tooltipText = 'Empty Tooltip';

  copyToClipboard() {
    this.clipboard.copy(this.text);
  }
}
