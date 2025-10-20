import { TestBed } from '@angular/core/testing';

import { SoporteComputacionalService } from './soporte-computacional.service';

describe('SoporteComputacionalService', () => {
  let service: SoporteComputacionalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoporteComputacionalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
