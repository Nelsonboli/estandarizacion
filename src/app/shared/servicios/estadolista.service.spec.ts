import { TestBed } from '@angular/core/testing';

import { EstadolistaService } from './estadolista.service';

describe('EstadolistaService', () => {
  let service: EstadolistaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadolistaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
