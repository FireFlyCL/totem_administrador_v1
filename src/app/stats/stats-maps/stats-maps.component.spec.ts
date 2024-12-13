import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsMapsComponent } from './stats-maps.component';

describe('StatsMapsComponent', () => {
  let component: StatsMapsComponent;
  let fixture: ComponentFixture<StatsMapsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsMapsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
