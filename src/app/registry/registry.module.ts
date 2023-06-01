import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthModule } from '../auth/auth.module';
import { RegistryCoreModule } from '../registry-core/registry-core.module';
import { SharedModule } from '../shared/shared.module';
import { ImageDetailComponent } from './components/image-detail/image-detail.component';
import { RepositoryDetailComponent } from './components/repository-detail/repository-detail.component';
import { RepositoryOverviewComponent } from './components/repository-overview/repository-overview.component';
import { TagDetailComponent } from './components/tag-detail/tag-detail.component';
import { TagOverviewComponent } from './components/tag-overview/tag-overview.component';
import { RegistryRoutingModule } from './registry-routing.module';

@NgModule({
  declarations: [
    RepositoryDetailComponent,
    RepositoryOverviewComponent,
    TagOverviewComponent,
    TagDetailComponent,
    ImageDetailComponent
  ],
  imports: [
    AuthModule,
    CommonModule,
    FormsModule,
    NgbPopoverModule,
    NgbTooltipModule,
    RegistryRoutingModule,
    RegistryCoreModule,
    SharedModule,
  ]
})
export class RegistryModule { }
