import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BandejaEntradaService } from './bandeja-entrada.service';
import { FiltroBandejaEntradaDTO } from '../models/filtros/filtro-bandeja-entrada.model';
import { EstadoPliego } from '../enum/estado-pliego.enum';

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
      expect(pliego.notas.length).toBeGreaterThan(0);
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
    expect(primerProceso?.historial.length).toBeGreaterThan(0);
  }));

  it('filtra procesos por estado', fakeAsync(() => {
    const filtro = new FiltroBandejaEntradaDTO();
    filtro.estado = EstadoPliego.PENDIENTE;
    let estados: EstadoPliego[] = [];

    service.buscarProcesos(filtro, 0, 20, 'estado', 'asc').subscribe(page => {
      estados = page.content.map(p => p.estado);
    });
    tick(500);

    expect(estados.length).toBeGreaterThan(0);
    expect(estados.every(e => e === EstadoPliego.PENDIENTE)).toBeTrue();
  }));

  it('obtiene usuarios asignados mock por proceso', fakeAsync(() => {
    let usuarios: any[] = [];

    service.obtenerUsuariosAsignadosPorPliego(1).subscribe(resp => {
      usuarios = resp;
    });
    tick(300);

    expect(usuarios.length).toBeGreaterThan(0);
    expect(usuarios[0].roles?.length).toBeGreaterThan(0);
  }));

  it('filtra usuarios para asignacion por CI', fakeAsync(() => {
    let usuarios: any[] = [];

    service.buscarUsuariosParaAsignacion('1234', 'CI').subscribe(resp => {
      usuarios = resp;
    });
    tick(300);

    expect(usuarios.length).toBeGreaterThan(0);
  }));

  it('incluye secciones y tipos de compra en los modelos mock de pliegos', fakeAsync(() => {
    let primerPliego: any;

    service.buscarPliegos('P', null, null, null, null, null).subscribe(pliegos => {
      primerPliego = pliegos[0];
    });
    tick(500);

    expect(primerPliego?.modelo?.secciones?.length).toBeGreaterThan(0);
    expect(primerPliego?.modelo?.tiposCompra?.length).toBeGreaterThan(0);
  }));

  it('obtiene filtros de bandeja con datos de inciso, ue, uc y tipo de compra', fakeAsync(() => {
    let filtros: any;

    service.obtenerFiltrosBandeja().subscribe((resp) => {
      filtros = resp;
    });
    tick(0);

    expect(filtros.incisos.length).toBeGreaterThan(0);
    expect(filtros.unidadesEjecutoras.length).toBeGreaterThan(0);
    expect(filtros.unidadesCompra.length).toBeGreaterThan(0);
    expect(filtros.tiposCompra.length).toBeGreaterThan(0);
  }));

  it('obtiene filtros de iniciar pliego con subtipos por tipo de compra', fakeAsync(() => {
    let filtros: any;

    service.obtenerFiltrosIniciarPliego().subscribe((resp) => {
      filtros = resp;
    });
    tick(0);

    expect(filtros.incisos.length).toBeGreaterThan(0);
    expect(filtros.unidadesEjecutoras.length).toBeGreaterThan(0);
    expect(filtros.tiposCompra.length).toBeGreaterThan(0);
    expect(Array.isArray(filtros.tiposCompra[0].subtipos)).toBeTrue();
  }));
});
