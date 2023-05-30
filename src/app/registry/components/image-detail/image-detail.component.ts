import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Repository } from 'src/app/registry-core/models/repository';
import { Tag } from 'src/app/registry-core/models/tag';
import { Image } from 'src/app/registry-core/models/image';
import { RegistryService } from 'src/app/registry-core/services/registry.service';
import { Layer } from 'src/app/registry-core/models/layer';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-image-detail',
  templateUrl: './image-detail.component.html',
  styleUrls: ['./image-detail.component.scss']
})
export class ImageDetailComponent {

  repository: Repository | null = null
  tag: Tag | null = null
  image: Image | null = null

  loading = true
  errorMessage = ""

  constructor(
    private activatedRoute: ActivatedRoute,
    private registryService: RegistryService,
    private modalService: NgbModal) {
  }

  ngOnInit() {
    this.loading = true;
    const params = this.activatedRoute.snapshot.params;
    const namespaces = params['namespaces'];
    const name = params['name'];
    const imageShortDigest = params['image'];
    if (!name) {
      throw new Error("Missing reqired parameter 'name' in path");
    }
    const tag = params['tag']
    if (!tag) {
      throw new Error("Missing reqired parameter 'tag' in path");
    }
    if (!imageShortDigest) {
      throw new Error("Missing reqired parameter 'image' in path");
    }
    this.repository = this.registryService.createRepository(namespaces, name)
    this.registryService.getTag(this.repository, tag)
      .subscribe({
        next: (tag) => {
          this.tag = tag;
          tag.images.forEach(image => {
            if (image.digestShort === imageShortDigest) {
              this.setImage(image)
            }
          });
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          if (typeof error === 'string') {
            this.errorMessage = error;
            return
          }
          if (error instanceof HttpErrorResponse) {
            this.errorMessage = "Error " + error.status + ": " + error.message;
          }
          console.error(error)
          this.errorMessage = error.message;
        }
      })
  }

  setImage(image: Image) {
    this.image = image;
  }

  showLayerDialog(layer:Layer, content: any) {
    this.modalService.open(content, { size: 'lg', backdrop: true, centered: true })
  }

}
