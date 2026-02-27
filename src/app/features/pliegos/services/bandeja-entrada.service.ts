import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { EstadoProcesoPliego } from '../enum/estado-proceso-pliego.enum';
import { PageModel } from '../../../shared/models/common/page/page.model';
import { PliegoDTO } from '../models/pliego.model';
import { TipoCompraDTO } from 'src/app/shared/models/sice/tipo-compra.model';
import { SubtipoCompraDTO } from 'src/app/shared/models/sice/subtipo-compra.model';
import { EstadoElemento } from 'src/app/shared/enum/estado-elemento.enum';
import { ModeloDTO } from 'src/app/shared/models/pliego/modelo/modelo.model';
import { UnidadEjecutoraDTO } from 'src/app/shared/models/sice/unidad-ejecutora.model';
import { SiNoAmbasValor } from 'src/app/shared/enum/si-no-ambas-valor.enum';
import { FiltroBandejaEntradaDTO } from '../models/filtros/filtro-bandeja-entrada.model';
import { CampoPliegoDTO } from '../models/campo-pliego.model';
import { IncisoDTO } from 'src/app/shared/models/sice/inciso.model';
import { UnidadCompraDTO } from 'src/app/shared/models/sice/unidad-compra.model';
import { UsuarioAsignadoDTO } from '../models/usuario-asignado.model';
import { UsuarioBusquedaDTO } from '../models/usuario-busqueda.model';

const CAMPO_PLIEGO_VACIO: CampoPliegoDTO = {
  id: 0,
  valorString: '',
  campo: {} as any,
  bloqueado: 'N'
};

const USUARIOS_ASIGNADOS_MOCK: UsuarioAsignadoDTO[] = [
  { id: 1, numeroDocumento: '1.234.567-8', nombre: 'Juan', apellido: 'Perez', roles: ['Editor Principal'] },
  { id: 2, numeroDocumento: '8.765.432-1', nombre: 'Maria', apellido: 'Gonzalez', roles: ['Editor', 'Validador'] },
  { id: 3, numeroDocumento: '1.122.334-4', nombre: 'Pedro', apellido: 'Rodriguez', roles: ['Aprobador'] },
  { id: 4, numeroDocumento: '5.566.778-8', nombre: 'Ana', apellido: 'Martinez', roles: ['Editor'] },
  { id: 5, numeroDocumento: '9.988.776-6', nombre: 'Luis', apellido: 'Fernandez', roles: ['Validador', 'Aprobador'] },
  { id: 6, numeroDocumento: '2.345.678-9', nombre: 'Carmen', apellido: 'Lopez', roles: ['Editor'] },
  { id: 7, numeroDocumento: '3.456.789-0', nombre: 'Roberto', apellido: 'Sanchez', roles: ['Validador'] },
  { id: 8, numeroDocumento: '4.567.890-1', nombre: 'Laura', apellido: 'Ramirez', roles: ['Editor', 'Validador'] }
];

