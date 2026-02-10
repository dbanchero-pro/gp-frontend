import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClausulaSeccion, Seccion } from '../../../models/seccion.model';
import { FiltroSeccion } from '../../../models/filtro-seccion.model';
import { SeccionService } from '../../../services/seccion.service';
import { AccionBoton } from '../../../../../shared/models/common/accion-boton.model';
import { IColumnaOrden } from '../../../../../shared/models/common/columna-orden.model';
import { FechaPipe } from '../../../../../shared/pipes/fecha.pipe';
import { ActualizarService } from '../../../../../shared/services/common/actualizar.service';
import { SnapshotGenericService } from '../../../../../shared/services/common/snapshot-generic.service';
import { ClausulaCapitulo } from '../../../models/capitulo.model';

@Component({
  selector: 'app-consulta-secciones',
  templateUrl: './consulta-secciones.component.html',
  styleUrls: ['./consulta-secciones.component.scss'],
  standalone: false
})
export class ConsultaSeccionesComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private seccionService = inject(SeccionService);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fechaPipe = inject(FechaPipe);
  private actualizarService = inject(ActualizarService);
  private snapshotGenericService = inject(SnapshotGenericService);

  formularioFiltro: FormGroup;
  secciones: Seccion[] = [];
  cargando = false;
  mostrarSoloSeleccion = false;

  colFiltro = 'col-lg-3';
  colTabla = 'col-lg-9';

  total = -1;
  parametros = {
    pagina: 0,
    tamanoPagina: 10,
    sort: 'denominacion',
    order: 'asc' as 'asc' | 'desc'
  };

  listaOrden: IColumnaOrden[] = [
    { id: 'denominacion', nombre: 'Denominación' },
    { id: 'estado', nombre: 'Estado' },
  ];

  public static readonly SNAPSHOT_KEY = 'CONSULTA_SECCIONES';

  constructor() {
    this.formularioFiltro = this.fb.nonNullable.group({
      denominacion: [''],
      rangoFechasVigencia: [null]
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const paramVolver = this.route.snapshot.queryParamMap.get('volver');
    if (paramVolver === '1') {
      setTimeout(() => {
        this.buscarVolver();
      }, 100);
    } else {
      setTimeout(() => {
        this.nuevaConsulta();
      }, 100);
    }
  }

  private buscarVolver(): void {
    const snap = this.snapshotGenericService.load<any>(ConsultaSeccionesComponent.SNAPSHOT_KEY);

    if (snap) {
      this.formularioFiltro.patchValue(snap.filtro);
      this.parametros.pagina = snap.pagina;
      this.parametros.tamanoPagina = snap.tamanoPagina;
      this.parametros.sort = snap.sort;
      this.parametros.order = snap.order;
      this.buscar();
    }

    const currentUrl = this.location.path().split('?')[0];
    this.location.replaceState(currentUrl);
  }

  buscar(): void {
    this.cargando = true;
    const valores = this.formularioFiltro.value;
    const rangoFechas = valores.rangoFechasVigencia;

    const filtro: FiltroSeccion = {
      ...valores,
      fechaVigenciaDesde: rangoFechas?.fechaDesde || null,
      fechaVigenciaHasta: rangoFechas?.fechaHasta || null,
      rangoFechasVigencia: undefined
    };

    this.snapshotGenericService.save(
      ConsultaSeccionesComponent.SNAPSHOT_KEY,
      {
        filtro: valores,
        pagina: this.parametros.pagina,
        tamanoPagina: this.parametros.tamanoPagina,
        sort: this.parametros.sort,
        order: this.parametros.order
      }
    );

    this.seccionService.buscarSecciones(filtro).subscribe({
      next: (secciones) => {
        this.secciones = secciones;
        this.total = secciones.length;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  actualizarFiltrosYBuscar(): void {
    this.parametros.pagina = 0;
    this.buscar();
  }

  nuevaConsulta(): void {
    this.formularioFiltro.reset();
    this.parametros.pagina = 0;
    this.parametros.tamanoPagina = 10;
    this.parametros.sort = 'denominacion';
    this.parametros.order = 'asc';
    this.secciones = [];
    this.total = -1;

    this.snapshotGenericService.clear(
      ConsultaSeccionesComponent.SNAPSHOT_KEY
    );
  }

  cambioPagina(pagina: number): void {
    this.parametros.pagina = pagina - 1;
    this.buscar();
  }

  cambioPorPagina(tamanoPagina: number): void {
    this.parametros.tamanoPagina = tamanoPagina;
    this.parametros.pagina = 0;
    this.buscar();
  }

  cambioOrden(orden: 'asc' | 'desc'): void {
    this.parametros.order = orden;
    this.buscar();
  }

  cambioColumnaOrden(columna: string): void {
    this.parametros.sort = columna;
    this.buscar();
  }

  obtenerAccionesSeccion(seccion: Seccion): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    acciones.push({
      nombre: 'Modificar',
      clase: 'btn btn-success',
      icono: 'fa fa-edit',
      ariaLabel: 'Modificar sección ' + seccion.denominacion,
      accion: () => this.modificarSeccion(seccion)
    });

    if (this.esBorrador(seccion)) {
      acciones.push({
        nombre: 'Eliminar borrador',
        clase: 'btn btn-success',
        icono: 'fa fa-trash',
        ariaLabel: 'Eliminar sección ' + seccion.denominacion,
        accion: () => this.eliminarSeccion(seccion)
      });
    }

    acciones.push({
      nombre: 'Ver historial',
      clase: 'btn btn-success',
      icono: 'fa fa-history',
      ariaLabel: 'Ver historial de sección ' + seccion.denominacion,
      accion: () => this.verHistorial(seccion)
    });

    acciones.push({
      nombre: 'Ver modelos',
      clase: 'btn btn-success',
      icono: 'fa fa-copy',
      ariaLabel: 'Ver modelos que usan la sección ' + seccion.denominacion,
      accion: () => this.verModelos(seccion)
    });

    return acciones;
  }

  obtenerAccionesClausula(clausula: ClausulaSeccion): AccionBoton[] {
      const acciones: AccionBoton[] = [];
  
      acciones.push({
        nombre: 'Ver',
        clase: 'btn btn-sm',
        icono: 'fa fa-eye',
        ariaLabel: `Ver redacciones de cláusula ${clausula.denominacion}`,
        //accion: () => this.eliminarClausula(clausula)
      });
  
      return acciones;
  }

  volver(): void {
    this.location.back();
  }

  agregarSeccion(): void {
    this.router.navigate(['/pliegos/secciones/agregar']);
  }

  modificarSeccion(seccion: Seccion): void {
    if (!seccion.id) {
      return;
    }
    this.router.navigate(['/pliegos/secciones/modificar', seccion.id]);
  }

  eliminarSeccion(seccion: Seccion): void {
    if (!seccion.id) {
      return;
    }

    const seccionId = seccion.id;
    const mensaje = `¿Está seguro que desea eliminar el borrador de la sección "${seccion.denominacion}"?`;

    this.actualizarService.confirmar(
      mensaje,
      () => {
        this.seccionService.eliminarSeccion(seccionId).subscribe({
          next: (response) => {
            if (response.exitoso) {
              this.actualizarService.mensajeCorrecto(response.mensaje);
              this.buscar();
            } else {
              this.actualizarService.mensajeError(response.mensaje);
            }
          },
          error: () => {
            this.actualizarService.mensajeError('Ocurrió un error al eliminar la sección.');
          }
        });
      });
  }

  verHistorial(seccion: Seccion): void {
    if (!seccion.id) {
      return;
    }
    this.router.navigate(['/pliegos/secciones/historial', seccion.id]);
  }

  verModelos(seccion: Seccion): void {
    console.log('Ver modelos de la sección:', seccion);
  }

  seleccionarSeccion(seccion: Seccion): void {
    console.log('Sección seleccionada:', seccion);
  }

  obtenerTextoVigencia(seccion: Seccion): string {
    const desde = seccion.fechaVigenciaDesde
      ? this.fechaPipe.transform(seccion.fechaVigenciaDesde)
      : ' ';
    const hasta = seccion.fechaVigenciaHasta
      ? this.fechaPipe.transform(seccion.fechaVigenciaHasta)
      : ' ';
    return `${desde} - ${hasta}`;
  }

  esBorrador(seccion: Seccion): boolean {
    return seccion.estado === 'BORRADOR';
  }

  esVigente(seccion: Seccion): boolean {
    return seccion.estado === 'VIGENTE';
  }

  obtenerEstadoVigencia(seccion: Seccion): string {
    if (seccion.estado === 'BORRADOR') {
      const hoy = new Date();
      const desde = seccion.fechaVigenciaDesde ? new Date(seccion.fechaVigenciaDesde) : null;
      const hasta = seccion.fechaVigenciaHasta ? new Date(seccion.fechaVigenciaHasta) : null;

      if (desde && hoy < desde) {
        return 'NO_VIGENTE';
      }
      if (hasta && hoy > hasta) {
        return 'NO_VIGENTE';
      }
      return 'VIGENTE';
    }
    return seccion.estado;
  }

  obtenerTextoEstadoVigencia(seccion: Seccion): string {
    const estado = this.obtenerEstadoVigencia(seccion);
    if (estado === 'VIGENTE') {
      return 'Vigente';
    }
    return 'No vigente';
  }
}
