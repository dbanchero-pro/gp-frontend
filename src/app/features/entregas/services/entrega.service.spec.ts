import { HttpParams } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { EstadoEntrega } from '../enum/estado-entrega.enum';
import { EntregaService } from './entrega.service';


describe('EntregaService', () => {
  let service: EntregaService;
  let gcRestService: jasmine.SpyObj<RestService>;
  let archivoService: jasmine.SpyObj<ArchivoService>;
  let seguridadService: jasmine.SpyObj<SeguridadService>;

  beforeEach(() => {
    gcRestService = jasmine.createSpyObj('GcRestService', ['get', 'post', 'put', 'delete']);
    archivoService = jasmine.createSpyObj('ArchivoService', ['descargar']);
    seguridadService = jasmine.createSpyObj('SeguridadService', ['tienePermiso', 'obtenerTipoUsuario']);
    seguridadService.tienePermiso.and.returnValue(true);
    seguridadService.obtenerTipoUsuario.and.returnValue(TipoUsuario.ORGANISMO);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: RestService, useValue: gcRestService },
        { provide: ArchivoService, useValue: archivoService },
        { provide: SeguridadService, useValue: seguridadService }
      ],
    });
    service = TestBed.inject(EntregaService);
  });

  it('debería obtener entregas con todos los parámetros', () => {
    gcRestService.get.and.returnValue(of({}));

    const params = {
      idOC: 1,
      idCompra: 2,
      idItemCompra: 3,
      idVariacion: 4,
      estadoEntrega: EstadoEntrega.ENTREGADO,
      page: 0,
      sort: 'fecha',
      order: 'asc',
    };

    service.obtenerEntregas(params);

    expect(gcRestService.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/all', jasmine.any(HttpParams));
    const httpParams = gcRestService.get.calls.mostRecent().args[1] as HttpParams;
    expect(httpParams.get('idOC')).toBe('1');
    expect(httpParams.get('idCompra')).toBe('2');
    expect(httpParams.get('idItemCompra')).toBe('3');
    expect(httpParams.get('idVariacion')).toBe('4');
    expect(httpParams.get('estadoEntrega')).toBe(EstadoEntrega.ENTREGADO);
    expect(httpParams.get('page')).toBe('0');
    expect(httpParams.get('sort')).toBe('fecha,asc');
  });

  it('debería obtener entregas sin parámetros opcionales', () => {
    gcRestService.get.and.returnValue(of({}));

    const params = {
      idOC: 1,
      idCompra: 2,
      idItemCompra: 3,
      idVariacion: 4,
      sort: 'fecha',
    };

    service.obtenerEntregas(params);

    const httpParams = gcRestService.get.calls.mostRecent().args[1] as HttpParams;
    expect(httpParams.get('estadoEntrega')).toBeNull();
    expect(httpParams.get('page')).toBeNull();
    expect(httpParams.get('sort')).toBe('fecha');
  });

  it('debería obtener una entrega por id', () => {
    gcRestService.get.and.returnValue(of({}));

    service.obtenerEntrega(10);

    expect(gcRestService.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/10');
  });

  it('debería crear una entrega para organismo', () => {
    gcRestService.post.and.returnValue(of({}));
    const dto: any = {};
    service.crearEntrega(dto, TipoUsuario.ORGANISMO);

    expect(gcRestService.post).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/crear-organismo', dto);
  });

  it('debería crear una entrega para proveedor', () => {
    gcRestService.post.and.returnValue(of({}));
    const dto: any = {};
    service.crearEntrega(dto, TipoUsuario.PROVEEDOR);

    expect(gcRestService.post).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/crear-proveedor', dto);
  });

  it('debería modificar una entrega para organismo', () => {
    gcRestService.put.and.returnValue(of({}));
    const dto: any = {};
    service.modificarEntrega(5, dto, TipoUsuario.ORGANISMO);

    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/5/modificar-organismo', dto);
  });

  it('debería modificar una entrega para proveedor', () => {
    gcRestService.put.and.returnValue(of({}));
    const dto: any = {};
    service.modificarEntrega(5, dto, TipoUsuario.PROVEEDOR);

    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/5/modificar-proveedor', dto);
  });

  it('debería eliminar una entrega para organismo', () => {
    gcRestService.delete.and.returnValue(of(true));
    service.eliminarEntrega(5, TipoUsuario.ORGANISMO);

    expect(gcRestService.delete).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/5/eliminar-organismo');
  });

  it('debería eliminar una entrega para proveedor', () => {
    gcRestService.delete.and.returnValue(of(true));
    service.eliminarEntrega(5, TipoUsuario.PROVEEDOR);

    expect(gcRestService.delete).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/5/eliminar-proveedor');
  });

  it('debería descargar un documento con los parámetros correctos', () => {
    gcRestService.get.and.returnValue(of({}));

    service.descargarDocumento(1, 2);

    expect(gcRestService.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/descargar-documento', jasmine.any(HttpParams));
    const params = gcRestService.get.calls.mostRecent().args[1] as HttpParams;
    expect(params.get('idEntrega')).toBe('1');
    expect(params.get('idArchivo')).toBe('2');
  });

  it('debería recepcionar y dar conformidad a una entrega', () => {
    gcRestService.put.and.returnValue(of({}));
    const dto: any = {};
    service.recepcionEntrega(1, dto);
    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/1/recepcion', dto);
    service.darConformidadEntrega(1, dto);
    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/1/dar-conformidad', dto);
  });

  it('debería modificar recepción y conformidad', () => {
    gcRestService.put.and.returnValue(of({}));
    const dto: any = {};
    service.modificarRecepcion(2, dto);
    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/2/modificar-recepcion', dto);
    service.modificarConformidad(2, dto);
    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/2/modificar-conformidad', dto);
  });

  it('debería eliminar recepción y conformidad', () => {
    gcRestService.delete.and.returnValue(of({}));
    service.eliminarRecepcion(3);
    expect(gcRestService.delete).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/3/eliminar-recepcion');
    service.eliminarConformidad(4);
    expect(gcRestService.delete).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/4/eliminar-conformidad');
  });

  it('mostrarCheck devuelve verdadero según estado y permisos', () => {
    const entrega1: any = { estado: EstadoEntrega.EN_CURSO, puedeRecepcionEntregas: true, cantidadRecepcionAceptada: undefined };
    expect(service.mostrarCheck(entrega1)).toBeTrue();
    const entrega2: any = { estado: EstadoEntrega.ENTREGA_ACEPTADA, puedeRecepcionEntregas: false, puedeConformidadEntregas: true, cantidadConformidadAceptada: undefined, cantidadRecepcionAceptada: 5 };
    expect(service.mostrarCheck(entrega2)).toBeTrue();
    const entrega3: any = { estado: EstadoEntrega.EN_CURSO, puedeConformidadEntregas: false, puedeRecepcionEntregas: false };
    expect(service.mostrarCheck(entrega3)).toBeFalse();
  });

  it('mostrarCheck devuelve falso para PROVEEDOR', () => {
    seguridadService.obtenerTipoUsuario.and.returnValue(TipoUsuario.PROVEEDOR);
    const entrega: any = { estado: EstadoEntrega.EN_CURSO, puedeRecepcionEntregas: true };
    expect(service.mostrarCheck(entrega)).toBeFalse();
  });

  it('debería procesar operaciones masivas', () => {
    gcRestService.put.and.returnValue(of([]));
    const req: any = { ids: [1, 2] };
    service.recepcionarEntregasSeleccionadas(req);
    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/recepcionar-entregas-seleccionadas', req);
    service.darConformidadEntregasSeleccionadas(req);
    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/dar-conformidad-entregas-seleccionadas', req);
    service.recepcionarItemsSeleccionados(req);
    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/recepcionar-items-seleccionados', req);
    service.darConformidadItemsSeleccionados(req);
    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/dar-conformidad-items-seleccionados', req);
  });

  it('debería agregar descargo', () => {
    gcRestService.post.and.returnValue(of({}));
    const dto: any = {};
    service.agregarDescargo(dto);
    expect(gcRestService.post).toHaveBeenCalledWith('/api/gestion-contratos/v1/entregas/agregar-descargo', dto);
  });

  it('debería exportar excel y descargar archivo', () => {
    const params: any = { estadoEntrega: 'en_curso' };
    gcRestService.post.and.returnValue(of({}));
    service.exportarExcel(params);
    const calledParams = gcRestService.post.calls.mostRecent().args[1] as any;
    expect(calledParams.estadoEntrega).toBe('EN_CURSO');
    expect(archivoService.descargar).toHaveBeenCalled();
  });
  it('evalua banderas de conformidad y recepcion', () => {
    const entrega: any = { cantidadConformidadAceptada: 1, cantidadRecepcionAceptada: 2 };
    expect(service.tieneConformidad(entrega)).toBeTrue();
    expect(service.tieneRecepcion(entrega)).toBeTrue();
    entrega.cantidadConformidadAceptada = null;
    entrega.cantidadRecepcionAceptada = undefined;
    expect(service.tieneConformidad(entrega)).toBeFalse();
    expect(service.tieneRecepcion(entrega)).toBeFalse();
  });

  it('distingue entre entregas y recepciones unicamente', () => {
    const soloEntrega: any = { cantidadRecepcionAceptada: null };
    const soloRecepcion: any = { cantidadRecepcionAceptada: 5, cantidadConformidadAceptada: undefined };
    const completa: any = { cantidadRecepcionAceptada: 5, cantidadConformidadAceptada: 3 };

    expect(service.tieneSoloEntrega(soloEntrega)).toBeTrue();
    expect(service.tieneSoloRecepcion(soloRecepcion)).toBeTrue();
    expect(service.tieneSoloEntrega(completa)).toBeFalse();
    expect(service.tieneSoloRecepcion(completa)).toBeFalse();
  });

  it('detecta rechazos u observaciones en la entrega', () => {
    const conRecepcionRechazada: any = { cantidadRecepcionRechazada: 1 };
    const conConformidadRechazada: any = { cantidadConformidadRechazada: 2 };
    const conObservaciones: any = { observaciones: 'nota' };

    expect(service.tieneRechazosUObservaciones(conRecepcionRechazada)).toBeTrue();
    expect(service.tieneRechazosUObservaciones(conConformidadRechazada)).toBeTrue();
    expect(service.tieneRechazosUObservaciones(conObservaciones)).toBeTrue();
    expect(service.tieneRechazosUObservaciones({} as any)).toBeFalse();
  });

  it('verifica permisos para procesos masivos', () => {
    const entrega: any = { puedeRecepcionEntregas: true, cantidadRecepcionAceptada: undefined };
    expect(service.puedeRecepcionarMasivo(entrega)).toBeTrue();
    expect(service.puedeDarConformidadMasivo({ puedeConformidadEntregas: true, cantidadRecepcionAceptada: 1, cantidadConformidadAceptada: undefined } as any)).toBeTrue();
    entrega.puedeRecepcionEntregas = false;
    expect(service.puedeRecepcionarMasivo(entrega)).toBeFalse();
    expect(service.puedeDarConformidadMasivo({ puedeConformidadEntregas: false, cantidadRecepcionAceptada: 1, cantidadConformidadAceptada: undefined } as any)).toBeFalse();
  });

  it('valida los porcentajes segun las reglas de negocio', () => {
    expect(service.tipoUnidadPorcentaje(null, 50)).toEqual({ porcentajeRequerido: true });
    expect(service.tipoUnidadPorcentaje(0, 50)).toEqual({ porcentajeRango: true });
    expect(service.tipoUnidadPorcentaje(90, 80)).toEqual({ excedePendientePorcentaje: true });
    expect(service.tipoUnidadPorcentaje(60, 80)).toBeNull();
  });

  it('valida las cantidades segun las reglas de negocio', () => {
    expect(service.tipoUnidadCantidad(null, 5)).toEqual({ cantidadRequerida: true });
    expect(service.tipoUnidadCantidad(Number.NaN, 5)).toEqual({ cantidadRequerida: true });
    expect(service.tipoUnidadCantidad(2, 5)).toEqual({ cantidadDebeSerUno: true });
    expect(service.tipoUnidadCantidad(1, 0)).toEqual({ excedePendienteCantidad: true });
    expect(service.tipoUnidadCantidad(1, 2)).toBeNull();
  });

});

