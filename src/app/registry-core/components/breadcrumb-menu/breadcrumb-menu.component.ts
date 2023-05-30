import { Component, Input } from '@angular/core';
import { Params } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Repository } from 'src/app/registry-core/models/repository';
import { Segment } from '../../../shared/models/segment';
import { RegistryService } from 'src/app/registry-core/services/registry.service';

@Component({
  selector: 'app-breadcrumb-menu',
  templateUrl: './breadcrumb-menu.component.html',
  styleUrls: ['./breadcrumb-menu.component.scss']
})
export class BreadcrumbMenuComponent {

  @Input() namespace: string | null = null;
  segments: Array<Segment> = []

  constructor(private activatedRoute: ActivatedRoute, private registryService: RegistryService) { }

  ngOnInit() {
    this.updateSegments()
  }

  ngOnChanges(changes: any) {
    this.updateSegments()
  }

  private updateSegments() {
    this.segments = []

    const title = this.getTitle()
    const params = this.activatedRoute.snapshot.params;
    const namespaces = params['namespaces']?.split("/")?.filter((s: string) => s !== "") || []
    const name = params['name']
    const tag = params['tag']
    const image = params['image']
    const repository = name ? this.registryService.createRepository(namespaces, name) : null
    const namespaceOrDefault = this.getNamespaceOrDefault(repository)

    if (title === "repository") {
      const segments = []
      segments.push(new Segment("Repositories"))
      segments.push(new Segment(namespaceOrDefault, "/repositories", null, { namespace: namespaceOrDefault }))
      repository?.segments.forEach(segment => {
        segments.push(new Segment(segment))
      });
      segments.push(new Segment(name, null, true))
      this.segments = segments
      return
    }

    if (title === "repositories") {
      const segments = []
      segments.push(new Segment("Repositories"))
      segments.push(new Segment(namespaceOrDefault, null, true))
      this.segments = segments
      return
    }

    if (title === "tag") {
      const segments = []
      segments.push(new Segment("Repositories"))
      segments.push(new Segment(namespaceOrDefault, "/repositories", null, { namespace: namespaceOrDefault }))
      repository?.segments.forEach(segment => {
        segments.push(new Segment(segment))
      });
      segments.push(new Segment(name, "/repositories/" + repository?.getRelativePath()))
      segments.push(new Segment("Tags", "/repositories/" + repository?.getRelativePath() + "/tags"))
      segments.push(new Segment(tag, null, true))
      this.segments = segments
      return
    }

    if (title == "tags") {
      const segments = []
      segments.push(new Segment("Repositories"))
      segments.push(new Segment(namespaceOrDefault, "/repositories", null, { namespace: namespaceOrDefault }))
      repository?.segments.forEach(segment => {
        segments.push(new Segment(segment))
      });
      segments.push(new Segment(name, "/repositories/" + repository?.getRelativePath()))
      segments.push(new Segment("Tags", null, true))
      this.segments = segments
      return
    }

    if (title == "image") {
      const segments = []
      segments.push(new Segment("Repositories"))
      segments.push(new Segment(namespaceOrDefault, "/repositories", null, { namespace: namespaceOrDefault }))
      repository?.segments.forEach(segment => {
        segments.push(new Segment(segment))
      });
      segments.push(new Segment(name, "/repositories/" + repository?.getRelativePath()))
      segments.push(new Segment("Tags", "/repositories/" + repository?.getRelativePath() + "/tags"))
      segments.push(new Segment(tag, "/repositories/" + repository?.getRelativePath() + "/tags/" + tag))
      segments.push(new Segment(image, null, true))
      this.segments = segments
      return
    }

  }

  private getTitle(): string | null {
    const snapshot = this.activatedRoute.snapshot
    let title = snapshot.data['title']
    if (!title) {
      title = snapshot.firstChild?.data['title']
    }
    return title
  }

  private getPath(namespace: string) {
    if (namespace === Repository.DEFAULT_NAMESPACE) {
      return ""
    }
    return namespace + "/"
  }

  private getNamespaceOrDefault(repository: Repository | null) {
    if (this.namespace) {
      return this.namespace
    }
    if (repository && repository.namespace) {
      return repository.namespace
    }
    return Repository.DEFAULT_NAMESPACE
  }

}
