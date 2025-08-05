import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoleccioninformacionComponent } from './recoleccioninformacion.component';

describe('RecoleccioninformacionComponent', () => {
  let component: RecoleccioninformacionComponent;
  let fixture: ComponentFixture<RecoleccioninformacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecoleccioninformacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecoleccioninformacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
