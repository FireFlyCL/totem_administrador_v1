import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaboratorCategoriesComponent } from './collaborator-categories.component';

describe('CollaboratorCategoriesComponent', () => {
  let component: CollaboratorCategoriesComponent;
  let fixture: ComponentFixture<CollaboratorCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollaboratorCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollaboratorCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
