import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ProcesoPliego } from '../models/proceso-pliego.model';
import { FiltroBandejaEntrada } from '../models/filtro-bandeja-entrada.model';
import { EstadoProcesoPliego } from '../enum/estado-proceso-pliego.enum';
import { PageModel } from '../../../shared/models/common/page/page.model';
import { PliegoBase } from '../models/pliego-base.model';

@Injectable({
  providedIn: 'root'
})
export class BandejaEntradaService {

  private procesosMock: ProcesoPliego[] = [
    {
      id: 1,
      estado: EstadoProcesoPliego.PENDIENTE,
      incisoDescripcion: 'Poder Ejecutivo',
      unidadEjecutoraDescripcion: 'Ministerio de Economía',
      unidadCompraDescripcion: 'Dirección de Compras',
      tipoCompraDescripcion: 'Licitación Pública',
      subtipoCompraDescripcion: 'Nacional',
      numeroCompra: 2023,
      anioCompra: 2024,
      fechaPublicacion: undefined,
      fechaTopeRecepcionOfertas: undefined,
      vigente: false
    },
    {
      id: 2,
      estado: EstadoProcesoPliego.ASIGNADO,
      incisoDescripcion: 'Poder Ejecutivo',
      unidadEjecutoraDescripcion: 'Ministerio de Salud',
      unidadCompraDescripcion: 'Unidad de Compras Médicas',
      tipoCompraDescripcion: 'Contratación Directa',
      subtipoCompraDescripcion: 'Por excepción',
      numeroCompra: 3045,
      anioCompra: 2024,
      fechaPublicacion: undefined,
      fechaTopeRecepcionOfertas: undefined,
      vigente: false
    },
    {
      id: 3,
      estado: EstadoProcesoPliego.EN_PROCESO,
      incisoDescripcion: 'Poder Legislativo',
      unidadEjecutoraDescripcion: 'Cámara de Diputados',
      unidadCompraDescripcion: 'Departamento de Adquisiciones',
      tipoCompraDescripcion: 'Licitación Abreviada',
      subtipoCompraDescripcion: 'Menor cuantía',
      numeroCompra: 4567,
      anioCompra: 2024,
      fechaPublicacion: undefined,
      fechaTopeRecepcionOfertas: undefined,
      vigente: false
    },
    {
      id: 4,
      estado: EstadoProcesoPliego.PENDIENTE_VALIDACION,
      incisoDescripcion: 'Poder Ejecutivo',
      unidadEjecutoraDescripcion: 'Ministerio de Educación',
      unidadCompraDescripcion: 'Dirección de Compras',
      tipoCompraDescripcion: 'Licitación Pública',
      subtipoCompraDescripcion: 'Internacional',
      numeroCompra: 5890,
      anioCompra: 2024,
      fechaPublicacion: undefined,
      fechaTopeRecepcionOfertas: undefined,
      vigente: false
    },
    {
      id: 5,
      estado: EstadoProcesoPliego.PENDIENTE_APROBACION,
      incisoDescripcion: 'Poder Judicial',
      unidadEjecutoraDescripcion: 'Suprema Corte de Justicia',
      unidadCompraDescripcion: 'Oficina de Compras',
      tipoCompraDescripcion: 'Licitación Pública',
      subtipoCompraDescripcion: 'Nacional',
      numeroCompra: 6712,
      anioCompra: 2024,
      fechaPublicacion: undefined,
      fechaTopeRecepcionOfertas: undefined,
      vigente: false
    },
    {
      id: 6,
      estado: EstadoProcesoPliego.APROBADO,
      incisoDescripcion: 'Poder Ejecutivo',
      unidadEjecutoraDescripcion: 'Ministerio de Obras Públicas',
      unidadCompraDescripcion: 'Unidad de Infraestructura',
      tipoCompraDescripcion: 'Licitación Pública',
      subtipoCompraDescripcion: 'Nacional',
      numeroCompra: 7834,
      anioCompra: 2024,
      fechaPublicacion: new Date('2024-11-15'),
      fechaTopeRecepcionOfertas: new Date('2024-12-20'),
      vigente: false
    },
    {
      id: 7,
      estado: EstadoProcesoPliego.PUBLICADO,
      incisoDescripcion: 'Poder Ejecutivo',
      unidadEjecutoraDescripcion: 'Ministerio de Transporte',
      unidadCompraDescripcion: 'Dirección de Logística',
      tipoCompraDescripcion: 'Licitación Abreviada',
      subtipoCompraDescripcion: 'Menor cuantía',
      numeroCompra: 8901,
      anioCompra: 2024,
      fechaPublicacion: new Date('2024-10-01'),
      fechaTopeRecepcionOfertas: new Date('2025-03-15'),
      vigente: true
    },
  ];

