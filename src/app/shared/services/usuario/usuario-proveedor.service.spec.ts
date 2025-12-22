import { HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Pais } from '../../enum/pais.enum';
import { TipoDocumentoUsuario } from '../../enum/tipo-documento-usuario.enum';
import { UsuarioProveedorDTO } from '../../models/usuario/usuario-proveedor.model';
import { RestService } from '../common/rest.service';
import { UsuarioProveedorService } from './usuario-proveedor.service';

describe('UsuarioProveedorService', () => {
  let service: UsuarioProveedorService;
  let gcRestSpy: jasmine.SpyObj<RestService>;

  beforeEach(() => {
    gcRestSpy = jasmine.createSpyObj('GcRestService', ['get', 'post', 'delete', 'put']);
    TestBed.configureTestingModule({
      providers: [
        UsuarioProveedorService,
        { provide: RestService, useValue: gcRestSpy }
      ]
    });
    service = TestBed.inject(UsuarioProveedorService);
  });

  it('debería obtener todos los usuarios proveedor con filtros', () => {
    gcRestSpy.get.and.returnValue(of({}));
    service.obtenerTodosUsuariosProveedores({ idPais: Pais.URUGUAY, idTipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD, nroDocumento: '12345678' }, 0, 10, 'id.idUsuario,asc').subscribe();

    expect(gcRestSpy.get).toHaveBeenCalledWith(
      '/api/gestion-contratos/v1/usuarios-proveedor/all',
      jasmine.any(HttpParams)
    );

    const params = gcRestSpy.get.calls.mostRecent().args[1] as HttpParams;
    expect(params.get('page')).toBe('0');
    expect(params.get('size')).toBe('10');
    expect(params.get('idPais')).toBe(Pais.URUGUAY);
    expect(params.get('idTipoDocumento')).toBe(TipoDocumentoUsuario.CEDULA_IDENTIDAD);
    expect(params.get('nroDocumento')).toBe('12345678');
  });

  it('usa valores por defecto al obtener usuarios proveedor', () => {
    gcRestSpy.get.and.returnValue(of({}));
    service.obtenerTodosUsuariosProveedores({}).subscribe();

    const params = gcRestSpy.get.calls.mostRecent().args[1] as HttpParams;
    expect(params.get('page')).toBe('0');
    expect(params.get('size')).toBe('20');
    expect(params.get('sort')).toBe('id.idUsuario,asc');
  });

  it('debería obtener usuarios proveedor de organismos', () => {
    gcRestSpy.get.and.returnValue(of({}));
    service.obtenerTodosUsuariosProveedoresUsuarioOrganismos({ idPais: 'AR' }, 2, 5).subscribe();

    expect(gcRestSpy.get).toHaveBeenCalledWith(
      '/api/gestion-contratos/v1/usuarios-proveedor/all-organismo',
      jasmine.any(HttpParams)
    );

    const params = gcRestSpy.get.calls.mostRecent().args[1] as HttpParams;
    expect(params.get('page')).toBe('2');
    expect(params.get('size')).toBe('5');
    expect(params.get('idPais')).toBe('AR');
  });

  it('debería guardar un usuario proveedor', () => {
    const dto: UsuarioProveedorDTO = { id: 'test', nombre: 'Juan' } as any;
    gcRestSpy.post.and.returnValue(of(dto));

    service.guardarUsuarioProveedor(dto).subscribe();

    expect(gcRestSpy.post).toHaveBeenCalledWith('/api/gestion-contratos/v1/usuarios-proveedor', dto);
  });

  it('debería eliminar un usuario proveedor', () => {
    gcRestSpy.delete.and.returnValue(of(true));
    service.eliminarUsuarioProveedor('maria', Pais.URUGUAY, TipoDocumentoUsuario.CEDULA_IDENTIDAD, '12345678').subscribe();

    expect(gcRestSpy.delete).toHaveBeenCalledWith('/api/gestion-contratos/v1/usuarios-proveedor/maria/UY/CI/12345678');
  });

  it('no agrega filtros vacíos en obtenerTodosUsuariosProveedores', () => {
    gcRestSpy.get.and.returnValue(of({}));
    service.obtenerTodosUsuariosProveedores({}, 1, 5).subscribe();

    const params = gcRestSpy.get.calls.mostRecent().args[1] as HttpParams;
    expect(params.get('page')).toBe('1');
    expect(params.get('size')).toBe('5');
    expect(params.get('idPais')).toBeNull();
    expect(params.get('idTipoDocumento')).toBeNull();
    expect(params.get('nroDocumento')).toBeNull();
  });

  it('exportarExcelUsuariosProveedor genera y descarga archivo', () => {
    const spyCreate = spyOn(document, 'createElement').and.callFake((): any => ({ click: jasmine.createSpy('click') }));
    const spyUrl = spyOn(window.URL, 'createObjectURL').and.returnValue('blob:url');
    gcRestSpy.post.and.returnValue(of({ contenido: btoa('data'), mimeType: 'text/plain', nombre: 'file.txt' } as any));

    service.exportarExcelUsuariosProveedor({ idPais: '', idTipoDocumento: '', nroDocumento: '1' });

    expect(gcRestSpy.post).toHaveBeenCalledWith('/api/gestion-contratos/v1/usuarios-proveedor/excel', { nroDocumento: '1' });
    expect(spyCreate).toHaveBeenCalled();
    expect(spyUrl).toHaveBeenCalled();
  });

  it('exportarExcelUsuariosProveedor conserva filtros válidos', () => {
    gcRestSpy.post.and.returnValue(of({ contenido: btoa('data'), mimeType: 'text/plain', nombre: 'file.txt' } as any));

    service.exportarExcelUsuariosProveedor({ idPais: 'AR', idTipoDocumento: 'DNI', nroDocumento: '10' });

    expect(gcRestSpy.post).toHaveBeenCalledWith('/api/gestion-contratos/v1/usuarios-proveedor/excel', {
      idPais: 'AR',
      idTipoDocumento: 'DNI',
      nroDocumento: '10'
    });
  });

  it('exportarExcelUsuariosProveedor con filtros vacíos no envía parámetros', () => {
    gcRestSpy.post.and.returnValue(of({ contenido: btoa('x'), mimeType: 'x', nombre: 'f' } as any));
    service.exportarExcelUsuariosProveedor({});
    const sent = gcRestSpy.post.calls.mostRecent().args[1] as any;
    expect(sent.idPais).toBeUndefined();
    expect(sent.idTipoDocumento).toBeUndefined();
    expect(sent.nroDocumento).toBeUndefined();
  });

  it('exportarExcelUsuariosProveedorUsuarioOrganismo llama endpoint adecuado', () => {
    gcRestSpy.post.and.returnValue(of({ contenido: btoa('x'), mimeType: 'x', nombre: 'f' } as any));
    service.exportarExcelUsuariosProveedorUsuarioOrganismo({ idPais: Pais.URUGUAY });
    expect(gcRestSpy.post).toHaveBeenCalledWith('/api/gestion-contratos/v1/usuarios-proveedor/excel-organismo', { idPais: Pais.URUGUAY });
  });

  it('exportarExcelUsuariosProveedorUsuarioOrganismo conserva filtros válidos', () => {
    gcRestSpy.post.and.returnValue(of({ contenido: btoa('x'), mimeType: 'x', nombre: 'f' } as any));
    service.exportarExcelUsuariosProveedorUsuarioOrganismo({ idPais: 'AR', nroDocumento: '22' });
    expect(gcRestSpy.post).toHaveBeenCalledWith('/api/gestion-contratos/v1/usuarios-proveedor/excel-organismo', {
      idPais: 'AR',
      nroDocumento: '22'
    });
  });

  it('actualizarUsuarioProveedor llama al endpoint correcto', () => {
    const dto: UsuarioProveedorDTO = { id: '1' } as any;
    gcRestSpy.put.and.returnValue(of(dto));

    service.actualizarUsuarioProveedor('u1', Pais.URUGUAY, TipoDocumentoUsuario.CEDULA_IDENTIDAD, '2', dto).subscribe();

    expect(gcRestSpy.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/usuarios-proveedor/u1/UY/CI/2', dto);
  });
});
