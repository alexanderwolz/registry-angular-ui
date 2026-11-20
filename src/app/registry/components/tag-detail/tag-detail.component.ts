import { HttpErrorResponse } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Tag } from 'src/app/registry-core/models/tag';
import { RegistryService } from 'src/app/registry-core/services/registry.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { BreadcrumbMenuComponent } from '../../../registry-core/components/breadcrumb-menu/breadcrumb-menu.component';
import { TitleBoxComponent } from '../../../shared/components/title-box/title-box.component';
import { TagDeleteButtonComponent } from '../../../registry-core/components/tag-delete-button/tag-delete-button.component';
import { CopyTextComponent } from '../../../shared/components/copy-text/copy-text.component';
import { ImageListComponent } from '../../../registry-core/components/image-list/image-list.component';

@Component({
  selector: 'app-tag',
  templateUrl: './tag-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./tag-detail.component.scss'],
  imports: [
    SpinnerComponent,
    BreadcrumbMenuComponent,
    RouterLink,
    TitleBoxComponent,
    TagDeleteButtonComponent,
    CopyTextComponent,
    ImageListComponent,
  ],
})
export class TagDetailComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private registryService = inject(RegistryService);

  tag = signal<Tag | null>(null);

  loading = signal(true);
  errorMessage = signal('');

  ngOnInit() {
    this.loading.set(true);
    const params = this.activatedRoute.snapshot.params;
    const namespaces = params['namespaces'];
    const name = params['name'];
    if (!name) {
      throw new Error("Missing reqired parameter 'name' in path");
    }
    const tag = params['tag'];
    if (!tag) {
      throw new Error("Missing reqired parameter 'tag' in path");
    }
    const repository = this.registryService.createRepository(namespaces, name);
    this.registryService.getTag(repository, tag).subscribe({
      next: (tag) => {
        this.tag.set(tag);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        if (typeof error === 'string') {
          this.errorMessage.set(error);
          return;
        }
        if (error instanceof HttpErrorResponse) {
          this.errorMessage.set('Error ' + error.status + ': ' + error.message);
          return;
        }
        console.error(error);
        this.errorMessage.set(error.message);
      },
    });
  }
}
