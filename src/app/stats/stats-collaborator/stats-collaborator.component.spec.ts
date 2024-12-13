import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsCollaboratorComponent } from './stats-collaborator.component';

describe('StatsCollaboratorComponent', () => {
  let component: StatsCollaboratorComponent;
  let fixture: ComponentFixture<StatsCollaboratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsCollaboratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsCollaboratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
