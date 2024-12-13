import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsInstagramComponent } from './news-instagram.component';

describe('NewsInstagramComponent', () => {
  let component: NewsInstagramComponent;
  let fixture: ComponentFixture<NewsInstagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsInstagramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsInstagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