const USUARIOS_BUSQUEDA_MOCK: UsuarioBusquedaDTO[] = [
  { id: 10, numeroDocumento: '1.234.567-8', nombre: 'Juan', apellido: 'Perez' },
  { id: 11, numeroDocumento: '8.765.432-1', nombre: 'Maria', apellido: 'Gonzalez' },
  { id: 12, numeroDocumento: '1.122.334-4', nombre: 'Pedro', apellido: 'Rodriguez' },
  { id: 13, numeroDocumento: '5.566.778-8', nombre: 'Ana', apellido: 'Martinez' },
  { id: 14, numeroDocumento: '9.988.776-6', nombre: 'Luis', apellido: 'Fernandez' },
  { id: 15, numeroDocumento: '2.233.445-5', nombre: 'Carolina', apellido: 'Lopez' },
  { id: 16, numeroDocumento: '6.677.889-9', nombre: 'Diego', apellido: 'Sanchez' },
  { id: 17, numeroDocumento: '3.344.556-6', nombre: 'Laura', apellido: 'Ramirez' },
  { id: 18, numeroDocumento: '7.788.990-0', nombre: 'Roberto', apellido: 'Torres' },
  { id: 19, numeroDocumento: '4.455.667-7', nombre: 'Sofia', apellido: 'Vega' },
  { id: 20, numeroDocumento: '2.345.678-9', nombre: 'Carlos', apellido: 'Mendez' },
  { id: 21, numeroDocumento: '3.456.789-0', nombre: 'Patricia', apellido: 'Silva' },
  { id: 22, numeroDocumento: '4.567.890-1', nombre: 'Fernando', apellido: 'Castro' },
  { id: 23, numeroDocumento: '5.678.901-2', nombre: 'Gabriela', apellido: 'Diaz' },
  { id: 24, numeroDocumento: '6.789.012-3', nombre: 'Andres', apellido: 'Morales' },
  { id: 25, numeroDocumento: '7.890.123-4', nombre: 'Valentina', apellido: 'Rojas' }
];

const crearModeloMock = (
  id: number,
  denominacion: string,
  estado: EstadoElemento,
  version: number
): ModeloDTO => ({
  id,
  denominacion,
  fechaVigenciaDesde: '2024-01-01',
  fechaVigenciaHasta: '2025-12-31',
  estado,
  version,
  secciones: [],
  tiposCompra: [],
  organismo: undefined,
  fechaCreacion: null,
  usuarioCreacion: null,
  fechaModificacion: null,
  usuarioModificacion: null
});

const crearUnidadEjecutoraMock = (
  incisoId: number,
  incisoDesc: string,
  unidadId: number,
  unidadDesc: string
): UnidadEjecutoraDTO =>
  new UnidadEjecutoraDTO(unidadId, { idInciso: incisoId, descInciso: incisoDesc }, unidadId, unidadDesc);

const crearPliegoMock = (
  id: number,
  estado: EstadoProcesoPliego,
  modelo: ModeloDTO,
  unidadEjecutora: UnidadEjecutoraDTO,
  subtipoCompra: SubtipoCompraDTO,
  numeroCompra: number,
  anioCompra: number,
  aperturaElectronica: SiNoAmbasValor,
  fechaPublicacion: Date | undefined,
  fechaTopeRecepcionOfertas: Date | undefined
): PliegoDTO => ({
  id,
  modelo,
  estado,
  unidadEjecutora,
  subtipoCompra,
  numeroCompra,
  anioCompra,
  aperturaElectronica,
  fechaPublicacion,
  fechaTopeRecepcionOfertas,
  version: 1,
  notas: [],
  campos: CAMPO_PLIEGO_VACIO,
  historial: []
});

