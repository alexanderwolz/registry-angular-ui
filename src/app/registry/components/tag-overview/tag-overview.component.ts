import { HttpErrorResponse } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Repository } from '../../../registry-core/models/repository';
import { Tag } from '../../../registry-core/models/tag';
import { RegistryService } from '../../../registry-core/services/registry.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { BreadcrumbMenuComponent } from '../../../registry-core/components/breadcrumb-menu/breadcrumb-menu.component';
import { TitleBoxComponent } from '../../../shared/components/title-box/title-box.component';
import { TagDeleteButtonComponent } from '../../../registry-core/components/tag-delete-button/tag-delete-button.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CopyTextComponent } from '../../../shared/components/copy-text/copy-text.component';
import { ImageListComponent } from '../../../registry-core/components/image-list/image-list.component';

@Component({
  selector: 'app-tags',
  templateUrl: './tag-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./tag-overview.component.scss'],
  imports: [
    SpinnerComponent,
    BreadcrumbMenuComponent,
    RouterLink,
    TitleBoxComponent,
    TagDeleteButtonComponent,
    ReactiveFormsModule,
    FormsModule,
    CopyTextComponent,
    ImageListComponent,
  ],
})
export class TagOverviewComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private registryService = inject(RegistryService);

  repository = signal<Repository | null>(null);

  tagContainers = signal<TagContainer[]>([]);
  selection = signal<Tag[]>([]);

  selectAll = false;

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
    const repository = this.registryService.createRepository(namespaces, name);
    this.repository.set(repository);
    this.registryService
      .loadTags(repository)
      .pipe(
        catchError((error) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            return throwError(
              () => "Repository '" + repository.getRelativePath() + "' does not exist!",
            );
          }
          return throwError(() => error);
        }),
      )
      .subscribe({
        next: (tags) => {
          //wrap into UI model
          this.tagContainers.set(tags.map((tag) => new TagContainer(tag, false)));
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          if (typeof error === 'string') {
            this.errorMessage.set(error);
            return;
          }
          if (error instanceof HttpErrorResponse) {
            if (error.status === 404) {
              this.errorMessage.set(
                "Repository '" + repository.getRelativePath() + "' does not exist!",
              );
              return;
            }
            this.errorMessage.set('Error ' + error.status + ': ' + error.message);
            return;
          }
          console.error(error);
          this.errorMessage.set(error.message);
        },
      });
  }

  updateAllSelections(allSelected: boolean) {
    this.tagContainers().forEach((container) => {
      container.isSelected = allSelected;
    });
    this.selection.set(allSelected ? this.tagContainers().map((container) => container.tag) : []);
  }

  updateSelection(container: TagContainer) {
    const containedInSelection = this.selection().includes(container.tag);
    if (container.isSelected && !containedInSelection) {
      this.selection.update((selection) => [...selection, container.tag]);
    }
    if (!container.isSelected && containedInSelection) {
      this.selection.update((selection) => selection.filter((tag) => tag !== container.tag));
    }
    this.selectAll = this.selection().length === this.tagContainers().length;
  }
}

class TagContainer {
  constructor(
    readonly tag: Tag,
    public isSelected: boolean,
  ) {}
}
