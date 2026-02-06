import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { UsuarioDTO } from 'src/app/shared/models/usuario/usuario.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { EstadoAjuste } from '../../enum/estado-ajuste.enum';
import { TipoAjuste } from '../../enum/tipo-ajuste.enum';
import { IAjusteDTO } from '../../models/ajuste.model';
import { IAjustesItemsRequestDTO } from '../../models/ajustes-items-request.model';
import { AjusteMasivoItemsPopupComponent } from './ajuste-masivo-items-popup.component';

class MockModalRef { hide = jasmine.createSpy('hide'); }

class ActualizarServiceStub {
  popups: any[] = [];
  capturarErrores = true;
  confirmar = jasmine.createSpy('confirmar').and.callFake((_msg: any, aceptar: () => void) => aceptar());
  mensajeAdvertencia = jasmine.createSpy('mensajeAdvertencia');
  mensajeError = jasmine.createSpy('mensajeError');
  mensajeOcultar = jasmine.createSpy('mensajeOcultar');
}

class DocumentosUtilServiceStub {
  eliminarDocumento(documentos: ArchivoDTO[], documento: ArchivoDTO): ArchivoDTO[] {
    if (!documento) return documentos;
    if (documento.id && documento.id < 0) return documentos.filter(d => d.id !== documento.id);
    documento.modificado = true; documento.eliminado = true; return [...documentos];
  }
  obtenerDocumentosAMostrar(documentos: ArchivoDTO[]): ArchivoDTO[] { return documentos.filter(d => d.eliminado !== true); }
}

class BsModalServiceStub {
  contentFactory: () => any = () => ({ documentoAgregado: { subscribe: () => undefined } });
  show = jasmine.createSpy('show').and.callFake((_component: any, _config: any) => ({ content: this.contentFactory(), hide: jasmine.createSpy('hide') }));
}


