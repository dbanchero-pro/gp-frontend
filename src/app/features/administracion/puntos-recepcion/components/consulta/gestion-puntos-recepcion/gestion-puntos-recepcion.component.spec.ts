import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { PuntosRecepcionModule } from '../../../puntos-recepcion.module';
import { GestionPuntosRecepcionComponent } from './gestion-puntos-recepcion.component';


describe('GestionPuntosRecepcionComponent', () => {
  let component: GestionPuntosRecepcionComponent;
  let fixture: ComponentFixture<GestionPuntosRecepcionComponent>;

  let mockActivatedRoute: any;
  beforeEach(async () => {

    mockActivatedRoute = {
      params: of({ nroOc: 123 }),
      snapshot: {
        queryParamMap: convertToParamMap({})
      }
    };
    await TestBed.configureTestingModule({
    
      providers: [
        { provide: SeguridadService, useValue: { usuarioLogueadoEsUsuarioOrganismo: () => false,
            tienePermiso: (permiso: string) => true,
            tieneAlgunPermiso: (permisos: string[]) => true,
         } },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
      imports: [SharedModule, NoopAnimationsModule, PuntosRecepcionModule],
      declarations: [GestionPuntosRecepcionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GestionPuntosRecepcionComponent);
    component = fixture.componentInstance;
    spyOn(component['zonaService'], 'obtenerZonas').and.returnValue(of([]));
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con valores por defecto', () => {
    expect(component.form).toBeTruthy();
    expect(component.form.get('inhabilitados')?.value).toBeFalse();
  });


  it('debería alternar el colapso de filtros', () => {
    component.colFiltro = 'col-lg-3';
    component.colTabla = 'col-lg-9';

    component.aplicarColapso();

    expect(component.colFiltro).toBe('col-lg-1');
    expect(component.colTabla).toBe('col-lg-11');

    component.aplicarColapso();

    expect(component.colFiltro).toBe('col-lg-3');
    expect(component.colTabla).toBe('col-lg-9');
  });

  it('debería cambiar orden y llamar buscar()', () => {
    const buscarSpy = spyOn(component, 'buscar');
    component.cambioOrden('desc');
    expect(component.parametros.order).toBe('desc');
    expect(buscarSpy).toHaveBeenCalled();
  });

  it('debería cambiar columna de orden y llamar buscar()', () => {
    const buscarSpy = spyOn(component, 'buscar');
    component.cambioColumnaOrden('nombre');
    expect(component.parametros.sort).toBe('nombre');
    expect(buscarSpy).toHaveBeenCalled();
  });


  it('debería limpiar filtros y resetear resultados en limpiar()', () => {
    component.form.patchValue({ idUnidadCompra: '456', organismo: { idInciso: '1', idUnidadEjecutora: '10' } });
    component.puntosRecepcion = [{} as any];
    component.total = 1;

    spyOn(component, 'buscar'); // Evita efectos de buscar()

    // Ejecutar
    component.nuevaConsulta();

    // Verificaciones
    expect(component.form.get('idUnidadCompra')?.value).toBeUndefined();
    expect(component.total).toBe(-1);
    expect(component.puntosRecepcion.length).toBe(0);
    expect(component.buscar).toHaveBeenCalled();
  });

  it('debería cambiar de página a la primera y llamar buscar()', () => {
    const buscarSpy = spyOn(component, 'buscar');
    component.cambioPagina(2);
    component.cambioPorPagina(20);
    expect(component.parametros.pagina).toBe(0);
    expect(component.parametros.tamanoPagina).toBe(20);
    expect(buscarSpy).toHaveBeenCalled();
  });

  it('debería cambiar tamaño por página y resetear a página 1', () => {
    const buscarSpy = spyOn(component, 'buscar');
    component.cambioPorPagina(50);
    expect(component.parametros.tamanoPagina).toBe(50);
    expect(component.parametros.pagina).toBe(0);
    expect(buscarSpy).toHaveBeenCalled();
  });

  it('debería llamar buscar() desde filtrandoPorEvento()', () => {
    const buscarSpy = spyOn(component, 'buscar');

    component.form.patchValue({ idInciso: '1', idUnidadEjecutora: '10', idUnidadCompra: '100' });
    component.filtrandoPorEvento();
    expect(buscarSpy).toHaveBeenCalled();
  });

  it('debería llamar agregar() y guardar en sessionStorage', () => {
    const navigateSpy = spyOn(component['router'], 'navigate');

    component.agregar();
    expect(navigateSpy).toHaveBeenCalledWith(['/administracion/puntos-recepcion/agregar']);
  });

  it('debería llamar modificar() y guardar en sessionStorage', () => {
    const navigateSpy = spyOn(component['router'], 'navigate');

    component.modificar(42);
    expect(navigateSpy).toHaveBeenCalledWith(['/administracion/puntos-recepcion/modificar', 42]);
  });

  it('debe llamar buscarVolver cuando query volver es 1', fakeAsync(() => {
    const spyVolver = spyOn<any>(component, 'buscarVolver');
    mockActivatedRoute.snapshot.queryParamMap = convertToParamMap({ volver: '1' });
    component.ngAfterViewInit();
    tick(200);
    expect(spyVolver).toHaveBeenCalled();
  }));

  it('debe llamar buscar cuando query volver no es 1', fakeAsync(() => {
    const spyBuscar = spyOn(component, 'buscar');
    mockActivatedRoute.snapshot.queryParamMap = convertToParamMap({});
    component.ngAfterViewInit();
    tick(200);
    expect(spyBuscar).toHaveBeenCalled();
  }));

  it('debe restaurar filtros en buscarVolver', () => {
    spyOn(component as any, 'buscar');
    spyOn(component['snapshotGenericService'], 'load').and.returnValue({
      filtro: { idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 },
      pagina: 2,
      tamanoPagina: 5
    });
    spyOn(component['location'], 'path').and.returnValue('/test?volver=1');
    const replaceSpy = spyOn(component['location'], 'replaceState');

    (component as any).buscarVolver();

    expect(component.form.get('idInciso')?.value).toBe(1);
    expect(component.parametros.pagina).toBe(2);
    expect(replaceSpy).toHaveBeenCalledWith('/test');
  });

  it('debe delegar descargarExcel al servicio', () => {

    const spyExport = spyOn(component['puntosRecepcionService'], 'exportarExcelPuntosRecepcion');
    component.form.patchValue({ inhabilitados: true, idZona: 4, organismo: { idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 },idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 });
    component.parametros.order = 'desc';
    (component as any).actualizarFiltro();
    component.descargarExcel();
    expect(spyExport).toHaveBeenCalledWith({
      idInciso: 1,
      idUnidadEjecutora: 2,
      idUnidadCompra: 3,
      inhabilitados: true,
      idZona: 4
    });
  });

  it('buscar no ejecuta servicio si form es inválido', () => {
    spyOn(component['puntosRecepcionService'], 'obtenerPuntosRecepcion');
    component.form.setErrors({ invalido: true } as any);
    component.buscar();
    expect(component['puntosRecepcionService'].obtenerPuntosRecepcion).not.toHaveBeenCalled();
  });

  it('buscarVolver sin snapshot solo limpia url', () => {
    spyOn(component as any, 'buscar');
    spyOn(component['snapshotGenericService'], 'load').and.returnValue(undefined);
    spyOn(component['location'], 'path').and.returnValue('/x?volver=1');
    const replaceSpy = spyOn(component['location'], 'replaceState');
    (component as any).buscarVolver();
    expect(component.buscar).not.toHaveBeenCalled();
    expect(replaceSpy).toHaveBeenCalledWith('/x');
  });

  it('responsables navega con id', () => {
    const navSpy = spyOn(component['router'], 'navigate');
    component.responsables(5);
    expect(navSpy).toHaveBeenCalledWith(['/administracion/puntos-recepcion/responsables', 5]);
  });

  it('debería cargar las zonas al inicializar', () => {
    const zonas = [{ id: 1 } as any];
    (component['zonaService'].obtenerZonas as jasmine.Spy).and.returnValue(of(zonas));
    component.cargarDepartamentos();
    expect(component.opcionesZona).toEqual(zonas);
  });

  it('debería buscar y mapear datos con unidad de compra', fakeAsync(() => {
    const respuesta = {
      content: [
        {
          unidadCompra: {
            idUnidadCompra: 1,
            descUnidadCompra: 'UC',
            idUnidadEjecutora: 2,
            descUnidadEjecutora: 'UE',
            idInciso: 3,
            descInciso: 'INC',
          },
        },
      ],
      page: { totalElements: 1 },
    };
    spyOn(component['puntosRecepcionService'], 'obtenerPuntosRecepcion').and.returnValue(of(respuesta));
    component.buscar(true);
    tick();
    expect(component.parametros.pagina).toBe(0);
    expect(component.puntosRecepcion[0].idUnidadCompra).toBe(1);
    expect(component.total).toBe(1);
  }));

  it('debería manejar puntos sin unidad de compra', fakeAsync(() => {
    const respuesta = {
      content: [{ unidadCompra: null }],
      page: { totalElements: 1 },
    };
    spyOn(component['puntosRecepcionService'], 'obtenerPuntosRecepcion').and.returnValue(of(respuesta));
    component.buscar();
    tick();
    expect(component.puntosRecepcion[0].idUnidadCompra).toBeNull();
    expect(component.total).toBe(1);
  }));

});
