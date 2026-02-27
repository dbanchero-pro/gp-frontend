import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BandejaEntradaService } from './bandeja-entrada.service';
import { FiltroBandejaEntradaDTO } from '../models/filtros/filtro-bandeja-entrada.model';
import { EstadoProcesoPliego } from '../enum/estado-proceso-pliego.enum';

describe('BandejaEntradaService', () => {
  let service: BandejaEntradaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BandejaEntradaService);
  });

  it('deberia crearse', () => {
    expect(service).toBeTruthy();
  });

  it('incluye notas en los pliegos devueltos', fakeAsync(() => {
    let resultado: any[] = [];
    service.buscarPliegos('P', null, null, null, null, null).subscribe(pliegos => {
      resultado = pliegos;
    });
    tick(500);

    expect(resultado.length).toBeGreaterThan(0);
    resultado.forEach(pliego => {
      expect(pliego.notas).toBeDefined();
      expect(Array.isArray(pliego.notas)).toBeTrue();
    });
  }));

  it('incluye campos e historial en los procesos de bandeja', fakeAsync(() => {
    const filtro = new FiltroBandejaEntradaDTO();
    let total = 0;
    let primerProceso: any = null;

    service.buscarProcesos(filtro, 0, 10, 'estado', 'asc').subscribe(page => {
      total = page.totalElements;
      primerProceso = page.content[0];
    });
    tick(500);

    expect(total).toBeGreaterThan(0);
    expect(primerProceso?.campos).toBeDefined();
    expect(primerProceso?.historial).toBeDefined();
    expect(Array.isArray(primerProceso?.historial)).toBeTrue();
  }));

  it('filtra procesos por estado', fakeAsync(() => {
    const filtro = new FiltroBandejaEntradaDTO();
    filtro.estado = EstadoProcesoPliego.PENDIENTE;
    let estados: EstadoProcesoPliego[] = [];

    service.buscarProcesos(filtro, 0, 20, 'estado', 'asc').subscribe(page => {
      estados = page.content.map(p => p.estado);
    });
    tick(500);

    expect(estados.length).toBeGreaterThan(0);
    expect(estados.every(e => e === EstadoProcesoPliego.PENDIENTE)).toBeTrue();
  }));
});
