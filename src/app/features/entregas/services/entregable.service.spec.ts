import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppConfig } from 'src/app/app.config';
import { EstadoEntrega } from '../enum/estado-entrega.enum';
import { TipoUnidad } from '../enum/tipo-unidad.enum';
import { IEntregableDTO } from '../models/entregable.model';
import { ItemOrdenCompraDTO } from '../models/item-orden-compra.model';
import { EntregableService } from './entregable.service';

describe('EntregableService', () => {
  let service: EntregableService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(EntregableService);
    httpMock = TestBed.inject(HttpTestingController);
    AppConfig.settings = { apiUrl: '' } as any;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener códigos de entregable', () => {
    service.obtenerCodigoEntregablesPorItem({ idOC: 1, idItem: 2, idVariacion: 1, }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/gestion-contratos/v1/entregables/codigos'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('idOC')).toBe('1');
    expect(req.request.params.get('idItem')).toBe('2');
    expect(req.request.params.get('idVariacion')).toBe('1');
    req.flush([]);
  });

  it('debe obtener entregables por item con filtros', () => {
    service.obtenerEntregablesPorItem({ idOC: 1, idItem: 2, idVariacion: 1, estado: EstadoEntrega.EN_CURSO, codigo: 'A', page: 0, sort: 'estado', order: 'asc' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/gestion-contratos/v1/entregables/all'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('estado')).toBe(EstadoEntrega.EN_CURSO);
    expect(req.request.params.get('codigo')).toBe('A');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('sort')).toBe('estado,asc');
    req.flush({});
  });

  it('debe construir el sort sin orden al obtener entregables por item', () => {
    service.obtenerEntregablesPorItem({ idOC: 1, idItem: 2, idVariacion: 1, estado: EstadoEntrega.EN_CURSO, sort: 'fecha' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/gestion-contratos/v1/entregables/all'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('sort')).toBe('fecha');
    req.flush({});
  });

  it('debe omitir parámetros opcionales al obtener entregables por item', () => {
    service.obtenerEntregablesPorItem({ idOC: 1, idItem: 2, idVariacion: 1, estado: null as unknown as EstadoEntrega }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/gestion-contratos/v1/entregables/all'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('estado')).toBeNull();
    expect(req.request.params.get('codigo')).toBeNull();
    expect(req.request.params.get('page')).toBeNull();
    expect(req.request.params.get('sort')).toBeNull();
    req.flush({});
  });

  it('debe crear un entregable', () => {
    const dto = { codEntregable: 'A' } as IEntregableDTO;
    service.crearEntregable(dto).subscribe();
    const req = httpMock.expectOne('/api/gestion-contratos/v1/entregables');
    expect(req.request.method).toBe('POST');
    req.flush(dto);
  });

  it('debe modificar un entregable', () => {
    const dto = { codEntregable: 'A' } as IEntregableDTO;
    service.modificarEntregable(1, dto).subscribe();
    const req = httpMock.expectOne('/api/gestion-contratos/v1/entregables/1');
    expect(req.request.method).toBe('PUT');
    req.flush(dto);
  });

  it('debe eliminar un entregable', () => {
    service.eliminarEntregable(1).subscribe();
    const req = httpMock.expectOne('/api/gestion-contratos/v1/entregables/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(true);
  });

  it('debe descargar un documento', () => {
    service.descargarDocumento(1, 2).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/gestion-contratos/v1/entregables/descargar-documento'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('idEntregable')).toBe('1');
    expect(req.request.params.get('idArchivo')).toBe('2');
    req.flush({});
  });

  it('debe calcular cantidades pendientes usando valores por defecto', () => {
    const entregable = { cantidad: 5 } as IEntregableDTO;
    const item = { descUnidadMedida: 'unidades' } as ItemOrdenCompraDTO;

    const resultado = service.cantidadesPendienteEntrega(entregable, item);

    expect(resultado).toBe('5 de 5 (unidades)');
  });

  it('debe calcular cantidades pendientes con valores definidos y unidad por defecto', () => {
    const entregable = { cantidad: 1, cantidadPendienteEntrega: 1, cantidadTotalMostrar: 2, tipoUnidad: TipoUnidad.CANTIDAD} as IEntregableDTO;
    const item = {descUnidadMedida: 'entregas'} as ItemOrdenCompraDTO;

    const resultado = service.cantidadesPendienteEntrega(entregable, item);

    expect(resultado).toBe('1 de 2 (entregas)');
  });

  it('debe indicar que el entregable tiene cantidad sin asignar con valores por defecto', () => {
    const entregable = { cantidad: 3 } as IEntregableDTO;

    expect(service.entregableTieneCantidadSinAsignar(entregable)).toBe(true);
  });

  it('debe indicar que el entregable no tiene cantidad sin asignar cuando alguna cantidad es cero', () => {
    const entregable = { cantidad: 3, cantidadPendienteEntrega: 0, cantidadPendienteAsignar: 2 } as IEntregableDTO;

    expect(service.entregableTieneCantidadSinAsignar(entregable)).toBe(false);
  });
});
