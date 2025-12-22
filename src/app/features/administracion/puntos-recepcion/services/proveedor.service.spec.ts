import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { ProveedorService } from './proveedor.service';

describe('ProveedorService', () => {
  let service: ProveedorService;
  let gcRestSpy: jasmine.SpyObj<RestService>;

  beforeEach(() => {
    gcRestSpy = jasmine.createSpyObj('GcRestService', ['get', 'patch']);
    TestBed.configureTestingModule({
      providers: [
        ProveedorService,
        { provide: RestService, useValue: gcRestSpy },
      ],
    });
    service = TestBed.inject(ProveedorService);
  });

  it('debería obtener proveedor por ID', () => {
    gcRestSpy.get.and.returnValue(of({}));
    service.obtenerProveedor(5).subscribe();
    expect(gcRestSpy.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/proveedores/5');
  });

  it('debería actualizar el plazo de entrega', () => {
    gcRestSpy.patch.and.returnValue(of(true));
    service.actualizarPlazoEntrega(10, 20).subscribe();
    expect(gcRestSpy.patch).toHaveBeenCalledWith('/api/gestion-contratos/v1/proveedores/10/plazo-entrega?cantidadDiasPlazoEntrega=20');
  });
});
