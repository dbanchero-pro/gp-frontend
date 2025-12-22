import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { LOCALE_ID, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { EMPTY, of, throwError } from 'rxjs';
import { ItemOrdenCompraService } from 'src/app/features/entregas/services/item-orden-compra.service';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { Logger } from 'src/app/shared/utils/logger';
import { EstadoAjuste } from '../../enum/estado-ajuste.enum';
import { TipoAjuste } from '../../enum/tipo-ajuste.enum';
import { IAjusteDTO } from '../../models/ajuste.model';
import { TipoAjusteResumenPipe } from '../../pipes/tipo-ajuste-resumen.pipe';
import { AjusteService } from '../../services/ajuste.service';
import { AjusteDetalleComponent } from './ajuste-detalle.component';

class BsModalServiceStub {
  show() {
    return { content: {} } as any;
  }
}

registerLocaleData(localeEs);


describe('AjusteDetalleComponent', () => {
  let component: AjusteDetalleComponent;
  let fixture: ComponentFixture<AjusteDetalleComponent>;

  const crearAjuste = (descargos: IAjusteDTO['descargos']) => ({
    fechaOrdenamiento: null,
    idAjuste: 1,
    tipoAjuste: TipoAjuste.OC_ANULAR,
    estado: EstadoAjuste.EN_PROCESO,

    descargos,
    ordenCompra: { puntoRecepcion: { nombre: 'Calle 10' } as any, fechaComprometida: '2024-06-01', fechaOC: '2024-05-01' } as any,
  }) as IAjusteDTO;

  const routerStub = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);
  Object.defineProperty(routerStub, 'url', { value: '/ajustes' });

  const itemOrdenCompraServiceStub: Partial<ItemOrdenCompraService> = {
    obtenerItemOrdenCompra: () => of({} as any),
    obtenerUnidades: (item: any) => {
      const unidad = item?.descUnidadMedida?.trim();
      if (!unidad || unidad.replace(/-/g, '').trim() === '') {
        return '';
      }
      return `(${unidad})`;
    }
  };

  const archivoServiceStub = jasmine.createSpyObj<ArchivoService>('ArchivoService', ['descargar', 'obtener']);
  const ajusteServiceStub = jasmine.createSpyObj<AjusteService>('AjusteService', ['descargarDocumento','descargarDescargo']);
  archivoServiceStub.obtener.and.returnValue(of({ contenido: 'YQ==', nombre: 'archivo.pdf' }));
  ajusteServiceStub.descargarDocumento.and.callFake((_idAjuste: number, idArchivo: number) => archivoServiceStub.obtener(idArchivo));
  ajusteServiceStub.descargarDescargo.and.callFake((_idAjuste: number, idArchivo: number) => archivoServiceStub.obtener(idArchivo));

beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AjusteDetalleComponent, TipoAjusteResumenPipe],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: routerStub },
        { provide: ItemOrdenCompraService, useValue: itemOrdenCompraServiceStub },
        { provide: ArchivoService, useValue: archivoServiceStub },
        { provide: AjusteService, useValue: ajusteServiceStub },
        { provide: LOCALE_ID, useValue: 'es' },
        { provide: BsModalService, useClass: BsModalServiceStub }
      ],
      schemas:  [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AjusteDetalleComponent);
    component = fixture.componentInstance;
    component.ajuste = { idAjuste: 1, tipoAjuste: TipoAjuste.OC_ANULAR} as any;
    routerStub.navigate.calls.reset();
    routerStub.navigateByUrl.calls.reset();
    archivoServiceStub.descargar.calls.reset();
    archivoServiceStub.obtener.calls.reset();
    archivoServiceStub.obtener.and.returnValue(of({ contenido: 'YQ==', nombre: 'archivo.pdf' }));
    ajusteServiceStub.descargarDocumento.and.callFake((_idAjuste: number, idArchivo: number) => archivoServiceStub.obtener(idArchivo));
    ajusteServiceStub.descargarDocumento.calls.reset();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  

  it('tieneDescargos devuelve true cuando la lista tiene elementos', () => {
    const ajuste = crearAjuste([{ comentario: 'algo' }]);

    expect(component.tieneDescargos(ajuste)).toBeTrue();
  });

  it('tieneDescargos devuelve false cuando no hay descargos', () => {
    const ajusteSinDescargos = crearAjuste([]);

    expect(component.tieneDescargos(ajusteSinDescargos)).toBeFalse();
    expect(component.tieneDescargos(undefined)).toBeFalse();
  });

  it('descargarDescargo descarga directamente cuando el contenido esta disponible', () => {
    const descargo = { archivo: { contenido: 'YQ==', nombre: 'original.pdf' } } as any;

    component.descargarDescargo(descargo);

    expect(archivoServiceStub.descargar).toHaveBeenCalledWith(descargo.archivo);
    expect(archivoServiceStub.obtener).not.toHaveBeenCalled();
  });

  it('descargarDescargo obtiene el archivo cuando solo viene el id', () => {
    const descargo = { archivo: { id: 77, nombre: 'esperado.pdf' } } as any;
    archivoServiceStub.obtener.and.returnValue(of({ contenido: 'Yg==', nombre: 'desdeServicio.pdf' }));

    component.descargarDescargo(descargo);

    expect(archivoServiceStub.obtener).toHaveBeenCalledWith(77);
    expect(archivoServiceStub.descargar).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'esperado.pdf' }));
  });

  it('descargarDescargo usa el nombre retornado por el servicio cuando el descargo no lo provee', () => {
    const descargo = { archivo: { id: 88 } } as any;
    archivoServiceStub.obtener.and.returnValue(of({ contenido: 'YWY=', nombre: 'desdeServicio.pdf' }));

    component.descargarDescargo(descargo);

    expect(archivoServiceStub.descargar).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'desdeServicio.pdf' }));
  });

  it('no debe descargar descargo cuando el servicio no devuelve archivo', () => {
    const descargo = { archivo: { id: 90 } } as any;
    archivoServiceStub.obtener.and.returnValue(of(null as any));

    component.descargarDescargo(descargo);

    expect(archivoServiceStub.descargar).not.toHaveBeenCalled();
    archivoServiceStub.obtener.and.returnValue(of({ contenido: 'YQ==', nombre: 'archivo.pdf' }));
  });

  it('descargarDescargo no hace nada cuando no hay archivo', () => {
    component.descargarDescargo({} as any);

    expect(archivoServiceStub.obtener).not.toHaveBeenCalled();
    expect(archivoServiceStub.descargar).not.toHaveBeenCalled();
  });

  it('deberia indicar que se muestran valores para ajustes de fecha', () => {
    const ajuste = crearAjuste(null);
    ajuste.tipoAjuste = TipoAjuste.OC_CAMBIAR_FECHA;

    expect(component.debeMostrarValores(ajuste)).toBeTrue();
  });

  it('no deberia mostrar valores para ajustes de anulacion', () => {
    const ajuste = crearAjuste(null);
    ajuste.tipoAjuste = TipoAjuste.OC_ANULAR;

    expect(component.debeMostrarValores(ajuste)).toBeFalse();
  });

  it('deberia formatear las fechas de los ajustes de fecha', () => {
    const ajuste = crearAjuste(null);
    ajuste.tipoAjuste = TipoAjuste.ITEM_CAMBIAR_FECHA;
    ajuste.fechaOriginal = '2024-02-10';
    ajuste.fechaNueva = '2024-03-15';
    ajuste.itemOrdenCompra = { fechaComprometida: '2024-02-10' } as any;

    expect(component.valorNuevoDescripcion(ajuste)).toBe('15/03/2024');
    expect(component.valorAnteriorDescripcion(ajuste)).toBe('10/02/2024');
  });

  it('deberia formatear las cantidades incluyendo la unidad cuando corresponde', () => {
    const ajuste = crearAjuste(null);
    ajuste.tipoAjuste = TipoAjuste.ITEM_CAMBIAR_CANTIDAD;
    ajuste.cantidadNueva = 10.5;
    ajuste.itemOrdenCompra = { descUnidadMedida: 'kg', cantidad: 8 } as any;

    ajuste.cantidadOriginal = 12;
    expect(component.valorNuevoDescripcion(ajuste)).toBe('10,5 (kg)');
    expect(component.valorAnteriorDescripcion(ajuste)).toBe('12 (kg)');
  });

  it('deberia omitir la unidad cuando solo contiene guiones', () => {
    const ajuste = crearAjuste(null);
    ajuste.tipoAjuste = TipoAjuste.ITEM_CAMBIAR_CANTIDAD;
    ajuste.cantidadNueva = 5;
    ajuste.itemOrdenCompra = { descUnidadMedida: '--' } as any;

    expect(component.valorNuevoDescripcion(ajuste)).toBe('5');
  });

  it('deberia formatear el punto de recepcion usando nombre y direccion', () => {
    const ajuste = crearAjuste(null);
    ajuste.tipoAjuste = 'OC_CAMBIAR_PR' as any;
    
    ajuste.puntoRecepcionOriginal = { nombre: 'Calle 10' } as any;
    ajuste.puntoRecepcionNuevo = { nombre: 'Deposito Central' } as any;

    expect(component.valorNuevoDescripcion(ajuste)).toBe('Deposito Central');
    expect(component.valorAnteriorDescripcion(ajuste)).toBe('Calle 10');
  });

  it('deberia devolver guion cuando no hay valores para mostrar', () => {
    const ajuste = crearAjuste(null);

    expect(component.valorNuevoDescripcion(ajuste)).toBe('-');
    expect(component.valorAnteriorDescripcion(ajuste)).toBe('-');
  });

  it('deberia descargar el documento del ajuste cuando el contenido esta disponible', () => {
    const ajuste = crearAjuste(null);
    ajuste.archivo = { id: 45, nombre: 'original.pdf' } as any;
    const documentoServicio = { id: 45, nombre: 'ajuste.pdf', contenido: 'YQ==' } as ArchivoDTO;
    ajusteServiceStub.descargarDocumento.and.returnValue(of(documentoServicio));

    component.descargarDocumento(ajuste.archivo as any);

    expect(ajusteServiceStub.descargarDocumento).toHaveBeenCalledWith(1, 45);
    expect(archivoServiceStub.descargar).toHaveBeenCalledWith(documentoServicio);
    expect(archivoServiceStub.obtener).not.toHaveBeenCalled();
  });

  it('deberia obtener el documento del ajuste cuando solo viene el id', () => {
    const ajuste = crearAjuste(null);
    ajuste.archivo = { id: 55, nombre: 'esperado.pdf' } as any;
    const recuperado = { contenido: 'Yg==', nombre: 'desdeServicio.pdf' } as ArchivoDTO;
    archivoServiceStub.obtener.and.returnValue(of(recuperado));

    component.descargarDocumento(ajuste.archivo as any);

    expect(archivoServiceStub.obtener).toHaveBeenCalledWith(55);
    expect(ajusteServiceStub.descargarDocumento).toHaveBeenCalledWith(1, 55);
    expect(archivoServiceStub.descargar).toHaveBeenCalledWith(recuperado);
  });

  it('descargarDocumento usa el nombre retornado por el servicio cuando falta en el ajuste', () => {
    const ajuste = crearAjuste(null);
    ajuste.archivo = { id: 95 } as any;
    archivoServiceStub.obtener.and.returnValue(of({ contenido: 'ZWE=', nombre: 'servicio.pdf' }));

    component.descargarDocumento(ajuste.archivo as any);

    expect(archivoServiceStub.descargar).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'servicio.pdf' }));
  });

  it('no debe descargar documento cuando el servicio no devuelve archivo', () => {
    const ajuste = crearAjuste(null);
    ajuste.archivo = { id: 12 } as any;
    ajusteServiceStub.descargarDocumento.and.returnValue(EMPTY);

    component.descargarDocumento(ajuste.archivo as any);

    expect(archivoServiceStub.descargar).not.toHaveBeenCalled();
    ajusteServiceStub.descargarDocumento.and.callFake((_idAjuste: number, idArchivo: number) => archivoServiceStub.obtener(idArchivo));
  });

  it('deberia usar el nombre retornado por el servicio cuando falta en el ajuste', () => {
    const ajuste = crearAjuste(null);
    ajuste.archivo = { id: 33 } as any;
    archivoServiceStub.obtener.and.returnValue(of({ contenido: 'Yg==', nombre: 'desde-servicio.pdf' }));

    component.descargarDocumento(ajuste.archivo as any);

    expect(archivoServiceStub.descargar).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'desde-servicio.pdf' }));
  });

  it('deberia describir el origen de la solicitud segun el tipo de usuario', () => {
    expect((component as any).origenSolicitud('PROVEEDOR')).toBe('Proveedor');
    expect((component as any).origenSolicitud('ORGANISMO')).toBe('Organismo');
    expect((component as any).origenSolicitud(undefined)).toBe('Organismo');
  });

  it('deberia indicar que no se muestran valores cuando el ajuste no tiene tipo', () => {
    expect(component.debeMostrarValores({} as IAjusteDTO)).toBeFalse();
  });

  it('deberia devolver guion cuando el ajuste a describir es nulo', () => {
    expect(component.valorNuevoDescripcion(undefined as unknown as IAjusteDTO)).toBe('-');
    expect(component.valorAnteriorDescripcion(undefined as unknown as IAjusteDTO)).toBe('-');
  });

  it('deberia tomar la fecha de la orden cuando no es ajuste por item', () => {
    const ajuste = crearAjuste(null);
    ajuste.tipoAjuste = TipoAjuste.OC_CAMBIAR_FECHA;

    ajuste.fechaOriginal = '2024-06-01';
    expect((component as any).obtenerFechaAnterior(ajuste)).toBe('2024-06-01');
  });

  it('deberia devolver null en fecha anterior cuando no hay informacion disponible', () => {
    const ajuste = crearAjuste(null);
    ajuste.tipoAjuste = TipoAjuste.OC_CAMBIAR_FECHA;
    // Sin fechas en la orden de compra debería devolver null
    ajuste.ordenCompra = undefined as any;

    expect((component as any).obtenerFechaAnterior(ajuste)).toBeNull();
  });

  it('deberia devolver guion cuando se formatea una fecha indefinida', () => {
    expect((component as any).formatearFecha(undefined)).toBe('-');
  });

  it('deberia formatear cantidades incluso sin item asociado', () => {
    expect((component as any).formatearCantidad(12, null)).toBe('12');
  });

  it('deberia detectar ajustes de punto para mostrar valores', () => {
    const ajuste = crearAjuste(null);
    ajuste.tipoAjuste = TipoAjuste.OC_CAMBIAR_PR;

    expect(component.debeMostrarValores(ajuste)).toBeTrue();
  });

  it('deberia registrar error cuando falla la descarga del descargo', () => {
    const descargo = { archivo: { id: 99 } } as any;
    archivoServiceStub.obtener.and.returnValue(throwError(() => 'fallo-descargo'));
    const logSpy = spyOn(Logger, 'logError');

    component.descargarDescargo(descargo);

    expect(logSpy).toHaveBeenCalledWith('Error al descargar documento de descargo', 'fallo-descargo');
    archivoServiceStub.obtener.and.returnValue(of({ contenido: 'YQ==', nombre: 'archivo.pdf' }));
  });

  it('deberia registrar error cuando falla la descarga del documento del ajuste', () => {
    const ajuste = crearAjuste(null);
    ajuste.archivo = { id: 45 } as any;
    archivoServiceStub.obtener.and.returnValue(throwError(() => 'fallo-ajuste'));
    const logSpy = spyOn(Logger, 'logError');

    component.descargarDocumento(ajuste.archivo as any);

    expect(logSpy).toHaveBeenCalledWith('Error al descargar documento de ajuste', 'fallo-ajuste');
    archivoServiceStub.obtener.and.returnValue(of({ contenido: 'YQ==', nombre: 'archivo.pdf' }));
  });

  it('deberia registrar error al intentar formatear una fecha invalida', () => {
    const logSpy = spyOn(Logger, 'logError');

    const resultado = (component as any).formatearFecha(new Date('invalid'));

    expect(logSpy).toHaveBeenCalledWith('No fue posible formatear la fecha del ajuste', jasmine.anything());
    expect(resultado).toBe('NaN/NaN/NaN');
  });

  it('deberia devolver guion al formatear un punto de recepcion inexistente', () => {
    expect((component as any).formatearPuntoRecepcion(null)).toBe('-');
  });

  it('obtenerCantidadAnterior prioriza la cantidad total disponible', () => {
    const ajuste = crearAjuste(null);
    ajuste.itemOrdenCompra = { cantidadTotalMostrar: undefined, cantidadTotal: 12, cantidad: 7 } as any;
    ajuste.cantidadOriginal = 12;
    expect((component as any).obtenerCantidadAnterior(ajuste)).toBe(12);
  });

  it('obtenerCantidadAnterior devuelve null cuando no hay cantidades', () => {
    const ajuste = crearAjuste(null);
    ajuste.itemOrdenCompra = { cantidadTotalMostrar: undefined, cantidadTotal: undefined, cantidad: undefined } as any;

    expect((component as any).obtenerCantidadAnterior(ajuste)).toBeNull();
  });

  it('obtenerFechaAnterior usa fechaOC cuando falta fechaComprometida en la orden', () => {
    const ajuste = crearAjuste(null);
    ajuste.tipoAjuste = TipoAjuste.OC_CAMBIAR_FECHA;
    ajuste.fechaOriginal = '2024-04-20';
    // Forzamos ausencia de fechaComprometida y verificamos el fallback a fechaOC
    ajuste.ordenCompra = { ...ajuste.ordenCompra, fechaComprometida: undefined, fechaOC: '2024-04-20' } as any;

    expect((component as any).obtenerFechaAnterior(ajuste)).toBe('2024-04-20');
  });

  it('formatearFecha devuelve guion cuando el texto no tiene separadores válidos', () => {
    expect((component as any).formatearFecha('20240601')).toBe('-');
  });

  it('descargarDocumento no realiza acción si no hay archivo', () => {
    const ajuste = crearAjuste(null);

    component.descargarDocumento(undefined as any);

    expect(archivoServiceStub.descargar).not.toHaveBeenCalled();
    expect(archivoServiceStub.obtener).not.toHaveBeenCalled();
  });

  it('descargarDescargo no realiza acción si no hay archivo', () => {
    component.descargarDescargo({} as any);

    expect(archivoServiceStub.descargar).not.toHaveBeenCalled();
    expect(archivoServiceStub.obtener).not.toHaveBeenCalled();
  });

  it('descargarDocumento evita la descarga cuando el servicio no retorna archivo', () => {
    const ajuste = crearAjuste(null);
    ajuste.archivo = { id: 77, nombre: 'esperado.pdf' } as any;
    ajusteServiceStub.descargarDocumento.and.returnValue(EMPTY);

    component.descargarDocumento(ajuste.archivo as any);

    expect(archivoServiceStub.descargar).not.toHaveBeenCalled();
    ajusteServiceStub.descargarDocumento.and.callFake((_idAjuste: number, idArchivo: number) => archivoServiceStub.obtener(idArchivo));
  });

  it('descargarDescargo evita la descarga cuando el servicio no retorna archivo', () => {
    const descargo = { archivo: { id: 88, nombre: 'descargo.pdf' } } as any;
    archivoServiceStub.obtener.and.returnValue(of(null as any));

    component.descargarDescargo(descargo);

    expect(archivoServiceStub.descargar).not.toHaveBeenCalled();
    archivoServiceStub.obtener.and.returnValue(of({ contenido: 'YQ==', nombre: 'archivo.pdf' }));
  });


});
