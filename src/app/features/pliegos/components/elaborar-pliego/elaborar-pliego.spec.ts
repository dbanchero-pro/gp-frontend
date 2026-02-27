import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { PliegoDTO } from '../../models/pliego.model';
import { ElaborarPliegoService } from '../../services/elaborar-pliego.service';
import { ElaborarPliegoComponent } from './elaborar-pliego';

describe('ElaborarPliegoComponent', () => {
  let component: ElaborarPliegoComponent;
  let elaborarPliegoServiceSpy: jasmine.SpyObj<ElaborarPliegoService>;

  const pliegoMock = {
    id: 1,
    modelo: {} as any,
    notas: [],
    estado: 'En proceso' as any,
    unidadEjecutora: { inciso: { descInciso: '' }, descUnidadEjecutora: '' } as any,
    subtipoCompra: { descTipoCompra: '', descSubtipoCompra: '' } as any,
    numeroCompra: 0,
    anioCompra: 0,
    aperturaElectronica: 'S' as any,
    version: 1,
    campos: { id: 0, valorString: '', campo: {} as any, bloqueado: 'N' },
    historial: []
  } as PliegoDTO;

  beforeEach(() => {
    const activatedRouteStub = {
      snapshot: { paramMap: convertToParamMap({}) },
      queryParams: of({})
    } as unknown as ActivatedRoute;

    const routerStub = {
      navigate: jasmine.createSpy('navigate')
    } as unknown as Router;

    const actualizarServiceStub = {
      mensajeCorrecto: jasmine.createSpy('mensajeCorrecto')
    } as unknown as ActualizarService;

    elaborarPliegoServiceSpy = jasmine.createSpyObj<ElaborarPliegoService>('ElaborarPliegoService', [
      'crearPliegoDemo',
      'obtenerUsuariosAsignadosMock',
      'obtenerHistorialTareasMock',
      'obtenerSeccionesMock'
    ]);

    elaborarPliegoServiceSpy.crearPliegoDemo.and.returnValue(pliegoMock);
    elaborarPliegoServiceSpy.obtenerUsuariosAsignadosMock.and.returnValue([]);
    elaborarPliegoServiceSpy.obtenerHistorialTareasMock.and.returnValue([]);
    elaborarPliegoServiceSpy.obtenerSeccionesMock.and.returnValue([]);

    component = new ElaborarPliegoComponent(
      activatedRouteStub,
      routerStub,
      actualizarServiceStub,
      elaborarPliegoServiceSpy
    );
  });

  it('debe inicializar datos desde el servicio en el constructor', () => {
    expect(elaborarPliegoServiceSpy.obtenerUsuariosAsignadosMock).toHaveBeenCalled();
    expect(elaborarPliegoServiceSpy.obtenerHistorialTareasMock).toHaveBeenCalled();
    expect(elaborarPliegoServiceSpy.obtenerSeccionesMock).toHaveBeenCalled();
    expect(elaborarPliegoServiceSpy.crearPliegoDemo).toHaveBeenCalledWith(0);
  });

  it('debe cargar el pliego usando el servicio', () => {
    component.cargarPliego(99);

    expect(elaborarPliegoServiceSpy.crearPliegoDemo).toHaveBeenCalledWith(
      99,
      'Poder Ejecutivo',
      'Ministerio de Economia',
      'Licitacion Publica',
      'Nacional',
      1234,
      2024
    );
    expect(component.pliego).toBe(pliegoMock);
  });
});
