import { TestBed } from '@angular/core/testing';
import { BandejaEntradaService } from './bandeja-entrada.service';

describe('BandejaEntradaService', () => {
  let service: BandejaEntradaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BandejaEntradaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
