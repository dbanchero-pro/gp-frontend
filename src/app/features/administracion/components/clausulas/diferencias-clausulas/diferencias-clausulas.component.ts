import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FechaPipe } from '../../../../../shared/pipes/fecha.pipe';
import { forkJoin } from 'rxjs';
import { Clausula } from 'src/app/shared/models/pliego/clausula.model';
import { ClausulaService } from '../../../services/clausula.service';

interface DiferenciaAtributo {
  nombre: string;
  valorActual: string;
  valorAnterior: string;
  cambiado: boolean;
}

interface DiferenciaRedaccion {
  prioridad: number;
  redaccionActual: string;
  redaccionAnterior: string;
  cambiada: boolean;
  nueva: boolean;
  eliminada: boolean;
}

@Component({
  selector: 'app-diferencias-clausulas',
  templateUrl: './diferencias-clausulas.component.html',
  styleUrls: ['./diferencias-clausulas.component.scss'],
  standalone: false
})
export class DiferenciasClausulasComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clausulaService = inject(ClausulaService);
  private fechaPipe = inject(FechaPipe);

  clausulaId: number | null = null;
  versionActual: Clausula | null = null;
  versionAnterior: Clausula | null = null;
  cargando = false;
  errorCarga = false;
  mensajeError = '';

  diferenciasAtributos: DiferenciaAtributo[] = [];
  diferenciasRedacciones: DiferenciaRedaccion[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clausulaId = parseInt(id, 10);
      this.cargarDiferencias();
    }
  }

  cargarDiferencias(): void {
    if (!this.clausulaId) {
      return;
    }

    this.cargando = true;
    this.errorCarga = false;

    forkJoin({
      actual: this.clausulaService.obtenerClausula(this.clausulaId),
      anterior: this.clausulaService.obtenerVersionAnterior(this.clausulaId)
    }).subscribe({
      next: ({ actual, anterior }) => {
        this.versionActual = actual || null;
        this.versionAnterior = anterior;

        if (!this.versionActual) {
          this.errorCarga = true;
          this.mensajeError = 'No se encontró la cláusula seleccionada.';
        } else if (!this.versionAnterior) {
          this.errorCarga = true;
          this.mensajeError = 'No existe una versión anterior para comparar.';
        } else {
          this.calcularDiferencias();
        }

        this.cargando = false;
      },
      error: () => {
        this.errorCarga = true;
        this.mensajeError = 'Ocurrió un error al cargar las versiones de la cláusula.';
        this.cargando = false;
      }
    });
  }

  calcularDiferencias(): void {
    if (!this.versionActual || !this.versionAnterior) {
      return;
    }

    this.diferenciasAtributos = [];

    const fechaVigenciaDesdeActual = this.versionActual.fechaVigenciaDesde
      ? this.fechaPipe.transform(this.versionActual.fechaVigenciaDesde)
      : 'Sin definir';
    const fechaVigenciaDesdeAnterior = this.versionAnterior.fechaVigenciaDesde
      ? this.fechaPipe.transform(this.versionAnterior.fechaVigenciaDesde)
      : 'Sin definir';

    this.diferenciasAtributos.push({
      nombre: 'Fecha vigencia desde',
      valorActual: fechaVigenciaDesdeActual,
      valorAnterior: fechaVigenciaDesdeAnterior,
      cambiado: this.versionActual.fechaVigenciaDesde !== this.versionAnterior.fechaVigenciaDesde
    });

    const fechaVigenciaHastaActual = this.versionActual.fechaVigenciaHasta
      ? this.fechaPipe.transform(this.versionActual.fechaVigenciaHasta)
      : 'Sin definir';
    const fechaVigenciaHastaAnterior = this.versionAnterior.fechaVigenciaHasta
      ? this.fechaPipe.transform(this.versionAnterior.fechaVigenciaHasta)
      : 'Sin definir';

    this.diferenciasAtributos.push({
      nombre: 'Fecha vigencia hasta',
      valorActual: fechaVigenciaHastaActual,
      valorAnterior: fechaVigenciaHastaAnterior,
      cambiado: this.versionActual.fechaVigenciaHasta !== this.versionAnterior.fechaVigenciaHasta
    });

    this.diferenciasAtributos.push({
      nombre: 'Apertura electrónica',
      valorActual: this.versionActual.aperturaElectronica ? 'Sí' : 'No',
      valorAnterior: this.versionAnterior.aperturaElectronica ? 'Sí' : 'No',
      cambiado: this.versionActual.aperturaElectronica !== this.versionAnterior.aperturaElectronica
    });

    const tiposCompraActual = this.obtenerResumenTiposCompra(this.versionActual);
    const tiposCompraAnterior = this.obtenerResumenTiposCompra(this.versionAnterior);
    this.diferenciasAtributos.push({
      nombre: 'Tipos de compra',
      valorActual: tiposCompraActual,
      valorAnterior: tiposCompraAnterior,
      cambiado: tiposCompraActual !== tiposCompraAnterior
    });

    const objetosCompraActual = this.obtenerResumenObjetosCompra(this.versionActual);
    const objetosCompraAnterior = this.obtenerResumenObjetosCompra(this.versionAnterior);
    this.diferenciasAtributos.push({
      nombre: 'Objetos de compra',
      valorActual: objetosCompraActual,
      valorAnterior: objetosCompraAnterior,
      cambiado: objetosCompraActual !== objetosCompraAnterior
    });

    const incisosActual = this.obtenerResumenIncisos(this.versionActual);
    const incisosAnterior = this.obtenerResumenIncisos(this.versionAnterior);
    this.diferenciasAtributos.push({
      nombre: 'Organismos',
      valorActual: incisosActual,
      valorAnterior: incisosAnterior,
      cambiado: incisosActual !== incisosAnterior
    });

    this.calcularDiferenciasRedacciones();
  }

  calcularDiferenciasRedacciones(): void {
    if (!this.versionActual || !this.versionAnterior) {
      return;
    }

    this.diferenciasRedacciones = [];

    const prioridadesActuales = this.versionActual.redacciones.map(r => r.prioridad);
    const prioridadesAnteriores = this.versionAnterior.redacciones.map(r => r.prioridad);
    const todasPrioridades = Array.from(new Set([...prioridadesActuales, ...prioridadesAnteriores])).sort((a, b) => a - b);

    for (const prioridad of todasPrioridades) {
      const redaccionActual = this.versionActual.redacciones.find(r => r.prioridad === prioridad);
      const redaccionAnterior = this.versionAnterior.redacciones.find(r => r.prioridad === prioridad);

      const nueva = !!redaccionActual && !redaccionAnterior;
      const eliminada = !redaccionActual && !!redaccionAnterior;
      const cambiada = redaccionActual && redaccionAnterior && redaccionActual.redaccion !== redaccionAnterior.redaccion;

      this.diferenciasRedacciones.push({
        prioridad,
        redaccionActual: redaccionActual?.redaccion || '',
        redaccionAnterior: redaccionAnterior?.redaccion || '',
        cambiada: cambiada || false,
        nueva,
        eliminada
      });
    }
  }

  obtenerResumenTiposCompra(clausula: Clausula): string {
    return clausula.tiposCompra
      .map(tc => {
        const subtipos = tc.subtipos.map(st => st.subtipoCompraDescripcion).join(', ');
        return `${tc.tipoCompraDescripcion} | ${subtipos}`;
      })
      .join(' • ');
  }

  obtenerResumenObjetosCompra(clausula: Clausula): string {
    return clausula.objetosCompra
      .map(oc => {
        const partes = [oc.familiaDescripcion];
        if (oc.subfamiliaDescripcion) partes.push(oc.subfamiliaDescripcion);
        if (oc.claseDescripcion) partes.push(oc.claseDescripcion);
        if (oc.subclaseDescripcion) partes.push(oc.subclaseDescripcion);

        let resultado = partes.join(' | ');

        if (oc.articulo) {
          resultado += ` | ${oc.articulo.articuloDescripcion} (${oc.articulo.articuloCodigo})`;
        }

        return resultado;
      })
      .join(' • ');
  }

  obtenerResumenIncisos(clausula: Clausula): string {
    return clausula.incisos
      .map(i => {
        const inciso = `${i.incisoCodigo} - ${i.incisoDescripcion}`;
        if (i.unidadEjecutora) {
          return `${inciso} | ${i.unidadEjecutora.unidadEjecutoraCodigo} - ${i.unidadEjecutora.unidadEjecutoraDescripcion}`;
        }
        return inciso;
      })
      .join(' • ');
  }

  hayDiferencias(): boolean {
    const hayCambiosAtributos = this.diferenciasAtributos.some(d => d.cambiado);
    const hayCambiosRedacciones = this.diferenciasRedacciones.some(d => d.cambiada || d.nueva || d.eliminada);
    return hayCambiosAtributos || hayCambiosRedacciones;
  }

  volver(): void {
    this.router.navigate(['/pliegos/clausulas'], { queryParams: { volver: 1 } });
  }
}
