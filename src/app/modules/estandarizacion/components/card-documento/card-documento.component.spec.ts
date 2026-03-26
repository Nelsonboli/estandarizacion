import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDocumentoComponent } from './card-documento.component';

describe('CardDocumentoComponent', () => {
  let component: CardDocumentoComponent;
  let fixture: ComponentFixture<CardDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardDocumentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