@Injectable({
  providedIn: 'root'
})
export class BandejaEntradaService {
  private procesosMock: PliegoDTO[] = [
    crearPliegoMock(
      1,
      EstadoProcesoPliego.PENDIENTE,
      crearModeloMock(101, 'Proceso pendiente', EstadoElemento.VIGENTE, 1),
      crearUnidadEjecutoraMock(1, 'Poder Ejecutivo', 1, 'Ministerio de Economia'),
      new SubtipoCompraDTO('1', '1', 'Nacional', 'Licitacion Publica'),
      2023,
      2024,
      SiNoAmbasValor.SI,
      undefined,
      undefined
    ),
    crearPliegoMock(
      2,
      EstadoProcesoPliego.ASIGNADO,
      crearModeloMock(102, 'Proceso asignado', EstadoElemento.VIGENTE, 1),
      crearUnidadEjecutoraMock(1, 'Poder Ejecutivo', 2, 'Ministerio de Salud'),
      new SubtipoCompraDTO('2', '3', 'Por excepcion', 'Contratacion Directa'),
      3045,
      2024,
      SiNoAmbasValor.SI,
      undefined,
      undefined
    ),
    crearPliegoMock(
      3,
      EstadoProcesoPliego.EN_PROCESO,
      crearModeloMock(103, 'Proceso en elaboracion', EstadoElemento.VIGENTE, 1),
      crearUnidadEjecutoraMock(2, 'Poder Legislativo', 3, 'Camara de Diputados'),
      new SubtipoCompraDTO('3', '1', 'Menor cuantia', 'Licitacion Abreviada'),
      4567,
      2024,
      SiNoAmbasValor.SI,
      undefined,
      undefined
    ),
    crearPliegoMock(
      4,
      EstadoProcesoPliego.PENDIENTE_VALIDACION,
      crearModeloMock(104, 'Proceso en validacion', EstadoElemento.VIGENTE, 1),
      crearUnidadEjecutoraMock(1, 'Poder Ejecutivo', 4, 'Ministerio de Educacion'),
      new SubtipoCompraDTO('1', '2', 'Internacional', 'Licitacion Publica'),
      5890,
      2024,
      SiNoAmbasValor.SI,
      undefined,
      undefined
    ),
    crearPliegoMock(
      5,
      EstadoProcesoPliego.PENDIENTE_APROBACION,
      crearModeloMock(105, 'Proceso pendiente aprobacion', EstadoElemento.VIGENTE, 1),
      crearUnidadEjecutoraMock(3, 'Poder Judicial', 5, 'Suprema Corte de Justicia'),
      new SubtipoCompraDTO('1', '1', 'Nacional', 'Licitacion Publica'),
      6712,
      2024,
      SiNoAmbasValor.SI,
      undefined,
      undefined
    ),
    crearPliegoMock(
      6,
      EstadoProcesoPliego.APROBADO,
      crearModeloMock(106, 'Proceso aprobado', EstadoElemento.VIGENTE, 1),
      crearUnidadEjecutoraMock(1, 'Poder Ejecutivo', 6, 'Ministerio de Obras Publicas'),
      new SubtipoCompraDTO('1', '1', 'Nacional', 'Licitacion Publica'),
      7834,
      2024,
      SiNoAmbasValor.SI,
      new Date('2024-11-15'),
      new Date('2024-12-20')
    ),
    crearPliegoMock(
      7,
      EstadoProcesoPliego.PUBLICADO,
      crearModeloMock(107, 'Proceso publicado', EstadoElemento.VIGENTE, 1),
      crearUnidadEjecutoraMock(1, 'Poder Ejecutivo', 7, 'Ministerio de Transporte'),
      new SubtipoCompraDTO('3', '1', 'Menor cuantia', 'Licitacion Abreviada'),
      8901,
      2024,
      SiNoAmbasValor.SI,
      new Date('2024-10-01'),
      new Date('2026-12-15')
    )
  ];

