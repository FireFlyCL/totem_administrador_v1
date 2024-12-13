import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaboratorIndexComponent } from './collaborator-index.component';

describe('CollaboratorIndexComponent', () => {
  let component: CollaboratorIndexComponent;
  let fixture: ComponentFixture<CollaboratorIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollaboratorIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollaboratorIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