  constructor() { }

  buscarProcesos(
    filtro: FiltroBandejaEntrada,
    pagina: number,
    tamanoPagina: number,
    sort: string,
    order: 'asc' | 'desc'
  ): Observable<PageModel<ProcesoPliego>> {
    let resultados = [...this.procesosMock];

    if (filtro.incisoId) {
      resultados = resultados.filter(p => p.incisoDescripcion.includes('Ejecutivo'));
    }

    if (filtro.unidadEjecutoraId) {
      resultados = resultados.filter(p => p.unidadEjecutoraDescripcion !== '');
    }

    if (filtro.unidadCompraId) {
      resultados = resultados.filter(p => p.unidadCompraDescripcion !== '');
    }

    if (filtro.numeroCompra) {
      resultados = resultados.filter(p => p.numeroCompra === filtro.numeroCompra);
    }

    if (filtro.anioCompra) {
      resultados = resultados.filter(p => p.anioCompra === filtro.anioCompra);
    }

    if (filtro.tipoCompraId) {
      resultados = resultados.filter(p => p.tipoCompraDescripcion !== '');
    }

    if (filtro.estado) {
      resultados = resultados.filter(p => p.estado === filtro.estado);
    }

    if (filtro.soloPublicadosVigentes) {
      resultados = resultados.filter(p =>
        p.estado === EstadoProcesoPliego.PUBLICADO && p.vigente === true
      );
    }

    resultados.sort((a, b) => {
      if (sort === 'estado') {
        const ordenEstado: { [key in EstadoProcesoPliego]: number } = {
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
      } else if (sort === 'numeroCompra') {
        const valorA = a.numeroCompra;
        const valorB = b.numeroCompra;
        if (valorA < valorB) return order === 'asc' ? -1 : 1;
        if (valorA > valorB) return order === 'asc' ? 1 : -1;
        return 0;
      } else if (sort === 'tipoCompraDescripcion') {
        const valorA = a.tipoCompraDescripcion || '';
        const valorB = b.tipoCompraDescripcion || '';
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

    const page: PageModel<ProcesoPliego> = {
      page: pagina,
      content: contenidoPaginado,
      totalPages: totalPages,
      totalElements: totalElements,
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

  obtenerProceso(id: number): Observable<ProcesoPliego> {
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
    console.log('Finalizando asignación para el proceso:', procesoId, usuariosConRoles);
    const proceso = this.procesosMock.find(p => p.id === procesoId);
    if (proceso) {
      proceso.estado = EstadoProcesoPliego.ASIGNADO;
    }
    return of(void 0).pipe(delay(500));
  }

  private pliegosBaseMock: PliegoBase[] = [
    {
      id: 101,
      denominacionModelo: 'Modelo Estándar Licitación Pública Nacional',
      vigenciaModelo: '01/01/2024 - 31/12/2024',
      incisoDescripcion: 'Poder Ejecutivo',
      unidadEjecutoraDescripcion: 'Ministerio de Economía',
      tipoCompraDescripcion: 'Licitación Pública',
      subtipoCompraDescripcion: 'Nacional',
      numeroCompra: 1234,
      anioCompra: 2024,
      aperturaElectronica: 'SI',
      fechaPublicacion: new Date('2024-01-15')
    },
    {
      id: 102,
      denominacionModelo: 'Modelo Estándar Contratación Directa',
      vigenciaModelo: '01/06/2023 - 31/05/2024',
      incisoDescripcion: 'Poder Ejecutivo',
      unidadEjecutoraDescripcion: 'Ministerio de Salud',
      tipoCompraDescripcion: 'Contratación Directa',
      subtipoCompraDescripcion: 'Por excepción',
      numeroCompra: 5678,
      anioCompra: 2024,
      aperturaElectronica: 'NO',
      fechaPublicacion: new Date('2024-02-20')
    },
    {
      id: 103,
      denominacionModelo: 'Modelo Licitación Abreviada',
      vigenciaModelo: '15/03/2024 - 15/03/2025',
      incisoDescripcion: 'Poder Legislativo',
      unidadEjecutoraDescripcion: 'Cámara de Diputados',
      tipoCompraDescripcion: 'Licitación Abreviada',
      subtipoCompraDescripcion: 'Menor cuantía',
      numeroCompra: 9012,
      anioCompra: 2024,
      aperturaElectronica: 'AMBAS',
      fechaPublicacion: new Date('2024-03-10')
    },
    {
      id: 104,
      denominacionModelo: 'Modelo Internacional de Bienes',
      vigenciaModelo: '01/01/2024 - 31/12/2024',
      incisoDescripcion: 'Poder Ejecutivo',
      unidadEjecutoraDescripcion: 'Ministerio de Educación',
      tipoCompraDescripcion: 'Licitación Pública',
      subtipoCompraDescripcion: 'Internacional',
      numeroCompra: 3456,
      anioCompra: 2024,
      aperturaElectronica: 'SI',
      fechaPublicacion: new Date('2024-04-05')
    },
    {
      id: 105,
      denominacionModelo: 'Modelo Estándar Servicios Profesionales',
      vigenciaModelo: '01/07/2023 - 30/06/2024',
      incisoDescripcion: 'Poder Judicial',
      unidadEjecutoraDescripcion: 'Suprema Corte de Justicia',
      tipoCompraDescripcion: 'Licitación Pública',
      subtipoCompraDescripcion: 'Nacional',
      numeroCompra: 7890,
      anioCompra: 2024,
      aperturaElectronica: 'NO',
      fechaPublicacion: new Date('2024-05-12')
    },
    {
      id: 106,
      denominacionModelo: 'Modelo Obras Públicas',
      vigenciaModelo: '01/01/2024 - 31/12/2024',
      incisoDescripcion: 'Poder Ejecutivo',
      unidadEjecutoraDescripcion: 'Ministerio de Obras Públicas',
      tipoCompraDescripcion: 'Licitación Pública',
      subtipoCompraDescripcion: 'Nacional',
      numeroCompra: 2345,
      anioCompra: 2024,
      aperturaElectronica: 'AMBAS',
      fechaPublicacion: new Date('2024-06-18')
    },
    {
      id: 107,
      denominacionModelo: 'Modelo Transporte y Logística',
      vigenciaModelo: '01/09/2023 - 31/08/2024',
      incisoDescripcion: 'Poder Ejecutivo',
      unidadEjecutoraDescripcion: 'Ministerio de Transporte',
      tipoCompraDescripcion: 'Licitación Abreviada',
      subtipoCompraDescripcion: 'Menor cuantía',
      numeroCompra: 6789,
      anioCompra: 2024,
      aperturaElectronica: 'SI',
      fechaPublicacion: new Date('2024-07-22')
    },
    {
      id: 108,
      denominacionModelo: 'Modelo Tecnología e Informática',
      vigenciaModelo: '01/01/2024 - 31/12/2024',
      incisoDescripcion: 'Poder Ejecutivo',
      unidadEjecutoraDescripcion: 'Agencia de Gobierno Electrónico',
      tipoCompraDescripcion: 'Licitación Pública',
      subtipoCompraDescripcion: 'Nacional',
      numeroCompra: 4567,
      anioCompra: 2024,
      aperturaElectronica: 'AMBAS',
      fechaPublicacion: new Date('2024-08-30')
    }
  ];

  buscarPliegos(
    tipoBusqueda: string,
    incisoId: number | null,
    unidadEjecutoraId: number | null,
    tipoCompraId: number | null,
    subtipoCompraId: number | null,
    denominacion: string | null
  ): Observable<PliegoBase[]> {
    let resultados = [...this.pliegosBaseMock];

    // Filtrar según tipo de búsqueda
    if (tipoBusqueda === 'P') {
      // Pliegos de mi organismo (simular filtrado por organismo actual)
      resultados = resultados.filter(p => p.incisoDescripcion === 'Poder Ejecutivo');
    } else if (tipoBusqueda === 'PO') {
      // Pliegos de otros organismos
      // Si se selecciona un inciso específico, filtrar por él
      if (incisoId) {
        const incisoSeleccionado = this.getIncisoById(incisoId);
        if (incisoSeleccionado) {
          resultados = resultados.filter(p => p.incisoDescripcion === incisoSeleccionado.descripcion);
        }
      }

      // Si se selecciona una unidad ejecutora, filtrar por ella
      if (unidadEjecutoraId) {
        const ueSeleccionada = this.getUnidadEjecutoraById(unidadEjecutoraId);
        if (ueSeleccionada) {
          resultados = resultados.filter(p => p.unidadEjecutoraDescripcion === ueSeleccionada.descripcion);
        }
      }
    }

    // Aplicar otros filtros
    if (tipoCompraId) {
      const tipoSeleccionado = this.getTipoCompraById(tipoCompraId);
      if (tipoSeleccionado) {
        resultados = resultados.filter(p => p.tipoCompraDescripcion === tipoSeleccionado.descripcion);
      }
    }

    if (subtipoCompraId) {
      const subtipoSeleccionado = this.getSubtipoCompraById(subtipoCompraId);
      if (subtipoSeleccionado) {
        resultados = resultados.filter(p => p.subtipoCompraDescripcion === subtipoSeleccionado.descripcion);
      }
    }

    if (denominacion && denominacion.trim()) {
      const denominacionLower = denominacion.toLowerCase().trim();
      resultados = resultados.filter(p =>
        p.denominacionModelo.toLowerCase().includes(denominacionLower)
      );
    }

    return of(resultados).pipe(delay(500));
  }

  // Métodos auxiliares para simular búsquedas en catálogos
  private getIncisoById(id: number): { id: number; codigo: string; descripcion: string } | undefined {
    const incisos = [
      { id: 1, codigo: '02', descripcion: 'Presidencia de la República' },
      { id: 2, codigo: '04', descripcion: 'Ministerio de Economía y Finanzas' },
      { id: 3, codigo: '10', descripcion: 'Ministerio de Obras Públicas' }
    ];
    return incisos.find(i => i.id === id);
  }

  private getUnidadEjecutoraById(id: number): { id: number; descripcion: string } | undefined {
    const unidades = [
      { id: 1, descripcion: 'Unidad Central' },
      { id: 2, descripcion: 'Unidad de Proyectos' },
      { id: 5, descripcion: 'Dirección General' },
      { id: 10, descripcion: 'Dirección de Obras' }
    ];
    return unidades.find(u => u.id === id);
  }

  private getTipoCompraById(id: number): { id: number; descripcion: string } | undefined {
    const tipos = [
      { id: 1, descripcion: 'Licitación Pública' },
      { id: 2, descripcion: 'Contratación Directa' },
      { id: 3, descripcion: 'Licitación Abreviada' }
    ];
    return tipos.find(t => t.id === id);
  }

  private getSubtipoCompraById(id: number): { id: number; descripcion: string } | undefined {
    const subtipos = [
      { id: 1, descripcion: 'Nacional' },
      { id: 2, descripcion: 'Internacional' },
      { id: 3, descripcion: 'Por monto' }
    ];
    return subtipos.find(s => s.id === id);
  }
}