  private pliegosBaseMock: PliegoDTO[] = [
    crearPliegoMock(
      101,
      EstadoProcesoPliego.EN_PROCESO,
      crearModeloMock(1, 'Modelo de Licitacion Publica Nacional', EstadoElemento.BORRADOR, 1),
      crearUnidadEjecutoraMock(1, 'Poder Ejecutivo', 1, 'Ministerio de Economia'),
      new SubtipoCompraDTO('1', '1', 'Nacional', 'Licitacion Publica'),
      1234,
      2024,
      SiNoAmbasValor.SI,
      new Date('2024-01-15'),
      undefined
    ),
    crearPliegoMock(
      102,
      EstadoProcesoPliego.EN_PROCESO,
      crearModeloMock(2, 'Modelo de Contratacion Directa', EstadoElemento.BORRADOR, 1),
      crearUnidadEjecutoraMock(1, 'Poder Ejecutivo', 2, 'Ministerio de Salud'),
      new SubtipoCompraDTO('2', '3', 'Por excepcion', 'Contratacion Directa'),
      5678,
      2024,
      SiNoAmbasValor.NO,
      new Date('2024-02-20'),
      undefined
    ),
    crearPliegoMock(
      103,
      EstadoProcesoPliego.EN_PROCESO,
      crearModeloMock(3, 'Modelo Borrador - Obras Publicas', EstadoElemento.BORRADOR, 1),
      crearUnidadEjecutoraMock(2, 'Poder Legislativo', 3, 'Camara de Diputados'),
      new SubtipoCompraDTO('3', '1', 'Menor cuantia', 'Licitacion Abreviada'),
      9012,
      2024,
      SiNoAmbasValor.A,
      new Date('2024-03-10'),
      undefined
    ),
    crearPliegoMock(
      104,
      EstadoProcesoPliego.PENDIENTE,
      crearModeloMock(4, 'Modelo de Licitacion Publica Internacional', EstadoElemento.BORRADOR, 1),
      crearUnidadEjecutoraMock(1, 'Poder Ejecutivo', 4, 'Ministerio de Educacion'),
      new SubtipoCompraDTO('1', '2', 'Internacional', 'Licitacion Publica'),
      3456,
      2024,
      SiNoAmbasValor.SI,
      new Date('2024-04-05'),
      undefined
    ),
    crearPliegoMock(
      105,
      EstadoProcesoPliego.PENDIENTE,
      crearModeloMock(5, 'Modelo de Licitacion Publica Nacional', EstadoElemento.BORRADOR, 1),
      crearUnidadEjecutoraMock(3, 'Poder Judicial', 5, 'Suprema Corte de Justicia'),
      new SubtipoCompraDTO('1', '1', 'Nacional', 'Licitacion Publica'),
      7890,
      2024,
      SiNoAmbasValor.NO,
      new Date('2024-05-12'),
      undefined
    )
  ];

  private readonly incisosMock: IncisoDTO[] = [
    new IncisoDTO(1, 'Poder Ejecutivo'),
    new IncisoDTO(2, 'Poder Legislativo'),
    new IncisoDTO(3, 'Poder Judicial')
  ];

  private readonly unidadesEjecutorasFiltroMock: UnidadEjecutoraDTO[] = [
    new UnidadEjecutoraDTO(1, new IncisoDTO(1, 'Poder Ejecutivo'), 1, 'Ministerio de Economia'),
    new UnidadEjecutoraDTO(2, new IncisoDTO(1, 'Poder Ejecutivo'), 3, 'Ministerio de Salud'),
    new UnidadEjecutoraDTO(3, new IncisoDTO(2, 'Poder Legislativo'), 2, 'Camara de Diputados'),
    new UnidadEjecutoraDTO(4, new IncisoDTO(3, 'Poder Judicial'), 4, 'Suprema Corte de Justicia')
  ];

  private readonly unidadesCompraFiltroMock: UnidadCompraDTO[] = [
    new UnidadCompraDTO(1, this.unidadesEjecutorasFiltroMock[0], 'Direccion de Compras'),
    new UnidadCompraDTO(2, this.unidadesEjecutorasFiltroMock[1], 'Unidad de Compras Medicas'),
    new UnidadCompraDTO(3, this.unidadesEjecutorasFiltroMock[2], 'Departamento de Adquisiciones'),
    new UnidadCompraDTO(4, this.unidadesEjecutorasFiltroMock[3], 'Oficina de Compras')
  ];

  private readonly tiposCompraFiltroMock: TipoCompraDTO[] = [
    new TipoCompraDTO('1', 'Licitacion Publica'),
    new TipoCompraDTO('2', 'Contratacion Directa'),
    new TipoCompraDTO('3', 'Licitacion Abreviada')
  ];

  obtenerUsuariosAsignadosPorProceso(_procesoId: number): Observable<UsuarioAsignadoDTO[]> {
    return of([...USUARIOS_ASIGNADOS_MOCK]).pipe(delay(300));
  }

