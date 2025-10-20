import { TestBed } from '@angular/core/testing';

import { DatosTablaService } from './datosTablas.service';

describe('TablaestandarizacionService', () => {
  let service: DatosTablaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatosTablaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
