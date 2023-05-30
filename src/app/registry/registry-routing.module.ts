import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { authGuard } from '../auth/guards/auth.guard';
import { IndexComponent } from '../main/components/index/index.component';
import { RepositoryDetailComponent } from './components/repository-detail/repository-detail.component';
import { RepositoryOverviewComponent } from './components/repository-overview/repository-overview.component';
import { TagDetailComponent } from './components/tag-detail/tag-detail.component';
import { TagOverviewComponent } from './components/tag-overview/tag-overview.component';
import { ImageDetailComponent } from './components/image-detail/image-detail.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { matcher: imageDetails, component: ImageDetailComponent, data: { title: "image" } },
      { matcher: tagDetails, component: TagDetailComponent, data: { title: "tag" } },
      { matcher: tagOverview, component: TagOverviewComponent, data: { title: "tags" } },
      { matcher: repositoryDetails, component: RepositoryDetailComponent, data: { title: "repository" } },
      { path: 'repositories', component: RepositoryOverviewComponent, data: { title: "repositories" } },
      { path: '**', redirectTo: 'repositories' }
    ],
    component: IndexComponent,
    canActivate: [authGuard]
  }
];

// matches repositories/[:namespaces]*/:name/tags/:tag/images/:digest
export function imageDetails(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length > 5 && segments[0].path === "repositories"
    && segments[segments.length - 4].path === "tags"
    && segments[segments.length - 2].path === "images") {
    const namespaces = new UrlSegment(segments.slice(1, -5).map(segment => segment.path).join("/"), {})
    const name = segments.at(-5)!
    const tag = segments.at(-3)!
    const image = segments.at(-1)!
    return ({ consumed: segments, posParams: ({ namespaces, name, tag, image }) })
  }
  //see https://angular.io/api/router/UrlMatchResult
  return null
}

// matches repositories/[:namespaces]*/:name/tags/:tag
export function tagDetails(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length > 3 && segments[0].path === "repositories" && segments[segments.length - 2].path === "tags") {
    const namespaces = new UrlSegment(segments.slice(1, -3).map(segment => segment.path).join("/"), {})
    const name = segments.at(-3)!
    const tag = segments.at(-1)!
    return ({ consumed: segments, posParams: ({ namespaces, name, tag }) })
  }
  //see https://angular.io/api/router/UrlMatchResult
  return null
}

// matches repositories/[:namespaces]*/:name/tags
export function tagOverview(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length > 2 && segments[0].path === "repositories" && segments[segments.length - 1].path === "tags") {
    const namespaces = new UrlSegment(segments.slice(1, -2).map(segment => segment.path).join("/"), {})
    const name = segments.at(-2)!
    return ({ consumed: segments, posParams: ({ namespaces, name }) })
  }
  //see https://angular.io/api/router/UrlMatchResult
  return null
}

// matches repositories/[:namespaces]*/:name
export function repositoryDetails(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length > 1 && segments[0].path === "repositories") {
    const namespaces = new UrlSegment(segments.slice(1, -1).join("/"), {})
    const name = segments.at(-1)!
    return ({ consumed: segments, posParams: ({ namespaces, name }) })
  }
  //see https://angular.io/api/router/UrlMatchResult
  return null
}

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistryRoutingModule { }
