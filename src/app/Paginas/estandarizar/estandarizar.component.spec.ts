import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstandarizarComponent } from './estandarizar.component';

describe('EstandarizarComponent', () => {
  let component: EstandarizarComponent;
  let fixture: ComponentFixture<EstandarizarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstandarizarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstandarizarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
