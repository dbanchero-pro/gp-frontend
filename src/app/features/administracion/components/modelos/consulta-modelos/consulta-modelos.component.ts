import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { ModeloDTO } from 'src/app/shared/models/pliego/modelo/modelo.model';
import { ClausulaDTO } from 'src/app/shared/models/pliego/clausula/clausula.model';
import { FechaPipe } from 'src/app/shared/pipes/fecha.pipe';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { FiltroModelo } from '../../../models/filtros/filtro-modelo.model';
import { ModeloService } from '../../../services/modelo.service';
import { IIncisoDTO, IncisoDTO } from 'src/app/shared/models/sice/inciso.model';
import { IUnidadEjecutoraDTO } from 'src/app/shared/models/sice/unidad-ejecutora.model';
import { ITipoCompraDTO } from 'src/app/shared/models/sice/tipo-compra.model';
import { ISubtipoCompraDTO } from 'src/app/shared/models/sice/subtipo-compra.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
    selector: 'app-consulta-modelos',
    templateUrl: './consulta-modelos.component.html',
    styleUrls: ['./consulta-modelos.component.scss'],
    standalone: true,
    imports: [SharedModule],
})
export class ConsultaModelosComponent implements OnInit, AfterViewInit {
    private fb = inject(FormBuilder);
    private modeloService = inject(ModeloService);
    private location = inject(Location);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private fechaPipe = inject(FechaPipe);
    private actualizarService = inject(ActualizarService);
    private snapshotGenericService = inject(SnapshotGenericService);

    formularioFiltro: FormGroup;
    modelos: ModeloDTO[] = [];
    cargando = false;
    mostrarSoloSeleccion = false;

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

    incisos: IIncisoDTO[] = [
        { idInciso: 1, descInciso: 'Presidencia de la República' },
        { idInciso: 4, descInciso: 'Ministerio de Economía y Finanzas' },
        { idInciso: 10, descInciso: 'Ministerio de Obras Públicas' },
    ];

    unidadesEjecutoras: IUnidadEjecutoraDTO[] = [];
    unidadesEjecutorasCompletas: IUnidadEjecutoraDTO[] = [
        {
            idUnidadEjecutora: 1,
            descUnidadEjecutora: 'Unidad Central',
            inciso: { idInciso: 1 },
        },
        {
            idUnidadEjecutora: 5,
            descUnidadEjecutora: 'Unidad de Proyectos',
            inciso: { idInciso: 1 },
        },
        {
            idUnidadEjecutora: 2,
            descUnidadEjecutora: 'Dirección General',
            inciso: { idInciso: 2 },
        },
        {
            idUnidadEjecutora: 1,
            descUnidadEjecutora: 'Dirección de Obras',
            inciso: { idInciso: 3 },
        },
    ];

    tiposCompra: ITipoCompraDTO[] = [];
    subtiposCompra: ISubtipoCompraDTO[] = [];

    public static readonly SNAPSHOT_KEY = 'CONSULTA_MODELOS';

    constructor() {
        this.formularioFiltro = this.fb.nonNullable.group({
            incisoId: [null],
            unidadEjecutoraId: [null],
            tipoCompraId: [null],
            subtipoCompraId: [null],
            denominacion: [''],
            rangoFechasVigencia: [null],
        });
    }

