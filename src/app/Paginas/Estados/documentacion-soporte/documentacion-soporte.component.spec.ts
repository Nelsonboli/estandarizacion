import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentacionSoporteComponent } from './documentacion-soporte.component';

describe('DocumentacionSoporteComponent', () => {
  let component: DocumentacionSoporteComponent;
  let fixture: ComponentFixture<DocumentacionSoporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentacionSoporteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentacionSoporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
