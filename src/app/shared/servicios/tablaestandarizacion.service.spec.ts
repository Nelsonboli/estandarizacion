import { TestBed } from '@angular/core/testing';

import { TablaestandarizacionService } from './tablaestandarizacion.service';

describe('TablaestandarizacionService', () => {
  let service: TablaestandarizacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TablaestandarizacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
