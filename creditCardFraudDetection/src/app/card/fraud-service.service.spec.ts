import { TestBed } from '@angular/core/testing';

import { FraudServiceService } from './fraud-service.service';

describe('FraudServiceService', () => {
  let service: FraudServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FraudServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
