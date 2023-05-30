import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbPopoverModule, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { CopyTextComponent } from './components/copy-text/copy-text.component';
import { ErrorComponent } from './components/error/error.component';
import { LinkBoxComponent } from './components/link-box/link-box.component';
import { LogoComponent } from './components/logo/logo.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { TitleBoxComponent } from './components/title-box/title-box.component';
import { TitleComponent } from './components/title/title.component';
import { TimeAgoPipe } from './pipes/time-ago.pipe';

@NgModule({
  declarations: [
    CopyTextComponent,
    ErrorComponent,
    LinkBoxComponent,
    LogoComponent,
    SpinnerComponent,
    TimeAgoPipe,
    TitleBoxComponent,
    TitleComponent
  ],
  exports: [
    CopyTextComponent,
    ErrorComponent,
    LinkBoxComponent,
    LogoComponent,
    SpinnerComponent,
    TimeAgoPipe,
    TitleBoxComponent,
    TitleComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgbPopoverModule,
    NgbTooltip
  ]
})
export class SharedModule { }
