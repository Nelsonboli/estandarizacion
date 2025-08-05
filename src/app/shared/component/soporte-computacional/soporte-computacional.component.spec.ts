import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoporteComputacionalComponent } from './soporte-computacional.component';

describe('SoporteComputacionalComponent', () => {
  let component: SoporteComputacionalComponent;
  let fixture: ComponentFixture<SoporteComputacionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoporteComputacionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoporteComputacionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
