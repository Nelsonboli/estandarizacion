import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormreutilizableComponent } from './formreutilizable.component';

describe('FormreutilizableComponent', () => {
  let component: FormreutilizableComponent;
  let fixture: ComponentFixture<FormreutilizableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormreutilizableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormreutilizableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
