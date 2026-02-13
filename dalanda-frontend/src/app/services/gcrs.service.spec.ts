import { TestBed } from '@angular/core/testing';

import { GcrsService } from './gcrs.service';

describe('GcrsService', () => {
  let service: GcrsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GcrsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
