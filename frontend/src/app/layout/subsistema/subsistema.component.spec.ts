import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubsistemaComponent } from './subsistema.component';

describe('SubsistemaComponent', () => {
  let component: SubsistemaComponent;
  let fixture: ComponentFixture<SubsistemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubsistemaComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SubsistemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
