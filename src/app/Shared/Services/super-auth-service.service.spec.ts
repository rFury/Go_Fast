import { TestBed } from '@angular/core/testing';

import { SuperAuthServiceService } from './super-auth-service.service';

describe('SuperAuthServiceService', () => {
  let service: SuperAuthServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuperAuthServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
