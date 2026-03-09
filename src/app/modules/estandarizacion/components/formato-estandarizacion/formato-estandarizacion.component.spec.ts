import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatoEstandarizacionComponent } from './formato-estandarizacion.component';

describe('FormatoEstandarizacionComponent', () => {
  let component: FormatoEstandarizacionComponent;
  let fixture: ComponentFixture<FormatoEstandarizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormatoEstandarizacionComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FormatoEstandarizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
