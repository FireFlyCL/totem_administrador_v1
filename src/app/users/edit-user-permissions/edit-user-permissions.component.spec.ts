import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserPermissionsComponent } from './edit-user-permissions.component';

describe('EditUserPermissionsComponent', () => {
  let component: EditUserPermissionsComponent;
  let fixture: ComponentFixture<EditUserPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUserPermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUserPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
