import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsInformationComponent } from './stats-information.component';

describe('StatsInformationComponent', () => {
  let component: StatsInformationComponent;
  let fixture: ComponentFixture<StatsInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
