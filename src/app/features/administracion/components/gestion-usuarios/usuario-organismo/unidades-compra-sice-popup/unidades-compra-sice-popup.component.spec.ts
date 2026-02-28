
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { Pais } from 'src/app/shared/enum/pais.enum';
import { TipoDocumentoUsuario } from 'src/app/shared/enum/tipo-documento-usuario.enum';
import { FormatoCiPipe } from 'src/app/shared/pipes/formato-ci.pipe';
import { OrganismoService } from 'src/app/shared/services/organismo.service';
import { UnidadesCompraSicePopupComponent } from './unidades-compra-sice-popup.component';

describe('UnidadesCompraSicePopupComponent', () => {
  let component: UnidadesCompraSicePopupComponent;
  let fixture: ComponentFixture<UnidadesCompraSicePopupComponent>;
  let bsModalRef: jasmine.SpyObj<BsModalRef>;
  let bsModalService: jasmine.SpyObj<BsModalService>;
  let organismoServiceSpy: jasmine.SpyObj<OrganismoService>;

  const usuario = {
    id: 'uy-ci-12345678',
    nombre: 'Usuario Test',
    pais: { id: Pais.URUGUAY, descripcion: 'País Test' },
    tipoDocumento: {
      id: 1,
      descripcion: TipoDocumentoUsuario.CEDULA_IDENTIDAD,
      idPais: Pais.URUGUAY,
      idTipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD
    },
    nroDocumento: '12345678',
    unidadCompra: {},
    correo: 'usuario@test.com'
  } as any;

  beforeEach(async () => {
    organismoServiceSpy = jasmine.createSpyObj('OrganismoService', ['obtenerUCUsuarioOrganismo']);
    bsModalRef = jasmine.createSpyObj('BsModalRef', ['hide']);
    bsModalService = jasmine.createSpyObj('BsModalService', ['show', 'hide', 'getModalsCount']);
    bsModalService.show.and.returnValue({ content: {}, hide: jasmine.createSpy('hide'), setClass: jasmine.createSpy('setClass') } as any);
    bsModalService.getModalsCount.and.returnValue(0);

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        ReactiveFormsModule,
        UnidadesCompraSicePopupComponent,
        FormatoCiPipe,
      ],
      providers: [
        { provide: BsModalRef, useValue: bsModalRef },
        { provide: BsModalService, useValue: bsModalService },
        { provide: OrganismoService, useValue: organismoServiceSpy },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UnidadesCompraSicePopupComponent);
    component = fixture.componentInstance;
    component.usuario = usuario;
  });

  it('debería ordenar y paginar las unidades obtenidas', () => {
    organismoServiceSpy.obtenerUCUsuarioOrganismo.and.returnValue(of([
      { idInciso: 2, idUnidadEjecutora: 1, idUnidadCompra: 1 },
      { idInciso: 1, idUnidadEjecutora: 3, idUnidadCompra: 5 },
      { idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 4 }
    ] as any));

    component.ngOnInit();

    expect(organismoServiceSpy.obtenerUCUsuarioOrganismo).toHaveBeenCalledWith(usuario.id);
    expect(component.total).toBe(3);
    expect(component.unidadesCompra.map(uc => uc.idInciso)).toEqual([1, 1, 2]);
    expect(component.unidadesCompra[0].idUnidadEjecutora).toBe(2);
  });

  it('debería reiniciar la lista cuando el servicio retorna null', () => {
    organismoServiceSpy.obtenerUCUsuarioOrganismo.and.returnValue(of(null as any));

    component.ngOnInit();

    expect(component.todasUC).toEqual([]);
    expect(component.unidadesCompra).toEqual([]);
    expect(component.total).toBe(0);
  });

  it('debería dejar la lista vacía cuando no existen unidades', () => {
    organismoServiceSpy.obtenerUCUsuarioOrganismo.and.returnValue(of([]));

    component.ngOnInit();

    expect(component.unidadesCompra).toEqual([]);
    expect(component.total).toBe(0);
  });
});
