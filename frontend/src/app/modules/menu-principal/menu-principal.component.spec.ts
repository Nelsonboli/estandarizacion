import { ComponentFixture, TestBed } from '@angular/core/testing';

import { menuprincipalComponent } from './menu-principal.component';

describe('menuprincipalComponent', () => {
  let component: menuprincipalComponent;
  let fixture: ComponentFixture<menuprincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [menuprincipalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(menuprincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

