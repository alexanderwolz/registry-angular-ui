import { Component, Input } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tag } from '../../models/tag';
import { RegistryService } from '../../services/registry.service';
import { EventService } from 'src/app/shared/services/event.service';
import { Event } from 'src/app/shared/models/event';
import { ErrorEvent } from 'src/app/shared/models/error-event';
import { InfoEvent } from 'src/app/shared/models/info-event';

@Component({
  selector: 'app-tag-delete-button',
  templateUrl: './tag-delete-button.component.html',
  styleUrls: ['./tag-delete-button.component.scss']
})
export class TagDeleteButtonComponent {

  @Input() tags: Array<Tag> = []

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private registryService: RegistryService,
    private eventService: EventService
  ) { }

  delete(tags: Array<Tag>, content: any) {
    this.modalService.open(content, { centered: true }).result.then(
      (result) => {
        if (result) {
          tags.forEach(tag => {
            this.registryService.deleteTag(tag)
              .subscribe({
                next: (success) => {
                  if (success) {
                    this.router.navigate(["/repositories/" + tag.repository.getRelativePath()]);
                    this.eventService.emit(new InfoEvent("Successfully deleted tag <strong>" + tag.getRelativePath() + "</strong>"));
                  }
                  else {
                    this.eventService.emit(
                      new ErrorEvent("Error while deleting tag <strong>" + tag.getRelativePath() + "</strong>",
                        new Error("Something happened"))
                    );
                  }
                },
                error: (error) => {
                  console.error("Unhandled error while deleting tag '" + tag.getAbsolutePath() + "':", error);
                  this.eventService.emit(new ErrorEvent("Error while deleting tag <strong>" + tag.getRelativePath() + "</strong>", error));
                }
              });
          });
        }
      }
    );
  }

}
