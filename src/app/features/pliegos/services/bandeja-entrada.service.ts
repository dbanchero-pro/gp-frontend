import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ProcesoPliego } from '../models/proceso-pliego.model';
import { FiltroBandejaEntrada } from '../models/filtro-bandeja-entrada.model';
import { EstadoProcesoPliego } from '../enum/estado-proceso-pliego.enum';

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
    {
      id: 8,
      estado: EstadoProcesoPliego.CANCELADO,
      incisoDescripcion: 'Poder Legislativo',
      unidadEjecutoraDescripcion: 'Cámara de Senadores',
      unidadCompraDescripcion: 'Área de Compras',
      tipoCompraDescripcion: 'Contratación Directa',
      subtipoCompraDescripcion: 'Por excepción',
      numeroCompra: 9123,
      anioCompra: 2024,
      fechaPublicacion: undefined,
      fechaTopeRecepcionOfertas: undefined,
      vigente: false
    }
  ];

  constructor() { }

  buscarProcesos(filtro: FiltroBandejaEntrada): Observable<ProcesoPliego[]> {
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

      return ordenEstado[a.estado] - ordenEstado[b.estado];
    });

    return of(resultados).pipe(delay(500));
  }
}
