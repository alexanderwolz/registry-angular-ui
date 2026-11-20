import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, mergeMap, of } from 'rxjs';
import { Repository } from '../../../registry-core/models/repository';
import { Tag } from '../../../registry-core/models/tag';
import { RegistryService } from '../../../registry-core/services/registry.service';

@Component({
  standalone: false,
  selector: 'app-repository',
  templateUrl: './repository-detail.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./repository-detail.component.scss'],
})
export class RepositoryDetailComponent implements OnInit {
  repository: Repository | null = null;
  totalTagCount = 0; //all tags in this repo
  tags: Tag[] = [];

  maxTagsToLoad = 5;
  showMoreLine = false;

  loading = true;
  errorMessage = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private registryService: RegistryService,
    @Inject('REGISTRY_HOST') public registryHost: string,
  ) {}

  ngOnInit() {
    this.loading = true;
    const params = this.activatedRoute.snapshot.params;
    const namespaces = params['namespaces'];
    const name = params['name'];
    if (!name) {
      throw new Error("Missing required parameter 'name' in path");
    }
    this.repository = this.registryService.createRepository(namespaces, name);
    this.registryService
      .loadTagNames(this.repository)
      .pipe(
        mergeMap((tagNames: string[]) => {
          this.totalTagCount = tagNames.length;
          if (tagNames.length == 0) {
            return of([]);
          }
          return forkJoin(
            tagNames
              .slice(0, this.maxTagsToLoad)
              .map((tagName) => this.registryService.getTag(this.repository!, tagName)),
          );
        }),
      )
      .subscribe({
        next: (tags) => {
          this.tags = tags;
          this.loading = false;
          this.showMoreLine = this.totalTagCount > this.tags.length;
        },
        error: (error) => {
          this.loading = false;
          if (typeof error === 'string') {
            this.errorMessage = error;
            return;
          }
          if (error instanceof HttpErrorResponse) {
            if (error.status === 404 && this.repository) {
              this.errorMessage =
                "Repository '" + this.repository?.getRelativePath() + "' does not exist!";
              return;
            }
            this.errorMessage = 'Error ' + error.status + ': ' + error.message;
            return;
          }
          console.error(error);
          this.errorMessage = error.message;
        },
      });
  }
}
