import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentificacionrequerimientosComponent } from './identificacionrequerimientos.component';

describe('IdentificacionrequerimientosComponent', () => {
  let component: IdentificacionrequerimientosComponent;
  let fixture: ComponentFixture<IdentificacionrequerimientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentificacionrequerimientosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentificacionrequerimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
