import { TestBed } from '@angular/core/testing';
import { ElaborarPliegoService } from './elaborar-pliego.service';

describe('ElaborarPliegoService', () => {
  let service: ElaborarPliegoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElaborarPliegoService);
  });

  it('debe devolver usuarios asignados mockeados', () => {
    const usuarios = service.obtenerUsuariosAsignadosMock();

    expect(usuarios.length).toBe(3);
    expect(usuarios[0].rol).toBe('Editor Principal');
  });

  it('debe devolver historial mockeado con fechas validas', () => {
    const historial = service.obtenerHistorialTareasMock();

    expect(historial.length).toBe(4);
    expect(historial.every((tarea) => tarea.fecha instanceof Date)).toBeTrue();
  });

  it('debe devolver secciones desacopladas entre llamadas', () => {
    const seccionesPrimeraLlamada = service.obtenerSeccionesMock();
    const seccionesSegundaLlamada = service.obtenerSeccionesMock();

    seccionesPrimeraLlamada[0].expandida = false;

    expect(seccionesSegundaLlamada[0].expandida).toBeTrue();
  });

  it('debe crear un pliego demo con los datos recibidos', () => {
    const pliego = service.crearPliegoDemo(
      44,
      'Poder Ejecutivo',
      'Ministerio de Economia',
      'Licitacion Publica',
      'Nacional',
      1234,
      2024
    );

    expect(pliego.id).toBe(44);
    expect(pliego.unidadEjecutora.inciso?.descInciso).toBe('Poder Ejecutivo');
    expect(pliego.unidadEjecutora.descUnidadEjecutora).toBe('Ministerio de Economia');
    expect(pliego.numeroCompra).toBe(1234);
    expect(pliego.anioCompra).toBe(2024);
  });
});
