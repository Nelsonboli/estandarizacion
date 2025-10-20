import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentobaseComponent } from './documentobase.component';

describe('DocumentobaseComponent', () => {
  let component: DocumentobaseComponent;
  let fixture: ComponentFixture<DocumentobaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentobaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentobaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
