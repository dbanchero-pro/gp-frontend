import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { SeccionDTO } from 'src/app/shared/models/pliego/seccion/seccion.model';
import { ClausulaDTO } from 'src/app/shared/models/pliego/clausula/clausula.model';
import { ModeloSeccionDTO } from 'src/app/shared/models/pliego/modelo/modelo-seccion.model';
import { FechaPipe } from 'src/app/shared/pipes/fecha.pipe';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { FiltroSeccion } from '../../../models/filtros/filtro-seccion.model';
import { SeccionService } from '../../../services/seccion.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
    selector: 'app-consulta-secciones',
    templateUrl: './consulta-secciones.component.html',
    styleUrls: ['./consulta-secciones.component.scss'],
    standalone: true,
    imports: [SharedModule],
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
    secciones: SeccionDTO[] = [];
    cargando = false;
    mostrarSoloSeleccion = false;
    origenNavegacion: string | null = null;
    idModeloOrigen: string | null = null;

    colFiltro = 'col-lg-3';
    colTabla = 'col-lg-9';

    total = -1;
    parametros = {
        pagina: 0,
        tamanoPagina: 10,
        sort: 'denominacion',
        order: 'asc' as 'asc' | 'desc',
    };

    listaOrden: IColumnaOrden[] = [
        { id: 'denominacion', nombre: 'Denominación' },
        { id: 'estado', nombre: 'Estado' },
    ];

    public static readonly SNAPSHOT_KEY = 'CONSULTA_SECCIONES';

    constructor() {
        this.formularioFiltro = this.fb.nonNullable.group({
            denominacion: [''],
            rangoFechasVigencia: [null],
        });
    }

    ngOnInit(): void {
        this.origenNavegacion = this.route.snapshot.queryParamMap.get('origen');
        this.idModeloOrigen = this.route.snapshot.queryParamMap.get('idModelo');

        if (this.origenNavegacion === 'modelo') {
            this.mostrarSoloSeleccion = true;
        }
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
        const snap = this.snapshotGenericService.load<any>(
            ConsultaSeccionesComponent.SNAPSHOT_KEY,
        );

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
            rangoFechasVigencia: undefined,
        };

        this.snapshotGenericService.save(
            ConsultaSeccionesComponent.SNAPSHOT_KEY,
            {
                filtro: valores,
                pagina: this.parametros.pagina,
                tamanoPagina: this.parametros.tamanoPagina,
                sort: this.parametros.sort,
                order: this.parametros.order,
            },
        );

        this.seccionService.buscarSecciones(filtro).subscribe({
            next: (secciones) => {
                this.secciones = secciones;
                this.total = secciones.length;
                this.cargando = false;
            },
            error: () => {
                this.cargando = false;
            },
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
            ConsultaSeccionesComponent.SNAPSHOT_KEY,
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

    obtenerAccionesSeccion(seccion: SeccionDTO): AccionBoton[] {
        const acciones: AccionBoton[] = [];

        if (this.mostrarSoloSeleccion) {
            return acciones;
        }

        acciones.push({
            nombre: 'Modificar',
            clase: 'btn btn-success btn-ancho-fijo',
            icono: 'fa fa-edit',
            ariaLabel: 'Modificar sección ' + seccion.denominacion,
            accion: () => this.modificarSeccion(seccion),
        });

        if (this.esBorrador(seccion)) {
            acciones.push({
                nombre: 'Eliminar borrador',
                clase: 'btn btn-success',
                icono: 'fa fa-trash',
                ariaLabel: 'Eliminar sección ' + seccion.denominacion,
                accion: () => this.eliminarSeccion(seccion),
            });
        }

        acciones.push({
            nombre: 'Ver historial',
            clase: 'btn btn-success',
            icono: 'fa fa-history',
            ariaLabel: 'Ver historial de sección ' + seccion.denominacion,
            accion: () => this.verHistorial(seccion),
        });

        acciones.push({
            nombre: 'Ver modelos',
            clase: 'btn btn-success',
            icono: 'fa fa-list',
            ariaLabel:
                'Ver modelos que usan la sección ' + seccion.denominacion,
            accion: () => this.verModelos(seccion),
        });

        return acciones;
    }

    obtenerAccionesClausula(
        clausula: ClausulaDTO | null | undefined,
    ): AccionBoton[] {
        const acciones: AccionBoton[] = [];

        if (!clausula) {
            return acciones;
        }

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
        this.router.navigate(['/administracion/secciones/agregar']);
    }

    modificarSeccion(seccion: SeccionDTO): void {
        if (!seccion.id) {
            return;
        }
        this.router.navigate([
            '/administracion/secciones/modificar',
            seccion.id,
        ]);
    }

    eliminarSeccion(seccion: SeccionDTO): void {
        if (!seccion.id) {
            return;
        }

        const seccionId = seccion.id;
        const mensaje = `¿Está seguro que desea eliminar el borrador de la sección "${seccion.denominacion}"?`;

        this.actualizarService.confirmar(mensaje, () => {
            this.seccionService.eliminarSeccion(seccionId).subscribe({
                next: (response) => {
                    if (response.exitoso) {
                        this.actualizarService.mensajeCorrecto(
                            response.mensaje,
                        );
                        this.buscar();
                    } else {
                        this.actualizarService.mensajeError(response.mensaje);
                    }
                },
                error: () => {
                    this.actualizarService.mensajeError(
                        'Ocurrió un error al eliminar la sección.',
                    );
                },
            });
        });
    }

    verHistorial(seccion: SeccionDTO): void {
        if (!seccion.id) {
            return;
        }
        this.router.navigate([
            '/administracion/secciones/historial',
            seccion.id,
        ]);
    }

    verModelos(seccion: SeccionDTO): void {
        console.log('Ver modelos de la sección:', seccion);
    }

    seleccionarSeccion(seccion: SeccionDTO): void {
        if (this.origenNavegacion === 'modelo') {
            const seccionParaModelo: ModeloSeccionDTO = {
                id: 0,
                orden: 0,
                seccion: seccion,
            };

            if (this.idModeloOrigen && this.idModeloOrigen !== 'nuevo') {
                this.router.navigate(
                    ['/administracion/modelos/modificar', this.idModeloOrigen],
                    {
                        state: { seccionSeleccionada: seccionParaModelo },
                    },
                );
            } else {
                this.router.navigate(['/administracion/modelos/agregar'], {
                    state: { seccionSeleccionada: seccionParaModelo },
                });
            }
        } else {
            console.log('Sección seleccionada:', seccion);
        }
    }

    obtenerTextoVigencia(seccion: SeccionDTO): string {
        const desde = seccion.fechaVigenciaDesde
            ? this.fechaPipe.transform(seccion.fechaVigenciaDesde)
            : ' ';
        const hasta = seccion.fechaVigenciaHasta
            ? this.fechaPipe.transform(seccion.fechaVigenciaHasta)
            : ' ';
        return `${desde} - ${hasta}`;
    }

    esBorrador(seccion: SeccionDTO): boolean {
        return seccion.estado === 'BORRADOR';
    }

    esVigente(seccion: SeccionDTO): boolean {
        return seccion.estado === 'VIGENTE';
    }

    obtenerEstadoVigencia(seccion: SeccionDTO): string {
        if (seccion.estado === 'BORRADOR') {
            const hoy = new Date();
            const desde = seccion.fechaVigenciaDesde
                ? new Date(seccion.fechaVigenciaDesde)
                : null;
            const hasta = seccion.fechaVigenciaHasta
                ? new Date(seccion.fechaVigenciaHasta)
                : null;

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

    obtenerTextoEstadoVigencia(seccion: SeccionDTO): string {
        const estado = this.obtenerEstadoVigencia(seccion);
        if (estado === 'VIGENTE') {
            return 'Vigente';
        }
        return 'No vigente';
    }
}
