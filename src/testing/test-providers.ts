import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentProviders, Provider } from '@angular/core';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { REGISTRY_HOST, TOKEN_SECRET, CHECK_PULL_ACCESS } from '../app/app.tokens';

/** Providers shared by all specs: routing, a mocked HttpClient and the injection tokens set up by the AppModule. */
export const TEST_PROVIDERS: (Provider | EnvironmentProviders)[] = [
  provideRouter([{ path: '**', children: [] }]),
  provideHttpClient(),
  provideHttpClientTesting(),
  { provide: REGISTRY_HOST, useValue: 'http://localhost:5000' },
  { provide: TOKEN_SECRET, useValue: 'test-secret' },
  { provide: CHECK_PULL_ACCESS, useValue: false },
];

/** Route parameters of the detail pages, for components reading `ActivatedRoute.snapshot.params`. */
export function routeParams(params: Record<string, string>): Provider {
  return { provide: ActivatedRoute, useValue: { snapshot: { params, queryParams: {}, data: {} } } };
}
