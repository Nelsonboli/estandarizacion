import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcedimientosComponent } from './procedimientos.component';

describe('ProcedimientosComponent', () => {
  let component: ProcedimientosComponent;
  let fixture: ComponentFixture<ProcedimientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcedimientosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcedimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
