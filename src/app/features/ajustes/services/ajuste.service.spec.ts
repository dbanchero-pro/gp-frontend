import { HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { IDescargoDTO } from '../../entregas/models/descargo.model';
import { EstadoAjuste } from '../enum/estado-ajuste.enum';
import { TipoAjuste } from '../enum/tipo-ajuste.enum';
import { IAjusteDTO } from '../models/ajuste.model';
import { IAjusteFiltro } from '../models/filtros/ajuste-filtro.model';
import { AjusteService } from './ajuste.service';


describe('AjusteService', () => {
  let service: AjusteService;
  let gcRestService: jasmine.SpyObj<RestService>;

  beforeEach(() => {
    gcRestService = jasmine.createSpyObj<RestService>('GcRestService', ['get', 'put', 'delete', 'post']);

    TestBed.configureTestingModule({
      providers: [
        AjusteService,
        { provide: RestService, useValue: gcRestService },
      ],
    });

    service = TestBed.inject(AjusteService);
  });

  it('debería buscar ajustes para organismo con todos los filtros aplicados', () => {
    const filtros: IAjusteFiltro = {
      idItem: 10,
      idVariacion: 20,
      tipoAjuste: TipoAjuste.ITEM_ANULAR,
      estado: EstadoAjuste.APROBADO,
      fechaDesde: '2024-05-01',
      fechaHasta: '2024-05-31',
      nroItem: 5,
      codArticulo: 99,
    };

    gcRestService.get.and.returnValue(of({}));

    service.buscarAjustes(TipoUsuario.ORGANISMO, 123, filtros, 1, 25, 'fechaCreacion', 'asc');

    expect(gcRestService.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/ajustes/consulta-organismo/123', jasmine.any(HttpParams));
    const params = gcRestService.get.calls.mostRecent().args[1] as HttpParams;
    expect(params.get('page')).toBe('1');
    expect(params.get('size')).toBe('25');
    expect(params.get('sort')).toBe('fechaCreacion,asc');
    expect(params.get('idItem')).toBe('10');
    expect(params.get('idVariacion')).toBe('20');
    expect(params.get('tipoAjuste')).toBe(TipoAjuste.ITEM_ANULAR);
    expect(params.get('estado')).toBe(EstadoAjuste.APROBADO);
    expect(params.get('fechaDesde')).toBe('2024-05-01');
    expect(params.get('fechaHasta')).toBe('2024-05-31');
    expect(params.get('nroItem')).toBe('5');
    expect(params.get('codArticulo')).toBe('99');
  });

  it('debería buscar ajustes para proveedor sin filtros opcionales', () => {
    gcRestService.get.and.returnValue(of({}));

    service.buscarAjustes(TipoUsuario.PROVEEDOR, 456, {}, undefined, undefined, 'fechaCreacion');

    expect(gcRestService.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/ajustes/consulta-proveedor/456', jasmine.any(HttpParams));
    const params = gcRestService.get.calls.mostRecent().args[1] as HttpParams;
    expect(params.get('page')).toBeNull();
    expect(params.get('size')).toBeNull();
    expect(params.get('sort')).toBe('fechaCreacion,desc');
    expect(params.get('idItem')).toBeNull();
    expect(params.get('idVariacion')).toBeNull();
    expect(params.get('tipoAjuste')).toBeNull();
    expect(params.get('estado')).toBeNull();
    expect(params.get('fechaDesde')).toBeNull();
    expect(params.get('fechaHasta')).toBeNull();
    expect(params.get('nroItem')).toBeNull();
    expect(params.get('codArticulo')).toBeNull();
  });

  it('debería rechazar un ajuste en el endpoint correspondiente', () => {
    const dto = { idAjuste: 789 } as IAjusteDTO;
    gcRestService.put.and.returnValue(of(dto));

    service.rechazarAjuste(dto);

    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/ajustes/789/rechazar', dto);
  });

  it('debería aprobar un ajuste en el endpoint correspondiente', () => {
    const dto = { idAjuste: 321 } as IAjusteDTO;
    gcRestService.put.and.returnValue(of(dto));

    service.aprobarAjuste(dto);

    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/ajustes/321/aprobar', dto);
  });

  it('debería eliminar un ajuste para organismo con endpoint correcto', () => {
    gcRestService.delete.and.returnValue(of(true));

    service.eliminarAjuste(12, TipoUsuario.ORGANISMO);

    expect(gcRestService.delete).toHaveBeenCalledWith('/api/gestion-contratos/v1/ajustes/12/eliminar-organismo');
  });

  it('debería eliminar un ajuste para proveedor con endpoint correcto', () => {
    gcRestService.delete.and.returnValue(of(true));

    service.eliminarAjuste(34, TipoUsuario.PROVEEDOR);

    expect(gcRestService.delete).toHaveBeenCalledWith('/api/gestion-contratos/v1/ajustes/34/eliminar-proveedor');
  });

  it('debería agregar un descargo con el endpoint esperado', () => {
    const descargo: IDescargoDTO = { comentario: 'Prueba' };
    gcRestService.post.and.returnValue(of(descargo));

    service.agregarDescargo(descargo);

    expect(gcRestService.post).toHaveBeenCalledWith('/api/gestion-contratos/v1/ajustes/agregar-descargo', descargo);
  });

  it('crea y modifica ajustes según el tipo de usuario', () => {
    const dto = { idAjuste: 55 } as IAjusteDTO;
    gcRestService.post.and.returnValue(of(dto));
    gcRestService.put.and.returnValue(of(dto));

    service.crearAjuste(dto, TipoUsuario.ORGANISMO);
    expect(gcRestService.post).toHaveBeenCalledWith('/api/gestion-contratos/v1/ajustes/crear-organismo', dto);

    service.crearAjuste(dto, TipoUsuario.PROVEEDOR);
    expect(gcRestService.post).toHaveBeenCalledWith('/api/gestion-contratos/v1/ajustes/crear-proveedor', dto);

    service.modificarAjuste(dto, TipoUsuario.ORGANISMO);
    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/ajustes/55/modificar-organismo', dto);

    service.modificarAjuste(dto, TipoUsuario.PROVEEDOR);
    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/ajustes/55/modificar-proveedor', dto);
  });

  it('crea y valida ajustes de ítems seleccionados para ambos perfiles', () => {
    const request: any = { idOC: 1 };
    gcRestService.put.and.returnValue(of({}));

    service.crearAjustesItemsSeleccionados(request, TipoUsuario.ORGANISMO);
    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/ajustes/crear-ajuste-seleccionadas-organismo', request);

    service.crearAjustesItemsSeleccionados(request, TipoUsuario.PROVEEDOR);
    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/ajustes/crear-ajuste-seleccionadas-proveedor', request);

    service.validarAjustesItemsSeleccionados(request, TipoUsuario.ORGANISMO);
    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/ajustes/validar-ajuste-seleccionadas-organismo', request);

    service.validarAjustesItemsSeleccionados(request, TipoUsuario.PROVEEDOR);
    expect(gcRestService.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/ajustes/validar-ajuste-seleccionadas-proveedor', request);
  });

  it('descargarDocumento arma los parámetros correctamente', () => {
    gcRestService.get.and.returnValue(of({}));
    service.descargarDocumento(10, 99);
    const params = gcRestService.get.calls.mostRecent().args[1] as HttpParams;
    expect(params.get('idAjuste')).toBe('10');
    expect(params.get('idArchivo')).toBe('99');
  });

  it('descargarDescargo arma los parámetros correctamente', () => {
    gcRestService.get.and.returnValue(of({}));
    service.descargarDescargo(20, 5);
    const params = gcRestService.get.calls.mostRecent().args[1] as HttpParams;
    expect(params.get('idAjuste')).toBe('20');
    expect(params.get('idArchivo')).toBe('5');
  });
});
