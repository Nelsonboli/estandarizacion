import { TestBed } from '@angular/core/testing';

import { TablaService } from './tabla.service';

describe('TablaService', () => {
  let service: TablaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TablaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
