import { registerLocaleData } from '@angular/common';
import localeEsUy from '@angular/common/locales/es-UY';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RestService } from './common/rest.service';
import { OrganismoService } from './organismo.service';

describe('OrganismoService', () => {
  let service: OrganismoService;
  let gcRestSpy: jasmine.SpyObj<RestService>;

  beforeEach(() => {
    registerLocaleData(localeEsUy);
    gcRestSpy = jasmine.createSpyObj('GcRestService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        OrganismoService,
        { provide: RestService, useValue: gcRestSpy }
      ]
    });

    service = TestBed.inject(OrganismoService);
    gcRestSpy.get.and.returnValue(of([]));
  });

  afterEach(() => {
    gcRestSpy.get.calls.reset();
  });

  it('debería obtener incisos', () => {
    service.obtenerIncisos(false).subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/incisos/all-sorted?');
  });

  it('debería obtener incisos con usuario', () => {
    service.obtenerIncisos(false, '99').subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/incisos/all-sorted?idUsuarioSeleccionado=99');
  });

  it('debería obtener incisos incluyendo administrativas', () => {
    service.obtenerIncisos(true).subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/incisos/all-sorted?incluirAdministrativas=true&');
  });

  it('debería obtener incisos incluyendo administrativas para un usuario', () => {
    service.obtenerIncisos(true, '42').subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/incisos/all-sorted?incluirAdministrativas=true&idUsuarioSeleccionado=42');
  });

  it('debería obtener unidades ejecutoras', () => {
    service.obtenerUE(1, false).subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/incisos/1/unidades-ejecutoras/all?');
  });

  it('debería obtener unidades ejecutoras con usuario', () => {
    service.obtenerUE(1, false, '55').subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/incisos/1/unidades-ejecutoras/all?idUsuarioSeleccionado=55');
  });

  it('debería obtener unidades ejecutoras con administrativas', () => {
    service.obtenerUE(3, true).subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/incisos/3/unidades-ejecutoras/all?incluirAdministrativas=true&');
  });

  it('debería obtener unidades ejecutoras con administrativas y usuario', () => {
    service.obtenerUE(3, true, '77').subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/incisos/3/unidades-ejecutoras/all?incluirAdministrativas=true&idUsuarioSeleccionado=77');
  });

  it('debería obtener unidades de compra', () => {
    service.obtenerUC(1, 2, false).subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/unidades-ejecutoras/1/2/unidades-compras/all?');
  });

  it('debería obtener unidades de compra con usuario', () => {
    service.obtenerUC(1, 2, false, '10').subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/unidades-ejecutoras/1/2/unidades-compras/all?idUsuarioSeleccionado=10');
  });

  it('debería obtener unidades de compra con administrativas', () => {
    service.obtenerUC(5, 9, true).subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/unidades-ejecutoras/5/9/unidades-compras/all?incluirAdministrativas=true&');
  });

  it('debería obtener unidades de compra con administrativas y usuario', () => {
    service.obtenerUC(5, 9, true, '10').subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/unidades-ejecutoras/5/9/unidades-compras/all?incluirAdministrativas=true&idUsuarioSeleccionado=10');
  });

  it('debería obtener incisos para OC de proveedor', () => {
    service.obtenerIncisosOCProveedor().subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/incisos/all-incisos-oc-proveedor');
  });

  it('debería obtener unidades ejecutoras para OC de proveedor', () => {
    service.obtenerUEOCProveedor(8).subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/incisos/8/unidades-ejecutoras/all-oc-proveedor');
  });

  it('debería obtener unidades de compra para OC de proveedor', () => {
    service.obtenerUCProveedor(4, 6).subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/unidades-ejecutoras/4/6/unidades-compras/all-oc-proveedor');
  });

  it('debería obtener unidades de compra del usuario', () => {
    service.obtenerUCUsuarioOrganismo('101').subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/unidades-compra/all?idUsuario=101');
  });

  it('debería construir parámetros combinando administrativa y usuario', () => {
    const result = service.obtenerParametros(true, '33');
    expect(result).toBe('?incluirAdministrativas=true&idUsuarioSeleccionado=33');
  });

  it('debería construir parámetros cuando solo hay usuario', () => {
    const result = service.obtenerParametros(false, '50');
    expect(result).toBe('?idUsuarioSeleccionado=50');
  });

  it('debería construir parámetros sin usuario ni administrativas', () => {
    const result = service.obtenerParametros(false, undefined);
    expect(result).toBe('?');
  });
});
