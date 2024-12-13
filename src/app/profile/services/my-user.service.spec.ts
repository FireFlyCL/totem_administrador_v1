import { TestBed } from '@angular/core/testing';

import { MyUserService } from './my-user.service';

describe('MyUserService', () => {
  let service: MyUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