  buscarUsuariosParaAsignacion(texto: string, tipo: 'CI' | 'NOMBRE'): Observable<UsuarioBusquedaDTO[]> {
    const criterio = texto.toLowerCase().trim().replace(/[.\-]/g, '');
    if (!criterio) {
      return of([]);
    }

    const usuarios = USUARIOS_BUSQUEDA_MOCK.filter(usuario => {
      if (tipo === 'CI') {
        return usuario.numeroDocumento.replace(/[.\-]/g, '').includes(criterio);
      }
      return `${usuario.nombre} ${usuario.apellido}`.toLowerCase().includes(criterio);
    });

    return of(usuarios).pipe(delay(300));
  }

  obtenerFiltrosBandeja(): Observable<{
    incisos: IncisoDTO[];
    unidadesEjecutoras: UnidadEjecutoraDTO[];
    unidadesCompra: UnidadCompraDTO[];
    tiposCompra: TipoCompraDTO[];
  }> {
    return of({
      incisos: [...this.incisosMock],
      unidadesEjecutoras: [...this.unidadesEjecutorasFiltroMock],
      unidadesCompra: [...this.unidadesCompraFiltroMock],
      tiposCompra: [...this.tiposCompraFiltroMock]
    });
  }

  buscarProcesos(
    filtro: FiltroBandejaEntradaDTO,
    pagina: number,
    tamanoPagina: number,
    sort: string,
    order: 'asc' | 'desc'
  ): Observable<PageModel<PliegoDTO>> {
    let resultados = [...this.procesosMock];

    if (filtro.incisoId) {
      resultados = resultados.filter(p => p.unidadEjecutora?.inciso?.idInciso === filtro.incisoId);
    }

    if (filtro.unidadEjecutoraId) {
      resultados = resultados.filter(p => p.unidadEjecutora?.idUnidadEjecutora === filtro.unidadEjecutoraId);
    }

    if (filtro.numeroCompra) {
      resultados = resultados.filter(p => p.numeroCompra === filtro.numeroCompra);
    }

    if (filtro.anioCompra) {
      resultados = resultados.filter(p => p.anioCompra === filtro.anioCompra);
    }

    if (filtro.tipoCompraId) {
      resultados = resultados.filter(p => p.subtipoCompra?.idTipoCompra === filtro.tipoCompraId);
    }

    if (filtro.estado) {
      resultados = resultados.filter(p => p.estado === filtro.estado);
    }

    if (filtro.soloPublicadosVigentes) {
      resultados = resultados.filter(p => this.esPublicadoVigente(p));
    }

    resultados.sort((a, b) => {
      if (sort === 'estado') {
        const ordenEstado: Record<EstadoProcesoPliego, number> = {
          [EstadoProcesoPliego.PENDIENTE]: 1,
          [EstadoProcesoPliego.ASIGNADO]: 2,
          [EstadoProcesoPliego.EN_PROCESO]: 3,
          [EstadoProcesoPliego.PENDIENTE_VALIDACION]: 4,
          [EstadoProcesoPliego.PENDIENTE_APROBACION]: 5,
          [EstadoProcesoPliego.APROBADO]: 6,
          [EstadoProcesoPliego.PUBLICADO]: 7,
          [EstadoProcesoPliego.CANCELADO]: 8
        };

        const valorA = ordenEstado[a.estado];
        const valorB = ordenEstado[b.estado];
        return order === 'asc' ? valorA - valorB : valorB - valorA;
      }

      if (sort === 'numeroCompra') {
        return order === 'asc' ? a.numeroCompra - b.numeroCompra : b.numeroCompra - a.numeroCompra;
      }

      if (sort === 'tipoCompraDescripcion') {
        const valorA = a.subtipoCompra?.descTipoCompra ?? '';
        const valorB = b.subtipoCompra?.descTipoCompra ?? '';
        const comparacion = valorA.localeCompare(valorB);
        return order === 'asc' ? comparacion : -comparacion;
      }

      return 0;
    });

    const totalElements = resultados.length;
    const totalPages = Math.ceil(totalElements / tamanoPagina);
    const inicio = pagina * tamanoPagina;
    const fin = inicio + tamanoPagina;
    const contenidoPaginado = resultados.slice(inicio, fin);

    const page: PageModel<PliegoDTO> = {
      page: pagina,
      content: contenidoPaginado,
      totalPages,
      totalElements,
      last: pagina >= totalPages - 1,
      size: tamanoPagina,
      number: pagina,
      numberOfElements: contenidoPaginado.length,
      first: pagina === 0,
      sort: { sorted: true, unsorted: false, empty: false },
      empty: contenidoPaginado.length === 0
    };

    return of(page).pipe(delay(500));
  }

