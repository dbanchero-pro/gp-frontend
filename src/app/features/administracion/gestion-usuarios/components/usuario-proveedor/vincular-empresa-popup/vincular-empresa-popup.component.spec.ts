import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';

import { VincularEmpresaPopupComponent } from './vincular-empresa-popup.component';

import { ProveedorService } from 'src/app/features/administracion/puntos-recepcion/services/proveedor.service';
import { Pais } from 'src/app/shared/enum/pais.enum';
import { TipoDocumentoUsuario } from 'src/app/shared/enum/tipo-documento-usuario.enum';
import { IPaisDTO } from 'src/app/shared/models/common/pais.model';
import { ProveedorDTO } from 'src/app/shared/models/proveedor/proveedor.model';
import { TipoDocumentoProveedorDTO } from 'src/app/shared/models/proveedor/tipo-documento-proveedor.model';
import { UsuarioProveedorDTO } from 'src/app/shared/models/usuario/usuario-proveedor.model';
import { UsuarioProveedorService } from 'src/app/shared/services/usuario/usuario-proveedor.service';
import { SharedModule } from 'src/app/shared/shared.module';

const proveedorMock: ProveedorDTO = {
  id: 'prov-123',
  nombre: 'Empresa X',
  nroDocumento: '12345678',
  tipoDocumento: 'RUT',
  paisDocumento: { id: Pais.URUGUAY, descripcion: 'Uruguay' } as IPaisDTO
};

const usuarioMock: UsuarioProveedorDTO = {
  id: 'uy-ci-9876543',
  idUsuario: 'uy-ci-9876543',
  nombre: 'Juan Pérez',
  pais: { id: Pais.URUGUAY, descripcion: 'Uruguay' } as IPaisDTO,
  tipoDocumento: { idTipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD, descripcion: 'Cédula de Identidad' } as TipoDocumentoProveedorDTO,
  nroDocumento: '9876543',
  proveedor: proveedorMock,
  correo: 'correo@example.com',
  fechaNombreConfirmado: new Date()
};

describe('VincularEmpresaPopupComponent', () => {
  let component: VincularEmpresaPopupComponent;
  let fixture: ComponentFixture<VincularEmpresaPopupComponent>;

  let proveedorService: jasmine.SpyObj<ProveedorService>;
  let usuarioSrvMock: jasmine.SpyObj<UsuarioProveedorService>;
  let bsModalRefMock: jasmine.SpyObj<BsModalRef>;

  beforeEach(async () => {
    proveedorService = jasmine.createSpyObj('ProveedorService', ['obtenerProveedoresRupe']);
    usuarioSrvMock = jasmine.createSpyObj('UsuarioProveedorService', ['guardarUsuarioProveedor']);
    bsModalRefMock = jasmine.createSpyObj('BsModalRef', ['show','hide']);

    await TestBed.configureTestingModule({
      declarations: [VincularEmpresaPopupComponent],
      imports: [ReactiveFormsModule, SharedModule],
      providers: [
        { provide: ProveedorService, useValue: proveedorService },
        { provide: UsuarioProveedorService, useValue: usuarioSrvMock },
        { provide: BsModalRef, useValue: bsModalRefMock },
        BsModalService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VincularEmpresaPopupComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario y proveedores desde utilService', () => {
    const mockProveedores: ProveedorDTO[] = [{
      id: '1',
      nombre: 'Empresa A',
      nroDocumento: '12345678',
      paisDocumento: { id: 'URY', descripcion: 'Uruguay' },
      tipoDocumento: 'RUT'
    }];

    proveedorService.obtenerProveedoresRupe.and.returnValue(of(mockProveedores));

    fixture.detectChanges();

    expect(component.form).toBeTruthy();
    expect(component.form.get('proveedor')).toBeTruthy();
    expect(component.form.get('correo')).toBeTruthy();
    expect(component.proveedores).toEqual(mockProveedores);
  });

  it('no debería emitir si el formulario es inválido', () => {
    proveedorService.obtenerProveedoresRupe.and.returnValue(of([]));
    fixture.detectChanges();

    spyOn(component.guardarEvento, 'emit');
    spyOn(component, 'cerrarPopup');

    component.form.get('empresa')?.setValue('');
    component.guardar();

    expect(component.guardarEvento.emit).not.toHaveBeenCalled();
    expect(component.cerrarPopup).not.toHaveBeenCalled();
  });

  it('debería emitir datos y cerrar modal si el formulario es válido', fakeAsync(() => {
    const proveedorMock: ProveedorDTO = {
      id: 'prov-123',
      nombre: 'Empresa X',
      nroDocumento: '12345678',
      tipoDocumento: 'RUT',
      paisDocumento: { id: Pais.URUGUAY, descripcion: 'Uruguay' }
    };

    proveedorService.obtenerProveedoresRupe.and.returnValue(of([proveedorMock]));
    usuarioSrvMock.guardarUsuarioProveedor.and.returnValue(of(usuarioMock));

    fixture.detectChanges();
    tick();

    spyOn(component.guardarEvento, 'emit');
    spyOn(component, 'cerrarPopup');

    component.datosIniciales = { idUsuario: 'UY-CI-9876543' };

    component.form.patchValue({
      empresa: 'prov-123',
      correo: 'correo@example.com'
    });

    component.guardar();

    expect(usuarioSrvMock.guardarUsuarioProveedor).toHaveBeenCalledWith({
      id: 'uy-ci-9876543',
      nombre: undefined,
      correo: 'correo@example.com',
      proveedor: proveedorMock
    });

    expect(component.guardarEvento.emit).toHaveBeenCalledWith({
      id: 'uy-ci-9876543',
      nombre: undefined,
      correo: 'correo@example.com',
      proveedor: proveedorMock
    });

    expect(component.cerrarPopup).toHaveBeenCalled();
  }));

  it('campoVacio devuelve true cuando el control es inválido y tocado', () => {
    proveedorService.obtenerProveedoresRupe.and.returnValue(of([]));
    fixture.detectChanges();
    const ctrl = component.form.get('correo');
    ctrl?.setValue('');
    ctrl?.markAsTouched();
    expect(component.campoVacio('correo')).toBeTrue();
  });

  it('debería mostrar error cuando proveedor no existe', fakeAsync(() => {
    proveedorService.obtenerProveedoresRupe.and.returnValue(of([]));
    fixture.detectChanges();
    component.form.patchValue({ proveedor: '99', correo: 'c@c.com' });
    component.guardar();
    tick(150);
    expect(component.showMsg).toBeTrue();
    expect(component.resultMsg[0]).toContain('Proveedor no válido');
  }));

});
