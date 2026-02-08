import { TestBed } from '@angular/core/testing';

import { CapituloService } from './capitulo.service';

describe('CapituloService', () => {
  let service: CapituloService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapituloService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
