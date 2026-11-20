import { HttpErrorResponse } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, mergeMap, of } from 'rxjs';
import { Repository } from '../../../registry-core/models/repository';
import { Tag } from '../../../registry-core/models/tag';
import { RegistryService } from '../../../registry-core/services/registry.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { BreadcrumbMenuComponent } from '../../../registry-core/components/breadcrumb-menu/breadcrumb-menu.component';
import { TitleBoxComponent } from '../../../shared/components/title-box/title-box.component';
import { TagListComponent } from '../../../registry-core/components/tag-list/tag-list.component';
import { REGISTRY_HOST } from '../../../app.tokens';

@Component({
  selector: 'app-repository',
  templateUrl: './repository-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./repository-detail.component.scss'],
  imports: [
    SpinnerComponent,
    BreadcrumbMenuComponent,
    RouterLink,
    TitleBoxComponent,
    TagListComponent,
  ],
})
export class RepositoryDetailComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private registryService = inject(RegistryService);
  registryHost = inject(REGISTRY_HOST);

  repository = signal<Repository | null>(null);
  totalTagCount = signal(0); //all tags in this repo
  tags = signal<Tag[]>([]);

  maxTagsToLoad = 5;
  showMoreLine = signal(false);

  loading = signal(true);
  errorMessage = signal('');

  ngOnInit() {
    this.loading.set(true);
    const params = this.activatedRoute.snapshot.params;
    const namespaces = params['namespaces'];
    const name = params['name'];
    if (!name) {
      throw new Error("Missing required parameter 'name' in path");
    }
    const repository = this.registryService.createRepository(namespaces, name);
    this.repository.set(repository);
    this.registryService
      .loadTagNames(repository)
      .pipe(
        mergeMap((tagNames: string[]) => {
          this.totalTagCount.set(tagNames.length);
          if (tagNames.length === 0) {
            return of([]);
          }
          return forkJoin(
            tagNames
              .slice(0, this.maxTagsToLoad)
              .map((tagName) => this.registryService.getTag(repository, tagName)),
          );
        }),
      )
      .subscribe({
        next: (tags) => {
          this.tags.set(tags);
          this.loading.set(false);
          this.showMoreLine.set(this.totalTagCount() > tags.length);
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
}
