import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqsIndexComponent } from './faqs-index.component';

describe('FaqsIndexComponent', () => {
  let component: FaqsIndexComponent;
  let fixture: ComponentFixture<FaqsIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqsIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqsIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
