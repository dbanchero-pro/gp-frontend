import { TestBed } from '@angular/core/testing';
import { ClausulaService } from './clausula.service';

describe('ClausulaService', () => {
  let service: ClausulaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClausulaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