    ngOnInit(): void {
        this.cargarTiposCompraMock();
        this.configurarCambioInciso();
        this.configurarCambioTipoCompra();
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

    private cargarTiposCompraMock(): void {
        this.tiposCompra = [
            { id: 'LP', descTipoCompra: 'Licitación Pública' },
            { id: 'CD', descTipoCompra: 'Contratación Directa' },
            { id: 'LA', descTipoCompra: 'Licitación Abreviada' },
        ];
    }

    private configurarCambioInciso(): void {
        this.formularioFiltro
            .get('incisoId')
            ?.valueChanges.subscribe((incisoId) => {
                this.formularioFiltro.patchValue(
                    {
                        unidadEjecutoraId: null,
                    },
                    { emitEvent: false },
                );

                if (incisoId) {
                    this.unidadesEjecutoras =
                        this.unidadesEjecutorasCompletas.filter(
                            (ue) => ue.inciso?.idInciso === incisoId,
                        );
                } else {
                    this.unidadesEjecutoras = [];
                }
            });
    }

    private configurarCambioTipoCompra(): void {
        this.formularioFiltro
            .get('tipoCompraId')
            ?.valueChanges.subscribe((tipoCompraId) => {
                this.formularioFiltro.patchValue(
                    {
                        subtipoCompraId: null,
                    },
                    { emitEvent: false },
                );

                if (tipoCompraId) {
                    this.cargarSubTiposCompraMock(tipoCompraId);
                } else {
                    this.subtiposCompra = [];
                }
            });
    }
    cargarSubTiposCompraMock(tipoCompraId: string): void {
        let subtipos: ISubtipoCompraDTO[] = [];
        if (tipoCompraId === 'LP') {
            subtipos = [
                {
                    idSubtipoCompra: 'NAC',
                    descSubtipoCompra: 'Nacional',
                    idTipoCompra: tipoCompraId,
                },
                {
                    idSubtipoCompra: 'INT',
                    descSubtipoCompra: 'Internacional',
                    idTipoCompra: tipoCompraId,
                },
            ];
        } else if (tipoCompraId === 'CD') {
            subtipos = [
                {
                    idSubtipoCompra: 'MON',
                    descSubtipoCompra: 'Por monto',
                    idTipoCompra: tipoCompraId,
                },
            ];
        } else if (tipoCompraId === 'LA') {
            subtipos = [];
        }
        this.subtiposCompra = subtipos || [];
    }

    private buscarVolver(): void {
        const snap = this.snapshotGenericService.load<any>(
            ConsultaModelosComponent.SNAPSHOT_KEY,
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

        const filtro: FiltroModelo = {
            incisoId: valores.incisoId || null,
            unidadEjecutoraId: valores.unidadEjecutoraId || null,
            tipoCompraId: valores.tipoCompraId || null,
            subtipoCompraId: valores.subtipoCompraId || null,
            denominacion: valores.denominacion || undefined,
            fechaVigenciaDesde: rangoFechas?.fechaDesde || null,
            fechaVigenciaHasta: rangoFechas?.fechaHasta || null,
        };

        this.snapshotGenericService.save(
            ConsultaModelosComponent.SNAPSHOT_KEY,
            {
                filtro: valores,
                pagina: this.parametros.pagina,
                tamanoPagina: this.parametros.tamanoPagina,
                sort: this.parametros.sort,
                order: this.parametros.order,
            },
        );

        this.modeloService.buscarModelos(filtro).subscribe({
            next: (modelos) => {
                this.modelos = modelos;
                this.total = modelos.length;
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
        this.modelos = [];
        this.total = -1;
        this.unidadesEjecutoras = [];
        this.subtiposCompra = [];

        this.snapshotGenericService.clear(
            ConsultaModelosComponent.SNAPSHOT_KEY,
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

    obtenerAccionesModelo(modelo: ModeloDTO): AccionBoton[] {
        const acciones: AccionBoton[] = [];

        acciones.push({
            nombre: 'Modificar',
            clase: 'btn btn-success',
            icono: 'fa fa-edit',
            ariaLabel: 'Modificar modelo ' + modelo.denominacion,
            accion: () => this.modificarModelo(modelo),
        });

        acciones.push({
            nombre: 'Ver diferencias',
            clase: 'btn btn-success',
            icono: 'fa fa-exchange',
            ariaLabel: 'Ver diferencias del modelo ' + modelo.denominacion,
            accion: () => this.verDiferencias(modelo),
        });

        if (this.esBorrador(modelo)) {
            acciones.push({
                nombre: 'Eliminar borrador',
                clase: 'btn btn-success',
                icono: 'fa fa-trash',
                ariaLabel: 'Eliminar modelo ' + modelo.denominacion,
                accion: () => this.eliminarModelo(modelo),
            });
        }

        acciones.push({
            nombre: 'Ver historial',
            clase: 'btn btn-success',
            icono: 'fa fa-history',
            ariaLabel: 'Ver historial de modelo ' + modelo.denominacion,
            accion: () => this.verHistorial(modelo),
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

    agregarModelo(): void {
        this.router.navigate(['/administracion/modelos/agregar']);
    }

    modificarModelo(modelo: ModeloDTO): void {
        if (!modelo.id) {
            return;
        }
        this.router.navigate(['/administracion/modelos/modificar', modelo.id]);
    }

    verDiferencias(modelo: ModeloDTO): void {
        console.log('Ver diferencias del modelo:', modelo);
        this.actualizarService.mensajeError('Funcionalidad en desarrollo');
    }

    eliminarModelo(modelo: ModeloDTO): void {
        if (!modelo.id) {
            return;
        }

        const modeloId = modelo.id;
        const mensaje =
            '¿Está seguro que desea eliminar el borrador del modelo "' +
            modelo.denominacion +
            '"?';

        this.actualizarService.confirmar(mensaje, () => {
            this.modeloService.eliminarModelo(modeloId).subscribe({
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
                        'Ocurrió un error al eliminar el modelo.',
                    );
                },
            });
        });
    }

    verHistorial(modelo: ModeloDTO): void {
        if (!modelo.id) {
            return;
        }
        this.router.navigate(['/administracion/modelos/historial', modelo.id]);
    }

    seleccionarModelo(modelo: ModeloDTO): void {
        console.log('Modelo seleccionado:', modelo);
    }

    obtenerTextoVigencia(modelo: ModeloDTO): string {
        const desde = modelo.fechaVigenciaDesde
            ? this.fechaPipe.transform(modelo.fechaVigenciaDesde)
            : ' ';
        const hasta = modelo.fechaVigenciaHasta
            ? this.fechaPipe.transform(modelo.fechaVigenciaHasta)
            : ' ';
        return desde + ' - ' + hasta;
    }

    esBorrador(modelo: ModeloDTO): boolean {
        return modelo.estado === 'BORRADOR';
    }

    esVigente(modelo: ModeloDTO): boolean {
        const hoy = new Date();
        const desde = modelo.fechaVigenciaDesde
            ? new Date(modelo.fechaVigenciaDesde)
            : null;
        const hasta = modelo.fechaVigenciaHasta
            ? new Date(modelo.fechaVigenciaHasta)
            : null;

        if (modelo.estado === 'BORRADOR') {
            return false;
        }

        if (desde && hoy < desde) {
            return false;
        }
        if (hasta && hoy > hasta) {
            return false;
        }
        return true;
    }

    obtenerEstadoVigencia(modelo: ModeloDTO): string {
        return this.esVigente(modelo) ? 'VIGENTE' : 'NO_VIGENTE';
    }

    obtenerTextoEstadoVigencia(modelo: ModeloDTO): string {
        return this.esVigente(modelo) ? 'Vigente' : 'No vigente';
    }

    truncarTexto(texto: string, limite: number = 500): string {
        if (!texto) return '';
        if (texto.length <= limite) return texto;
        return texto.substring(0, limite) + '...';
    }
}