describe('AjusteMasivoItemsPopupComponent', () => {
  let fixture: ComponentFixture<AjusteMasivoItemsPopupComponent>;
  let component: AjusteMasivoItemsPopupComponent;
  let actualizarServiceStub: ActualizarServiceStub;
  let documentosUtilServiceStub: DocumentosUtilServiceStub;
  let archivoServiceSpy: jasmine.SpyObj<ArchivoService>;
  let modalServiceStub: BsModalServiceStub;
  let seguridadServiceSpy: jasmine.SpyObj<SeguridadService>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;

  beforeEach(async () => {
    actualizarServiceStub = new ActualizarServiceStub();
    documentosUtilServiceStub = new DocumentosUtilServiceStub();
    archivoServiceSpy = jasmine.createSpyObj<ArchivoService>('ArchivoService', ['descargar', 'obtener']);
    modalServiceStub = new BsModalServiceStub();
    seguridadServiceSpy = jasmine.createSpyObj<SeguridadService>('SeguridadService', ['obtenerUsuarioLogueado']);
    usuarioServiceSpy = jasmine.createSpyObj<UsuarioService>('UsuarioService', ['obtenerUsuarioPorId']);
    seguridadServiceSpy.obtenerUsuarioLogueado.and.returnValue('usuario-1');
    usuarioServiceSpy.obtenerUsuarioPorId.and.returnValue(of({ id: 'usuario-1' } as UsuarioDTO));

    await TestBed.configureTestingModule({
      declarations: [AjusteMasivoItemsPopupComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: BsModalService, useValue: modalServiceStub },
        { provide: BsModalRef, useValue: new MockModalRef() },
        { provide: ActualizarService, useValue: actualizarServiceStub },
        { provide: DocumentosUtilService, useValue: documentosUtilServiceStub },
        { provide: ArchivoService, useValue: archivoServiceSpy },
        { provide: SeguridadService, useValue: seguridadServiceSpy },
        { provide: UsuarioService, useValue: usuarioServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AjusteMasivoItemsPopupComponent);
    component = fixture.componentInstance;
    component.tipoUsuario = TipoUsuario.PROVEEDOR;
    component.ordenCompra = { idOC: 1 } as any;
    component.items = [
      {
        idItem: 10,
        nroItem: 1,
        descArticulo: 'Papel',
        codArticulo: 100,
        fechaComprometida: new Date(Date.now() + 86400000),
        cantidad: 200,
        cantidadPendienteAsignar: 50,
        puedeAgregarAjusteAnulacion: true,
        puedeAgregarAjusteCantidad: true,
        puedeAgregarAjusteFecha: true,
      } as any,
      {
        idItem: 11,
        nroItem: 2,
        descArticulo: 'Lapiz',
        codArticulo: 101,
        fechaComprometida: new Date(Date.now() + 86400000),
        cantidad: 500,
        cantidadPendienteAsignar: 100,
        puedeAgregarAjusteAnulacion: true,
        puedeAgregarAjusteCantidad: true,
        puedeAgregarAjusteFecha: true,
      } as any,
    ];

    fixture.detectChanges();
  });

  it('debería ordenar los ítems por número ascendente', () => {
    const fixtureLocal = TestBed.createComponent(AjusteMasivoItemsPopupComponent);
    const comp = fixtureLocal.componentInstance;
    comp.tipoUsuario = TipoUsuario.PROVEEDOR;
    comp.ordenCompra = { idOC: 2 } as any;
    comp.items = [
      {
        idItem: 30,
        nroItem: 5,
        descArticulo: 'Archivadores',
        codArticulo: 300,
        fechaComprometida: new Date(),
        cantidad: 10,
        cantidadPendienteAsignar: 2,
      } as any,
      {
        idItem: 31,
        nroItem: 2,
        descArticulo: 'Carpetas',
        codArticulo: 200,
        fechaComprometida: new Date(),
        cantidad: 5,
        cantidadPendienteAsignar: 1,
      } as any,
      {
        idItem: 32,
        nroItem: 3,
        descArticulo: 'Cuadernos',
        codArticulo: 250,
        fechaComprometida: new Date(),
        cantidad: 7,
        cantidadPendienteAsignar: 3,
      } as any,
    ];

    fixtureLocal.detectChanges();

    const numerosOrdenados = comp.items.map(item => item.nroItem);
    expect(numerosOrdenados).toEqual([2, 3, 5]);

    const filas = Array.from(fixtureLocal.nativeElement.querySelectorAll('tbody tr')) as HTMLElement[];
    const numerosMostrados = filas.map(fila => {
      const texto = (fila.querySelector('.col-item') as HTMLElement | null)?.textContent ?? '';
      const match = texto.match(/(\d+)/);
      return match ? Number(match[1]) : NaN;
    });

    expect(numerosMostrados).toEqual([2, 3, 5]);
  });

  it('deberia iniciar con los campos deshabilitados sin tipo seleccionado', () => {
    const primerItem = component.itemsForm.at(0);
    expect(primerItem.get('nuevaFecha')?.disabled).toBeTrue();
    expect(primerItem.get('nuevaCantidad')?.disabled).toBeTrue();
  });

  it('deberia habilitar fecha y cantidad al elegir el tipo fecha y cantidad', () => {
    component.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD });
    const primerItem = component.itemsForm.at(0);
    component.items[0].puedeAgregarAjusteCantidad = true;
    component.items[0].puedeAgregarAjusteFecha = true;
    expect(primerItem.get('nuevaFecha')?.enabled).toBeTrue();
    expect(primerItem.get('nuevaCantidad')?.enabled).toBeTrue();
  });

  it('deberia deshabilitar los campos al seleccionar anular', () => {
    component.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD });
    const primerItem = component.itemsForm.at(0);
    primerItem.get('nuevaFecha')?.setValue('2025-01-01');
    primerItem.get('nuevaCantidad')?.setValue(5);

    component.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_ANULAR });

    expect(primerItem.get('nuevaFecha')?.disabled).toBeTrue();
    expect(primerItem.get('nuevaFecha')?.value).toBe('2025-01-01');
    expect(primerItem.get('nuevaCantidad')?.disabled).toBeTrue();
    expect(primerItem.get('nuevaCantidad')?.value).toBeNull();
  });

  it('debería emitir request válido al guardar con ítems válidos', () => {
    const spyEmit = spyOn(component.ajustesGuardados, 'emit');
    component.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA });

    const f0 = component.itemsForm.at(0);
    const f1 = component.itemsForm.at(1);
    component.documentos = [{ id: -1, nombre: 'doc.pdf', mimeType: 'application/pdf', modificado: true }];
    const fechaValida = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
    f0.get('nuevaFecha')?.setValue(fechaValida);
    f1.get('nuevaFecha')?.setValue(fechaValida);

    component.guardar();

    expect(spyEmit).toHaveBeenCalled();
    const req = spyEmit.calls.mostRecent().args[0] as IAjustesItemsRequestDTO;
    expect(req.idOC).toBe(1);
    expect(req.ajusteDto.length).toBe(2);
    expect(req.estado).toBe(EstadoAjuste.EN_PROCESO);
  });
  it('deberia impedir guardar cuando existen items con errores en el formulario', () => {
    const spyEmit = spyOn(component.ajustesGuardados, 'emit');
    component.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD });

    const fechaValida = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
    component.itemsForm.at(0).get('nuevaFecha')?.setValue(fechaValida);
    component.itemsForm.at(1).get('nuevaCantidad')?.setValue(999999);

    component.documentos = [{ id: -2, nombre: 'ok.pdf', mimeType: 'application/pdf', modificado: true }];

    component.confirmar();

    expect(actualizarServiceStub.confirmar).not.toHaveBeenCalled();
    expect(spyEmit).not.toHaveBeenCalled();
    expect(component.itemsForm.at(1).get('nuevaCantidad')?.hasError('cantidadInvalida')).toBeTrue();
  });

  it('deberia permitir omitir ajustes en items sin cambios', () => {
    const spyEmit = spyOn(component.ajustesGuardados, 'emit');
    component.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD });
    component.documentos = [{ id: -3, nombre: 'doc.pdf', mimeType: 'application/pdf', modificado: true }];

    component.itemsForm.at(0).get('nuevaCantidad')?.setValue(150);

    component.guardar();

    expect(spyEmit).toHaveBeenCalled();
    const req = spyEmit.calls.mostRecent().args[0] as IAjustesItemsRequestDTO;
    expect(req.ajusteDto.length).toBe(1);
    expect(req.ajusteDto[0].itemOrdenCompra?.idItem).toBe(component.items[0].idItem);
    expect(req.ajusteDto.some(a => a.itemOrdenCompra?.idItem === component.items[1].idItem)).toBeFalse();
    expect(component.itemsForm.at(1).get('nuevaFecha')?.hasError('requeridoAlMenosUno')).toBeFalse();
    expect(component.itemsForm.at(1).get('nuevaCantidad')?.hasError('requeridoAlMenosUno')).toBeFalse();
  });

  
  it('debería deshabilitar confirmar si existe pendiente del mismo tipo', () => {
    component.ajustesPendientes = [{ estado: EstadoAjuste.PENDIENTE_APROBACION, tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA } as IAjusteDTO];
    fixture.detectChanges();
    component.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA });
    expect(component.deshabilitarConfirmar).toBeTrue();
  });

  it('deberia ocultar el input de cantidad cuando el item no permite ajustar', () => {
    const fixtureLocal = TestBed.createComponent(AjusteMasivoItemsPopupComponent);
    const comp = fixtureLocal.componentInstance;
    comp.tipoUsuario = TipoUsuario.PROVEEDOR;
    comp.ordenCompra = { idOC: 10, fechaComprometida: new Date().toISOString().split('T')[0] } as any;
    comp.items = [
      {
        idItem: 50,
        nroItem: 1,
        descArticulo: 'Sin pendiente',
        codArticulo: 500,
        cantidad: 5,
        cantidadPendienteAsignar: 0,
        tipoArticulo: 'B',
        fechaComprometida: new Date(),
      } as any,
      {
        idItem: 51,
        nroItem: 2,
        descArticulo: 'Servicio',
        codArticulo: 501,
        cantidad: 1,
        cantidadPendienteAsignar: 1,
        tipoArticulo: 'S',
        fechaComprometida: new Date(),
      } as any,
    ];

    fixtureLocal.detectChanges();

    comp.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD });
    fixtureLocal.detectChanges();

    expect(comp.puedeMostrarCantidad(comp.items[0])).toBeFalse();
    expect(comp.puedeMostrarCantidad(comp.items[1])).toBeFalse();
    expect(comp.itemsForm.at(0).get('nuevaCantidad')?.disabled).toBeTrue();
    expect(comp.itemsForm.at(1).get('nuevaCantidad')?.disabled).toBeTrue();

    const filas = fixtureLocal.nativeElement.querySelectorAll('tbody tr');
    expect(filas[0].querySelectorAll('input[formcontrolname="nuevaCantidad"]').length).toBe(0);
    expect(filas[1].querySelectorAll('input[formcontrolname="nuevaCantidad"]').length).toBe(0);
  });

  it('debería permitir una nueva fecha igual a la fecha comprometida', () => {
    component.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA });

    const fechaItem0 = (component.items[0].fechaComprometida as Date).toISOString().split('T')[0];
    const fechaItem1 = (component.items[1].fechaComprometida as Date).toISOString().split('T')[0];

    component.itemsForm.at(0).get('nuevaFecha')?.setValue(fechaItem0);
    component.itemsForm.at(1).get('nuevaFecha')?.setValue(fechaItem1);

    component.guardar();

    expect(component.itemsForm.at(0).get('nuevaFecha')?.hasError('fechaNoAdelantada')).toBeFalse();
    expect(component.itemsForm.at(1).get('nuevaFecha')?.hasError('fechaNoAdelantada')).toBeFalse();
  });

  it('debería validar contra la fecha comprometida de la orden cuando el ítem no la posee', () => {
    const fixtureSinFecha = TestBed.createComponent(AjusteMasivoItemsPopupComponent);
    const comp = fixtureSinFecha.componentInstance;
    comp.tipoUsuario = TipoUsuario.PROVEEDOR;
    const fechaOC = new Date();
    fechaOC.setDate(fechaOC.getDate() + 7);
    const fechaOCIso = fechaOC.toISOString().split('T')[0];
    comp.ordenCompra = { idOC: 99, fechaComprometida: fechaOCIso } as any;
    comp.items = [{
      idItem: 1,
      idVariacion: 1,
      idOC: 99,
      nroItem: 1,
      descArticulo: 'Servicio',
      codArticulo: 1,
      cantidad: 10,
      cantidadPendienteAsignar: 0,
      fechaComprometida: null,
    } as any];

    fixtureSinFecha.detectChanges();

    comp.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA });

    comp.itemsForm.at(0).get('nuevaFecha')?.setValue(fechaOCIso);
    comp.guardar();
    expect(comp.itemsForm.at(0).get('nuevaFecha')?.hasError('fechaNoAdelantada')).toBeFalse();

    const fechaAnterior = new Date(fechaOC);
    fechaAnterior.setDate(fechaAnterior.getDate() - 1);
    const fechaAnteriorIso = fechaAnterior.toISOString().split('T')[0];

    comp.itemsForm.at(0).get('nuevaFecha')?.setValue(fechaAnteriorIso);
    comp.guardar();

    expect(comp.itemsForm.at(0).get('nuevaFecha')?.hasError('fechaNoAdelantada')).toBeFalse();
  });

  it('agregarDocumento no abre el popup si ya existe un documento', () => {
    component.documentos = [{ id: -1, nombre: 'ya.pdf', modificado: true }];
    component.agregarDocumento();
    expect(modalServiceStub.show).not.toHaveBeenCalled();
  });

  it('obtenerDocumentoEmitible devuelve null sin documentos y clona el primero disponible', () => {
    component.documentos = [];
    expect(component.obtenerDocumentoEmitible()).toBeNull();
    const base: ArchivoDTO = { id: -1, nombre: 'doc.pdf', eliminado: false };
    component.documentos = [base];
    const emitible = component.obtenerDocumentoEmitible();
    expect(emitible).toEqual(base);
    expect(emitible).not.toBe(base);
  });

  it('descargarDocumento maneja documentos embebidos y por id', () => {
    const descargarSpy = archivoServiceSpy.descargar;
    component.descargarDocumento({ id: -9, nombre: 'embebido.pdf', contenido: 'abc' });
    expect(descargarSpy).toHaveBeenCalledWith({ id: -9, nombre: 'embebido.pdf', contenido: 'abc' });

    archivoServiceSpy.obtener.and.returnValue(of({ id: 10, nombre: 'remoto.pdf', contenido: 'x' } as any));
    component.descargarDocumento({ id: 10, nombre: 'desdeDoc.pdf' });
    expect(archivoServiceSpy.obtener).toHaveBeenCalledWith(10);
    expect(descargarSpy).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'desdeDoc.pdf' }));
  });

  it('guardar no emite si falta el tipo de ajuste o el comentario es inválido', () => {
    const emitSpy = spyOn(component.ajustesGuardados, 'emit');
    component.documentos = [{ id: -1, nombre: 'doc.pdf', modificado: true }];
    component.guardar();
    expect(emitSpy).not.toHaveBeenCalled();

    component.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_ANULAR, comentario: 'x'.repeat(600) });
    component.guardar();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('guardar muestra error si no hay documentos adjuntos', () => {
    const errorSpy = spyOn<any>(component, 'procesarError');
    component.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA });
    component.itemsForm.at(0).get('nuevaFecha')?.setValue(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    component.guardar();
    expect(errorSpy).toHaveBeenCalledWith('Debe adjuntar un documento');
  });

  it('guardar corta cuando no hay filas válidas pese a tener documento', () => {
    const emitSpy = spyOn(component.ajustesGuardados, 'emit');
    component.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD });
    component.documentos = [{ id: -4, nombre: 'doc.pdf', modificado: true }];
    component.guardar();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('validarCantidad marca noPermitido para servicios de cantidad 1', () => {
    const fixtureServicio = TestBed.createComponent(AjusteMasivoItemsPopupComponent);
    const comp = fixtureServicio.componentInstance;
    comp.tipoUsuario = TipoUsuario.ORGANISMO;
    comp.ordenCompra = { idOC: 20 } as any;
    comp.items = [{
      idItem: 1,
      nroItem: 1,
      descArticulo: 'Servicio puntual',
      codArticulo: 123,
      tipoArticulo: 'S',
      cantidad: 1,
      cantidadPendienteAsignar: 1,
      puedeAgregarAjusteCantidad: true,
      puedeAgregarAjusteFecha: true,
      fechaComprometida: new Date()
    } as any];
    fixtureServicio.detectChanges();
    comp.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD });
    comp.itemsForm.at(0).get('nuevaCantidad')?.setValue(0);
    comp.documentos = [{ id: -10, nombre: 'doc.pdf', modificado: true }];
    comp.guardar();
    expect(comp.itemsForm.at(0).get('nuevaCantidad')?.hasError('noPermitido')).toBeTrue();
  });

});
