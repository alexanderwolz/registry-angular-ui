import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Repository } from '../../../registry-core/models/repository';
import { Tag } from '../../../registry-core/models/tag';
import { RegistryService } from '../../../registry-core/services/registry.service';

@Component({
  selector: 'app-tags',
  templateUrl: './tag-overview.component.html',
  styleUrls: ['./tag-overview.component.scss']
})
export class TagOverviewComponent {

  repository: Repository | null = null

  tagContainers: Array<TagContainer> = []
  selection : Array<Tag> = []

  selectAll: boolean = false;

  loading = true
  errorMessage = ""

  constructor(
    private activatedRoute: ActivatedRoute,
    private registryService: RegistryService) {
  }

  ngOnInit() {
    this.loading = true;
    const params = this.activatedRoute.snapshot.params;
    const namespaces = params['namespaces'];
    const name = params['name'];
    if (!name) {
      throw new Error("Missing reqired parameter 'name' in path");
    }
    this.repository = this.registryService.createRepository(namespaces, name);
    this.registryService.loadTags(this.repository)
      .pipe(
        catchError(error => {
          if (error instanceof HttpErrorResponse && error.status === 404 && this.repository) {
            return throwError(() => "Repository '" + this.repository?.getRelativePath() + "' does not exist!");
          }
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (tags) => {
          const tagContainers = new Array()
          tags.forEach(tag => {
            //wrap into UI model
            tagContainers.push(new TagContainer(tag, false))
          });
          this.tagContainers = tagContainers;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          if (typeof error === 'string') {
            this.errorMessage = error;
            return
          }
          if (error instanceof HttpErrorResponse) {
            if (error.status === 404 && this.repository) {
              this.errorMessage = "Repository '" + this.repository?.getRelativePath() + "' does not exist!"
              return
            }
            this.errorMessage = "Error " + error.status + ": " + error.message;
            return
          }
          console.error(error)
          this.errorMessage = error.message;
        }
      })
  }

  updateAllSelections(allSelected: boolean) {
    this.tagContainers.forEach(container => {
      container.isSelected = allSelected
    });
    if(allSelected){
      this.selection = this.tagContainers.map(container => container.tag)
    }else{
      this.selection = []
    }
  }

  updateSelection(container: TagContainer) {
    const containedInSelection = this.selection.includes(container.tag);
    if(container.isSelected && !containedInSelection){
      this.selection.push(container.tag)
    }
    if(!container.isSelected && containedInSelection){
      this.selection = this.selection.filter(tag => tag !== container.tag);
    }
    this.selectAll = this.selection.length == this.tagContainers.length
  }

}

class TagContainer {
  constructor(readonly tag: Tag, public isSelected: boolean) { }

}
