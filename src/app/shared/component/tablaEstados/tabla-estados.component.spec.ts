import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaEstadosComponent } from './tabla-estados.component';

describe('TablaEstadosComponent', () => {
  let component: TablaEstadosComponent;
  let fixture: ComponentFixture<TablaEstadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaEstadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaEstadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
