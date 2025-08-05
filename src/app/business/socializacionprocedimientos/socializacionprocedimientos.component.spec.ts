import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocializacionprocedimientosComponent } from './socializacionprocedimientos.component';

describe('SocializacionprocedimientosComponent', () => {
  let component: SocializacionprocedimientosComponent;
  let fixture: ComponentFixture<SocializacionprocedimientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocializacionprocedimientosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocializacionprocedimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