  obtenerProceso(id: number): Observable<PliegoDTO> {
    const proceso = this.procesosMock.find(p => p.id === id);
    if (!proceso) {
      throw new Error(`Proceso con id ${id} no encontrado`);
    }
    return of(proceso).pipe(delay(300));
  }

  asignarUsuarios(procesoId: number, usuariosConRoles: any[]): Observable<void> {
    console.log('Guardando usuarios para el proceso:', procesoId, usuariosConRoles);
    return of(void 0).pipe(delay(500));
  }

  asignarUsuariosYFinalizar(procesoId: number, usuariosConRoles: any[]): Observable<void> {
    console.log('Finalizando asignacion para el proceso:', procesoId, usuariosConRoles);
    const proceso = this.procesosMock.find(p => p.id === procesoId);
    if (proceso) {
      proceso.estado = EstadoProcesoPliego.ASIGNADO;
    }
    return of(void 0).pipe(delay(500));
  }

  buscarPliegos(
    tipoBusqueda: string,
    incisoId: number | null,
    unidadEjecutoraId: number | null,
    tipoCompraId: string | null,
    subtipoCompraId: string | null,
    denominacion: string | null
  ): Observable<PliegoDTO[]> {
    let resultados = [...this.pliegosBaseMock];

    if (tipoBusqueda === 'P') {
      resultados = resultados.filter(p => p.unidadEjecutora?.inciso?.idInciso === 1);
    } else if (tipoBusqueda === 'PO') {
      if (incisoId) {
        resultados = resultados.filter(p => p.unidadEjecutora?.inciso?.idInciso === incisoId);
      }

      if (unidadEjecutoraId) {
        resultados = resultados.filter(p => p.unidadEjecutora?.idUnidadEjecutora === unidadEjecutoraId);
      }
    }

    if (tipoCompraId) {
      resultados = resultados.filter(p => p.subtipoCompra?.idTipoCompra === tipoCompraId);

      if (subtipoCompraId) {
        resultados = resultados.filter(p => p.subtipoCompra?.idSubtipoCompra === subtipoCompraId);
      }
    }

    if (denominacion && denominacion.trim()) {
      const denominacionLower = denominacion.toLowerCase().trim();
      resultados = resultados.filter(p => (p.modelo?.denominacion ?? '').toLowerCase().includes(denominacionLower));
    }

    return of(resultados).pipe(delay(500));
  }

  private esPublicadoVigente(pliego: PliegoDTO): boolean {
    if (pliego.estado !== EstadoProcesoPliego.PUBLICADO) {
      return false;
    }
    if (!pliego.fechaTopeRecepcionOfertas) {
      return false;
    }
    return new Date(pliego.fechaTopeRecepcionOfertas) >= new Date();
  }

  private getTipoCompraById(id: string): TipoCompraDTO | undefined {
    const tipos: TipoCompraDTO[] = [
      { id: '1', descTipoCompra: 'Licitacion Publica' },
      { id: '2', descTipoCompra: 'Contratacion Directa' },
      { id: '3', descTipoCompra: 'Licitacion Abreviada' }
    ];
    return tipos.find(t => t.id === id);
  }
}


