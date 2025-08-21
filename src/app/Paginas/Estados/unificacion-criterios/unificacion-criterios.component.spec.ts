import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnificacionCriteriosComponent } from './unificacion-criterios.component';

describe('UnificacionCriteriosComponent', () => {
  let component: UnificacionCriteriosComponent;
  let fixture: ComponentFixture<UnificacionCriteriosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnificacionCriteriosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnificacionCriteriosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
