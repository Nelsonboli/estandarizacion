import { TestBed } from '@angular/core/testing';

import { DocumentoBaseService } from './documento-base.service';

describe('DocumentoBaseService', () => {
  let service: DocumentoBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentoBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
