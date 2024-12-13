import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaboratorImageComponent } from './collaborator-image.component';

describe('CollaboratorImageComponent', () => {
  let component: CollaboratorImageComponent;
  let fixture: ComponentFixture<CollaboratorImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollaboratorImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollaboratorImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
