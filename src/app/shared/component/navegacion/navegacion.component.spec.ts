import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavegacionComponent } from './navegacion';

describe('BotonCambiarComponent', () => {
  let component: NavegacionComponent;
  let fixture: ComponentFixture<NavegacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavegacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavegacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
