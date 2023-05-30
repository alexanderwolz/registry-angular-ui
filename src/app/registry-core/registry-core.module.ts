import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { BreadcrumbMenuComponent } from './components/breadcrumb-menu/breadcrumb-menu.component';
import { ImageListComponent } from './components/image-list/image-list.component';
import { TagDeleteButtonComponent } from './components/tag-delete-button/tag-delete-button.component';
import { TagListComponent } from './components/tag-list/tag-list.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    BreadcrumbMenuComponent,
    ImageListComponent,
    TagListComponent,
    TagDeleteButtonComponent
  ],
  exports: [
    BreadcrumbMenuComponent,
    ImageListComponent,
    TagListComponent,
    TagDeleteButtonComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    NgbTooltip
  ]
})
export class RegistryCoreModule { }
