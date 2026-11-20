import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  TemplateRef,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Repository } from 'src/app/registry-core/models/repository';
import { Tag } from 'src/app/registry-core/models/tag';
import { Image } from 'src/app/registry-core/models/image';
import { RegistryService } from 'src/app/registry-core/services/registry.service';
import { Layer } from 'src/app/registry-core/models/layer';
import { NgbModal, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { BreadcrumbMenuComponent } from '../../../registry-core/components/breadcrumb-menu/breadcrumb-menu.component';
import { TitleComponent } from '../../../shared/components/title/title.component';
import { TagDeleteButtonComponent } from '../../../registry-core/components/tag-delete-button/tag-delete-button.component';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-image-detail',
  templateUrl: './image-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./image-detail.component.scss'],
  imports: [
    SpinnerComponent,
    BreadcrumbMenuComponent,
    RouterLink,
    TitleComponent,
    TagDeleteButtonComponent,
    NgbTooltip,
    DatePipe,
    TimeAgoPipe,
  ],
})
export class ImageDetailComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private registryService = inject(RegistryService);
  private modalService = inject(NgbModal);

  repository = signal<Repository | null>(null);
  tag = signal<Tag | null>(null);
  image = signal<Image | null>(null);

  loading = signal(true);
  errorMessage = signal('');

  ngOnInit() {
    this.loading.set(true);
    const params = this.activatedRoute.snapshot.params;
    const namespaces = params['namespaces'];
    const name = params['name'];
    const imageShortDigest = params['image'];
    if (!name) {
      throw new Error("Missing reqired parameter 'name' in path");
    }
    const tag = params['tag'];
    if (!tag) {
      throw new Error("Missing reqired parameter 'tag' in path");
    }
    if (!imageShortDigest) {
      throw new Error("Missing reqired parameter 'image' in path");
    }
    const repository = this.registryService.createRepository(namespaces, name);
    this.repository.set(repository);
    this.registryService.getTag(repository, tag).subscribe({
      next: (tag) => {
        this.tag.set(tag);
        this.image.set(tag.images.find((image) => image.digestShort === imageShortDigest) ?? null);
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

  showLayerDialog(layer: Layer, content: TemplateRef<unknown>) {
    this.modalService.open(content, { size: 'lg', backdrop: true, centered: true });
  }
}
