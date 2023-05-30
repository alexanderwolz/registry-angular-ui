import { TestBed } from '@angular/core/testing';

import { AuthProviderService } from './auth-provider.service';

describe('AuthProviderService', () => {
  let service: AuthProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
