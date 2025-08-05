import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaprocedimientoComponent } from './tablaprocedimiento.component';

describe('TablaprocedimientoComponent', () => {
  let component: TablaprocedimientoComponent;
  let fixture: ComponentFixture<TablaprocedimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaprocedimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaprocedimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
