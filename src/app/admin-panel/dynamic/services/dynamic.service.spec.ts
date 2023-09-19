import { TestBed } from '@angular/core/testing';

import { DynamicComponentService } from './dynamic.service';

describe('DynamicComponentService', () => {
  let service: DynamicComponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicComponentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
