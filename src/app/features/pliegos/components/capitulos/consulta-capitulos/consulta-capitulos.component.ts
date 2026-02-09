import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Capitulo } from '../../../models/capitulo.model';
import { FiltroCapitulo } from '../../../models/filtro-capitulo.model';
import { CapituloService } from '../../../services/capitulo.service';
import { AccionBoton } from '../../../../../shared/models/common/accion-boton.model';
import { IColumnaOrden } from '../../../../../shared/models/common/columna-orden.model';
import { FechaPipe } from '../../../../../shared/pipes/fecha.pipe';
import { ActualizarService } from '../../../../../shared/services/common/actualizar.service';
import { SnapshotGenericService } from '../../../../../shared/services/common/snapshot-generic.service';

@Component({
  selector: 'app-consulta-capitulos',
  templateUrl: './consulta-capitulos.component.html',
  styleUrls: ['./consulta-capitulos.component.scss'],
  standalone: false
})
export class ConsultaCapitulosComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private capituloService = inject(CapituloService);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fechaPipe = inject(FechaPipe);
  private actualizarService = inject(ActualizarService);
  private snapshotGenericService = inject(SnapshotGenericService);

  formularioFiltro: FormGroup;
  capitulos: Capitulo[] = [];
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
    { id: 'fechaVigenciaDesde', nombre: 'Fecha vigencia desde' },
    { id: 'fechaVigenciaHasta', nombre: 'Fecha vigencia hasta' }
  ];

  public static readonly SNAPSHOT_KEY = 'CONSULTA_CAPITULOS';

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
    const snap = this.snapshotGenericService.load<any>(ConsultaCapitulosComponent.SNAPSHOT_KEY);

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

    const filtro: FiltroCapitulo = {
      ...valores,
      fechaVigenciaDesde: rangoFechas?.fechaDesde || null,
      fechaVigenciaHasta: rangoFechas?.fechaHasta || null,
      rangoFechasVigencia: undefined
    };

    this.snapshotGenericService.save(
      ConsultaCapitulosComponent.SNAPSHOT_KEY,
      {
        filtro: valores,
        pagina: this.parametros.pagina,
        tamanoPagina: this.parametros.tamanoPagina,
        sort: this.parametros.sort,
        order: this.parametros.order
      }
    );

    this.capituloService.buscarCapitulos(filtro).subscribe({
      next: (capitulos) => {
        this.capitulos = capitulos;
        this.total = capitulos.length;
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
    this.capitulos = [];
    this.total = -1;

    this.snapshotGenericService.clear(
      ConsultaCapitulosComponent.SNAPSHOT_KEY
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

  obtenerAccionesCapitulo(capitulo: Capitulo): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    acciones.push({
      nombre: 'Modificar',
      clase: 'btn btn-success',
      icono: 'fa fa-edit',
      ariaLabel: 'Modificar capítulo ' + capitulo.denominacion,
      accion: () => this.modificarCapitulo(capitulo)
    });


    if (this.esBorrador(capitulo)) {
      acciones.push({
        nombre: 'Eliminar borrador',
        clase: 'btn btn-success',
        icono: 'fa fa-trash',
      ariaLabel: 'Eliminar capítulo ' + capitulo.denominacion,
      accion: () => this.eliminarCapitulo(capitulo)
      });
     }

    acciones.push({
      nombre: 'Ver historial',
      clase: 'btn btn-success',
      icono: 'fa fa-history',
      ariaLabel: 'Ver historial de capítulo ' + capitulo.denominacion,
      accion: () => this.verHistorial(capitulo)
    });

    acciones.push({
      nombre: 'Ver modelos',
      clase: 'btn btn-success',
      icono: 'fa fa-copy',
      ariaLabel: 'Ver modelos que usan el capítulo ' + capitulo.denominacion,
      accion: () => this.verModelos(capitulo)
    });

    return acciones;
  }

  volver(): void {
    this.location.back();
  }

  agregarCapitulo(): void {
    this.router.navigate(['/pliegos/capitulos/agregar']);
  }

  modificarCapitulo(capitulo: Capitulo): void {
    if (!capitulo.id) {
      return;
    }
    this.router.navigate(['/pliegos/capitulos/modificar', capitulo.id]);
  }

  eliminarCapitulo(capitulo: Capitulo): void {
    if (!capitulo.id) {
      return;
    }

    const capituloId = capitulo.id;
    const mensaje = `¿Está seguro que desea eliminar el borrador del capítulo "${capitulo.denominacion}"?`;

    this.actualizarService.confirmar(
      mensaje,
      () => {
        this.capituloService.eliminarCapitulo(capituloId).subscribe({
          next: (response) => {
            if (response.exitoso) {
              this.actualizarService.mensajeCorrecto(response.mensaje);
              this.buscar();
            } else {
              this.actualizarService.mensajeError(response.mensaje);
            }
          },
          error: () => {
            this.actualizarService.mensajeError('Ocurrió un error al eliminar el capítulo.');
          }
        });
      });
  }

  verHistorial(capitulo: Capitulo): void {
    if (!capitulo.id) {
      return;
    }
    this.router.navigate(['/pliegos/capitulos/historial', capitulo.id]);
  }

  verModelos(capitulo: Capitulo): void {
    console.log('Ver modelos del capítulo:', capitulo);
  }

  seleccionarCapitulo(capitulo: Capitulo): void {
    console.log('Capítulo seleccionado:', capitulo);
  }

  obtenerTextoVigencia(capitulo: Capitulo): string {
    const desde = capitulo.fechaVigenciaDesde
      ? this.fechaPipe.transform(capitulo.fechaVigenciaDesde)
      : 'N/A';
    const hasta = capitulo.fechaVigenciaHasta
      ? this.fechaPipe.transform(capitulo.fechaVigenciaHasta)
      : 'Indefinido';
    return `${desde} - ${hasta}`;
  }

  esBorrador(capitulo: Capitulo): boolean {
    return capitulo.estado === 'BORRADOR';
  }

  esVigente(capitulo: Capitulo): boolean {
    return capitulo.estado === 'VIGENTE';
  }

  obtenerEstadoVigencia(capitulo: Capitulo): string {
    if (capitulo.estado === 'BORRADOR') {
      const hoy = new Date();
      const desde = capitulo.fechaVigenciaDesde ? new Date(capitulo.fechaVigenciaDesde) : null;
      const hasta = capitulo.fechaVigenciaHasta ? new Date(capitulo.fechaVigenciaHasta) : null;

      if (desde && hoy < desde) {
        return 'NO_VIGENTE';
      }
      if (hasta && hoy > hasta) {
        return 'NO_VIGENTE';
      }
      return 'VIGENTE';
    }
    return capitulo.estado;
  }

  obtenerTextoEstadoVigencia(capitulo: Capitulo): string {
    const estado = this.obtenerEstadoVigencia(capitulo);
    if (estado === 'VIGENTE') {
      return 'Vigente';
    }
    return 'No vigente';
  }
}
