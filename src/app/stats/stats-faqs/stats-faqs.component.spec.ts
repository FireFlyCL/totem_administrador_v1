import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsFaqsComponent } from './stats-faqs.component';

describe('StatsFaqsComponent', () => {
  let component: StatsFaqsComponent;
  let fixture: ComponentFixture<StatsFaqsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsFaqsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsFaqsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
