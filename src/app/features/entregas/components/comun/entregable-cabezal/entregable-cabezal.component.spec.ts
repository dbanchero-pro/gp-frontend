import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntregableResumenPipe } from '../../../pipes/entregable-resumen.pipe';
import { EntregableService } from '../../../services/entregable.service';
import { EntregableCabezalComponent } from './entregable-cabezal.component';

describe('EntregableCabezalComponent', () => {
  let component: EntregableCabezalComponent;
  let fixture: ComponentFixture<EntregableCabezalComponent>;
  let entregableService: jasmine.SpyObj<EntregableService>;
  beforeEach(async () => {
    entregableService = jasmine.createSpyObj('EntregableService', ['obtenerCantidadEntregable','obtenerUnidades']);
    entregableService.obtenerCantidadEntregable.and.returnValue('');
    entregableService.obtenerUnidades.and.returnValue('');
       
    await TestBed.configureTestingModule({
      declarations: [EntregableCabezalComponent, EntregableResumenPipe],
      providers: [{ provide: EntregableService, useValue: entregableService },]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntregableCabezalComponent);
    component = fixture.componentInstance;
    component.entregable = {
      codEntregable: 'COD',
      descEntregable: 'Entrega demo',
      fechaComprometida: '2024-01-01',
      cantidad: 5
    } as any;
    component.pendienteTexto = '2 de 5';
    fixture.detectChanges();
  });

  it('debe mostrar el resumen y los valores configurados', () => {
    component.cantidadTexto = '5 de 10';
    component.cantidadSufijo = '%';
    component.fechaLabel = 'Fecha última entrega:';
    component.cantidadLabel = 'Cantidad:';
    fixture.detectChanges();

    const native = fixture.nativeElement as HTMLElement;
    const resumen = native.querySelector('.font-weight-bold.mb-1.subtitle');
    expect(resumen?.textContent?.trim()).toBe('COD - Entrega demo');

    const fila = native.querySelector('.row.col-12') as HTMLElement;
    const elementos = Array.from(fila?.children ?? []) as HTMLElement[];
    expect(elementos[0].textContent).toContain('Fecha última entrega:');
    expect(elementos[0].textContent).toContain('01/01/2024');
    expect(elementos[1].textContent).toContain('Cantidad:');
    expect(elementos[1].textContent).toContain('5 de 10');
    expect(elementos[1].textContent).toContain('%');

    const pendienteDiv = native.querySelector('.border .col-12 > div:last-child');
    expect(pendienteDiv?.textContent).toContain('Cantidad pendiente de asignar a entrega:');
    expect(pendienteDiv?.textContent).toContain('2 de 5');
  });

  it('debe ocultar el bloque de pendiente cuando no hay datos', () => {
    component.pendienteLabel = '';
    component.pendienteTexto = null;
    fixture.detectChanges();

    const native = fixture.nativeElement as HTMLElement;
    const pendienteDiv = native.querySelector('.border .col-12 > div:last-child');
    expect(pendienteDiv?.textContent ?? '').not.toContain('Cantidad pendiente de asignar a entrega:');
  });

  it('debe usar la cantidad del entregable cuando no se define cantidadTexto', () => {
    component.cantidadTexto = undefined;
    component.cantidadSufijo = undefined;
    fixture.detectChanges();

    const native = fixture.nativeElement as HTMLElement;
    const fila = native.querySelector('.row.col-12') as HTMLElement;
    const elementos = Array.from(fila?.children ?? []) as HTMLElement[];
    expect(elementos[1].textContent).toContain('Cantidad:');
    expect(elementos[1].textContent).toContain('5');
  });

  it('pendienteMostrada usa el servicio cuando no hay texto personalizado', () => {
    component.pendienteTexto = undefined;
    entregableService.obtenerCantidadEntregable.and.returnValue('1 de 3');
    fixture.detectChanges();

    expect(component.pendienteMostrada).toBe('1 de 3 entregas');
    expect(component.mostrarPendiente).toBeFalse();
  });

  it('pendienteMostrada devuelve vacío si el servicio no provee datos', () => {
    component.pendienteTexto = undefined;
    entregableService.obtenerCantidadEntregable.and.returnValue('');
    fixture.detectChanges();

    expect(component.pendienteMostrada).toBe('');
    expect(component.mostrarPendiente).toBeFalse();
  });

  it('sufijoMostrado devuelve el sufijo informado', () => {
    component.cantidadSufijo = ' kg ';
    fixture.detectChanges();
    expect(component.sufijoMostrado).toBe('kg');
  });

  it('sufijoMostrado usa la unidad del servicio cuando no hay sufijo', () => {
    component.cantidadSufijo = undefined;
    entregableService.obtenerUnidades.and.returnValue(' unidades ');
    fixture.detectChanges();
    expect(component.sufijoMostrado).toBe('unidades');
  });

  it('formatearSiEsNumero devuelve texto original si no es número', () => {
    const resultado = (component as any).formatearSiEsNumero('abc');
    expect(resultado).toBe('abc');
  });

  it('formatearSiEsNumero convierte números con separador', () => {
    const resultado = (component as any).formatearSiEsNumero('1,5');
    expect(resultado).toBe('1,5');
  });

  it('mostrarPendiente es verdadero cuando hay texto personalizado', () => {
    component.pendienteTexto = '3 de 4';
    fixture.detectChanges();

    expect(component.mostrarPendiente).toBeTrue();
  });

  it('obtenerPendientePorDefecto devuelve vacío sin entregable', () => {
    component.entregable = null;
    expect((component as any).obtenerPendientePorDefecto()).toBe('');
  });

  it('formatearTextoPendiente arma texto sin total', () => {
    const texto = (component as any).formatearTextoPendiente('2');
    expect(texto).toBe('2 entregas');
  });

  it('formatearTextoPendiente devuelve vacío si falta pendiente', () => {
    const texto = (component as any).formatearTextoPendiente(' de 4');
    expect(texto).toBe('');
  });

  it('sufijoMostrado devuelve vacío sin entregable ni sufijo', () => {
    component.entregable = null as any;
    component.cantidadSufijo = undefined;
    expect(component.sufijoMostrado).toBe('');
  });

  it('fechaMostrada usa la fecha provista', () => {
    component.fecha = '2025-02-02';
    expect(component.fechaMostrada).toBe('2025-02-02');
  });
});



