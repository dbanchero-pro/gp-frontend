import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RestService } from '../common/rest.service';
import { UsuarioOrganismoService } from '../usuario/usuario-organismo.service';
import { UsuarioService } from '../usuario/usuario.service';

describe('UsuarioOrganismoService', () => {
  let service: UsuarioOrganismoService;
  let gcRestSpy: jasmine.SpyObj<RestService>;

  beforeEach(() => {
    gcRestSpy = jasmine.createSpyObj('GcRestService', ['get', 'post', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        UsuarioService,
        { provide: RestService, useValue: gcRestSpy }
      ]
    });
    service = TestBed.inject(UsuarioOrganismoService);
  });

  it('debería obtener un usuario de organismo por ID compuesto', () => {
    gcRestSpy.get.and.returnValue(of({}));
    service.obtenerUsuarioOrganismo('maria', 1, 2, 3).subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/usuarios-organismo/maria/1/2/3');
  });

  it("obtenerUsuariosOrganismoNoExiste envia filtros", () => {
    gcRestSpy.get.and.returnValue(of([]));
    service.obtenerUsuariosOrganismoNoExiste("CONFORMIDAD" as any, { idInciso: 1, idUnidadEjecutora: 2 }).subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith("/api/gestion-contratos/v1/usuarios-organismo/usuarios-no-existentes-gc-conformidad", jasmine.anything());
  });

  it('obtenerUsuariosOrganismoNoExiste con unidadCompra', () => {
    gcRestSpy.get.and.returnValue(of([]));
    service.obtenerUsuariosOrganismoNoExiste('CONFORMIDAD' as any, { idUnidadCompra: 3 }).subscribe();
    const params = gcRestSpy.get.calls.mostRecent().args[1] as any;
    expect(params.get('idUnidadCompra')).toBe('3');
  });

  it("obtenerInformacionUsuarioSice incluye params", () => {
    gcRestSpy.post.and.returnValue(of({}));
    service.obtenerInformacionUsuarioSice("u1", "CONFORMIDAD" as any).subscribe();
    expect(gcRestSpy.post).toHaveBeenCalledWith("/api/gestion-contratos/v1/usuarios-organismo/obtener-informacion-usuario-sice", null, jasmine.anything());
  });
});
