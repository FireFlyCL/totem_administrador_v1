import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsCommonComponent } from './news-common.component';

describe('NewsCommonComponent', () => {
  let component: NewsCommonComponent;
  let fixture: ComponentFixture<NewsCommonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsCommonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
