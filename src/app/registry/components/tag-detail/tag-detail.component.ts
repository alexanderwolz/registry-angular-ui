import { HttpErrorResponse } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tag } from 'src/app/registry-core/models/tag';
import { RegistryService } from 'src/app/registry-core/services/registry.service';

@Component({
  standalone: false,
  selector: 'app-tag',
  templateUrl: './tag-detail.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./tag-detail.component.scss'],
})
export class TagDetailComponent implements OnInit {
  tag: Tag | null = null;

  loading = true;
  errorMessage = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private registryService: RegistryService,
  ) {}

  ngOnInit() {
    this.loading = true;
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
        this.tag = tag;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        if (typeof error === 'string') {
          this.errorMessage = error;
          return;
        }
        if (error instanceof HttpErrorResponse) {
          this.errorMessage = 'Error ' + error.status + ': ' + error.message;
          return;
        }
        console.error(error);
        this.errorMessage = error.message;
      },
    });
  }
}
