import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsNewsComponent } from './stats-news.component';

describe('StatsNewsComponent', () => {
  let component: StatsNewsComponent;
  let fixture: ComponentFixture<StatsNewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsNewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
