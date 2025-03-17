import { TestBed } from '@angular/core/testing';

import { PlagiarismService } from './plagiarism.service';

describe('PlagiarismService', () => {
  let service: PlagiarismService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlagiarismService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
