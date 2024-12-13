import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqsCategoriesComponent } from './faqs-categories.component';

describe('FaqsCategoriesComponent', () => {
  let component: FaqsCategoriesComponent;
  let fixture: ComponentFixture<FaqsCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqsCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqsCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
