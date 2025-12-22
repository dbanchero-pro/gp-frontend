import { registerLocaleData } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import localeEsUy from '@angular/common/locales/es-UY';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { IFiltroOrdenCompra } from 'src/app/features/entregas/models/filtros/filtro-seguimiento-entrega.model';
import { EstadoOrdenCompra } from 'src/app/shared/enum/estado-orden-compra.enum';
import { Pais } from '../enum/pais.enum';
import { TipoDocumentoUsuario } from '../enum/tipo-documento-usuario.enum';
import { TipoUsuario } from '../enum/tipo-usuario.enum';
import { ArchivoService } from './common/archivo.service';
import { RestService } from './common/rest.service';
import { SeguridadService } from './common/seguridad.service';
import { OrdenCompraService } from './orden-compra.service';

describe('OrdenCompraService', () => {
  let service: OrdenCompraService;
  let gcRestSpy: jasmine.SpyObj<RestService>;
  let archivoServiceSpy: jasmine.SpyObj<ArchivoService>;
  let seguridadServiceSpy: jasmine.SpyObj<SeguridadService>;
  
  beforeEach(() => {
    registerLocaleData(localeEsUy);
    gcRestSpy = jasmine.createSpyObj('GcRestService', ['get', 'post']);
    archivoServiceSpy = jasmine.createSpyObj('ArchivoService', ['descargar']);
    seguridadServiceSpy = jasmine.createSpyObj('SeguridadService', ['tieneAlgunPermiso']);

    TestBed.configureTestingModule({
      providers: [
        OrdenCompraService,
        { provide: RestService, useValue: gcRestSpy },
        { provide: ArchivoService, useValue: archivoServiceSpy },
        { provide: SeguridadService, useValue: seguridadServiceSpy }
      ]
    });

    service = TestBed.inject(OrdenCompraService);
  });

  it('debería exportar excel de proveedor', () => {
    const params = { filtro: {} };
    gcRestSpy.post.and.returnValue(of({ contenido: '', mimeType: '', nombre: 'salida.xlsx' }));

    service.exportarExcelProveedor(params);

    expect(gcRestSpy.post).toHaveBeenCalledWith(
      '/api/gestion-contratos/v1/ordenes-compra/excel-proveedor',
      params.filtro
    );
    expect(archivoServiceSpy.descargar).toHaveBeenCalled();
  });

  it('debería exportar excel de organismo', () => {
    const params = { filtro: {} };
    gcRestSpy.post.and.returnValue(of({ contenido: '', mimeType: '', nombre: 'salida.xlsx' }));

    service.exportarExcelOrganismo(params);

    expect(gcRestSpy.post).toHaveBeenCalledWith(
      '/api/gestion-contratos/v1/ordenes-compra/excel-organismo',
      params.filtro
    );
    expect(archivoServiceSpy.descargar).toHaveBeenCalled();
  });

  it('debería obtener orden por id', () => {
    gcRestSpy.get.and.returnValue(of({}));
    service.obtenerPorId(123).subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/ordenes-compra/123');
  });

  it('debería buscar organismo con filtros', () => {
    gcRestSpy.get.and.returnValue(of({ content: [], page: { totalElements: 0 } }));

    const filtro: Partial<IFiltroOrdenCompra> = {
      idInciso: 1,
      idUnidadEjecutora: 2,
      idUnidadCompra: 3,
      idIncisoOc: 4,
      idUnidadEjecutoraOc: 5,
      idUnidadCompraOc: 6,
      nroOC: '789',
      tipoCompra: 'menor',
      numCompra: 1,
      anioCompra: 2024,
      idPais: Pais.URUGUAY,
      idTipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD,
      nroDocumento: '999',
      estadoOrdenCompra: EstadoOrdenCompra.Pendiente,
      soloOCAjustesPendientes: true,
      fechaDesde: new Date('2024-01-15T12:00:00Z'),
      fechaHasta: new Date('2024-01-20T12:00:00Z')
    };

    service.buscarOrganismo({
      filtro,
      pagina: 1,
      tamanoPagina: 20,
      sort: 'nroOC',
      order: 'asc'
    }).subscribe(res => {
      expect(res.content).toEqual([]);
      expect(res.totalElements).toBeUndefined();
    });

    const call = gcRestSpy.get.calls.mostRecent();
    expect(call.args[0]).toBe('/api/gestion-contratos/v1/ordenes-compra/all-organismo');

    const params = call.args[1] as HttpParams;
    expect(params.get('page')).toBe('1');
    expect(params.get('size')).toBe('20');
    expect(params.get('sort')).toBe('nroOC,asc');
    expect(params.get('idInciso')).toBe('1');
    expect(params.get('idUnidadEjecutora')).toBe('2');
    expect(params.get('idUnidadCompra')).toBe('3');
    expect(params.get('idIncisoOC')).toBe('4');
    expect(params.get('idUnidadEjecutoraOC')).toBe('5');
    expect(params.get('idUnidadCompraOC')).toBe('6');
    expect(params.get('nroOc')).toBe('789');
    expect(params.get('tipoCompra')).toBe('menor');
    expect(params.get('numCompra')).toBe('1');
    expect(params.get('anioCompra')).toBe('2024');
    expect(params.get('idPais')).toBe(Pais.URUGUAY);
    expect(params.get('idTipoDocumento')).toBe(TipoDocumentoUsuario.CEDULA_IDENTIDAD);
    expect(params.get('nroDocumento')).toBe('999');
    expect(params.get('estadoOrdenCompra')).toBe('PENDIENTE');
    expect(params.get('soloOCAjustesPendientes')).toBe('true');
    expect(params.get('fechaDesde')).toBe('2024-01-15');
    expect(params.get('fechaHasta')).toBe('2024-01-20');
  });

  it('debería buscar proveedor con filtros', () => {
    gcRestSpy.get.and.returnValue(of({ content: [], page: { totalElements: 0 } }));

    const filtro: Partial<IFiltroOrdenCompra> = {
      estadoOrdenCompra: EstadoOrdenCompra.Finalizada,
      proveedor: {
        nroDocumento: '123',
        paisDocumento: { id: 'AR' },
        tipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD
      },
      nroOC: '555',
      idZona: 8
    } as any;

    service.buscarProveedor({
      filtro,
      pagina: 0,
      tamanoPagina: 10,
      sort: 'nroOC',
      order: 'desc'
    }).subscribe(res => {
      expect(res.content).toEqual([]);
      expect(res.totalElements).toBeUndefined();
    });

    const call = gcRestSpy.get.calls.mostRecent();
    expect(call.args[0]).toBe('/api/gestion-contratos/v1/ordenes-compra/all-proveedor');

    const params = call.args[1] as HttpParams;
    expect(params.get('page')).toBe('0');
    expect(params.get('size')).toBe('10');
    expect(params.get('sort')).toBe('nroOC,desc');
    expect(params.get('idPais')).toBe('AR');
    expect(params.get('idTipoDocumento')).toBe(TipoDocumentoUsuario.CEDULA_IDENTIDAD);
    expect(params.get('nroDocumento')).toBe('123');
    expect(params.get('nroOc')).toBe('555');
    expect(params.get('idZona')).toBe('8');
    expect(params.get('estadoOrdenCompra')).toBe('FINALIZADA');
  });

  it('debería buscar proveedor con datos simples', () => {
    gcRestSpy.get.and.returnValue(of({ content: [], page: { totalElements: 0 } }));

    const filtro: Partial<IFiltroOrdenCompra> = {
      idPais: 'BR',
      idTipoDocumento: 'RUT',
      nroDocumento: '999'
    } as any;

    service.buscarProveedor({
      filtro,
      pagina: 2,
      tamanoPagina: 5,
      sort: 'nroOC',
      order: 'asc'
    }).subscribe();

    const call = gcRestSpy.get.calls.mostRecent();
    const params = call.args[1] as HttpParams;
    expect(params.get('idPais')).toBe('BR');
    expect(params.get('idTipoDocumento')).toBe('RUT');
    expect(params.get('nroDocumento')).toBe('999');
    expect(params.get('estadoOrdenCompra')).toBeNull();
  });

  it('debería buscar proveedor sin filtro', () => {
    gcRestSpy.get.and.returnValue(of({ content: [], page: { totalElements: 0 } }));

    service.buscarProveedor({
      filtro: null,
      pagina: 0,
      tamanoPagina: 1,
      sort: 'id',
      order: 'asc'
    }).subscribe();

    const call = gcRestSpy.get.calls.mostRecent();
    const params = call.args[1] as HttpParams;
    expect(params.get('page')).toBe('0');
    expect(params.get('size')).toBe('1');
    expect(params.get('sort')).toBe('id,asc');
    expect(params.keys().length).toBe(3);
  });
  it('debería consultar permisos de recepción del usuario', () => {
    gcRestSpy.get.and.returnValue(of(true));
    seguridadServiceSpy.tieneAlgunPermiso.and.returnValue(true);
    service.usuarioLogueadoTienePermisosRecepcion(55).subscribe();

    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/ordenes-compra/55/usuario-logueado-tiene-permisos-recepcion');
  });

  it('debería obtener orden por id indicando el tipo de usuario', () => {
    gcRestSpy.get.and.returnValue(of({}));

    service.obtenerPorId(77, TipoUsuario.PROVEEDOR).subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/ordenes-compra/77?tipoUsuario=PROVEEDOR');

    service.obtenerPorId(80, TipoUsuario.ORGANISMO).subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/ordenes-compra/80?tipoUsuario=ORGANISMO');
  });

  it('debería obtener la orden de compra por número de OC', () => {
    gcRestSpy.get.and.returnValue(of({}));

    service.obtenerPorNroOC(1, 2, 3, 2024, 10, 20).subscribe();

    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/ordenes-compra/por-nro-oc/1/2/3/2024/10/20');
  });

  it('debería normalizar el estado al exportar excel', () => {
    const params = { filtro: { estadoOrdenCompra: 'pendiente' } };
    gcRestSpy.post.and.returnValue(of({ contenido: '', mimeType: '', nombre: 'a.xlsx' }));

    service.exportarExcelOrganismo(params);

    const body = gcRestSpy.post.calls.mostRecent().args[1] as any;
    expect(body.estadoOrdenCompra).toBe('PENDIENTE');
    expect(params.filtro.estadoOrdenCompra).toBe('PENDIENTE');
  });

});
