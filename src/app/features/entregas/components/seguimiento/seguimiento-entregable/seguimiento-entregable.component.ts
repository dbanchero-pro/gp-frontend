import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { ItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { IOrdenCompraDTO } from 'src/app/features/entregas/models/orden-ompra.model';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { Logger } from 'src/app/shared/utils/logger';
import { EstadoEntregable } from '../../../enum/estado-entregable.enum';
import { ICodigoEntregableDTO } from '../../../models/codigo-entregable.model';
import { IEntregaDTO } from '../../../models/entrega.model';
import { IEntregableDTO } from '../../../models/entregable.model';
import { IFiltroEntregable } from '../../../models/filtros/filtro-entregable.model';
import { IRecepcionEntregasRequest } from '../../../models/recepcion-entrega-request-model';
import { EntregaService } from '../../../services/entrega.service';
import { EntregableService } from '../../../services/entregable.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { ConformidadTodosPopupComponent } from '../../conformidad/conformidad-todos-popup/conformidad-todos-popup.component';
import { RecepcionTodosPopupComponent } from '../../recepcion/recepcion-todos-popup/recepcion-todos-popup.component';
import { AgregarModificarEntregablePopupComponent } from '../agregar-modificar-entregable-popup/agregar-modificar-entregable-popup.component';


@Component({
    selector: 'app-seguimiento-entregable',
    templateUrl: './seguimiento-entregable.component.html',
    styleUrl: './seguimiento-entregable.component.scss',
    standalone: false
})
export class SeguimientoEntregableComponent extends PaginaBusquedaComponent<IFiltroEntregable> implements OnInit {


    tipoUsuario!: TipoUsuario;
    TipoUsuario = TipoUsuario;
    itemOrdenCompra!: ItemOrdenCompraDTO;
    ordenCompra!: IOrdenCompraDTO;
    recCol: boolean[] = [];
    confCol: boolean[] = [];
    EstadoEntregable = EstadoEntregable;
    entregablesItem: ICodigoEntregableDTO[] = [];
    entregables: IEntregableDTO[] = [];;
    idOrdenCompra!: number;
    idItemOrdenCompra!: number;
    idVariacion!: number;
    marcarTodos: boolean = false;
    hayItemsSeleccionados: boolean = false;
    tienePermisoRecepcion: boolean = false;

    static readonly SNAPSHOT_KEY = 'SeguimientoEntregableItem.FILTRO';

    override listaOrden: IColumnaOrden[] = [
        { id: 'fechaComprometida', nombre: 'Fecha última entrega' },
        { id: 'estado', nombre: 'Estado' },
        { id: 'codigo', nombre: 'Código de entregable' },
    ];

    override get columnaOrdenInicial(): string {
        return 'fechaComprometida';
    }

    override get ordenInicial(): 'asc' | 'desc' {
        return 'asc';
    }

    tiposEstado = [
        { id: null, nombre: 'Todos los estados' },
        { id: "PENDIENTE", nombre: EstadoEntregable.PENDIENTE },
        { id: "CONFORMIDAD_EMITIDA", nombre: EstadoEntregable.CONFORMIDAD_EMITIDA }
    ];

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly seguridadService: SeguridadService,
        private readonly itemOrdenCompraService: ItemOrdenCompraService,
        private readonly ordenCompraService: OrdenCompraService,
        private readonly entregableService: EntregableService,
        private readonly snapshotGenericService: SnapshotGenericService,
        private readonly entregaService: EntregaService,
    ) {
        super();
        const idParam = this.route.snapshot.paramMap.get('idOrdenCompra');
        this.idOrdenCompra = idParam ? +idParam : 0;
        const idParam2 = this.route.snapshot.paramMap.get('idItemOrdenCompra');
        const idParam3 = this.route.snapshot.paramMap.get('idVariacion');
        this.idItemOrdenCompra = idParam2 ? +idParam2 : 0;
        this.idVariacion = idParam3 ? +idParam3 : 0;
        this.form = this.fb.group({
            estado: [null],
            entregable: [null]
        });
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.tipoUsuario = this.seguridadService.obtenerTipoUsuario();

        this.controlarPermisos();
        this.obtenerOrdenCompra();
         
    
        this.ordenCompraService.usuarioLogueadoTienePermisosRecepcion(this.idOrdenCompra).subscribe((tienePermiso: boolean) => {
            this.tienePermisoRecepcion = tienePermiso;
        });
       
    }

    
    
    controlarPermisos() {
        if (!(this.seguridadService.obtenerTipoUsuario() === TipoUsuario.PROVEEDOR || 
            (this.seguridadService.obtenerTipoUsuario() === TipoUsuario.ORGANISMO &&
            this.seguridadService.tieneAlgunPermiso(['GC_GESTION_RECEP.CONSULTA',
                        'GC_GESTION_RECEP.ALTA',
                        'GC_GESTION_RECEP.MODIFICACION',
                        'GC_GESTION_RECEP.BAJA',
                        'GC_GESTION_RECEP.IMPRESION',
                        'GC_GESTION_CONF.CONSULTA',
                        'GC_GESTION_CONF.ALTA',
                        'GC_GESTION_CONF.MODIFICACION',
                        'GC_GESTION_CONF.BAJA',
                        'GC_GESTION_CONF.IMPRESION',
                        'GC_GESTION_ENTR.CONSULTA',
                        'GC_GESTION_ENTR.ALTA',
                        'GC_GESTION_ENTR.MODIFICACION',
                        'GC_GESTION_ENTR.BAJA',
                        'GC_GESTION_ENTR.IMPRESION'])
            ))) {
            this.router.navigate(['/403']);
        }
    }

    private obtenerCodigosEntregable() {
        this.entregableService.obtenerCodigoEntregablesPorItem({
            idOC: this.idOrdenCompra,
            idItem: this.idItemOrdenCompra,
            idVariacion: this.idVariacion,
        }).subscribe((entregables: ICodigoEntregableDTO[]) => {
            this.entregablesItem = entregables;
        });
    }

    private obtenerItemOrdenCompra() {
        this.itemOrdenCompraService.obtenerItemOrdenCompra(this.idOrdenCompra, this.idItemOrdenCompra, this.idVariacion).subscribe((itemOrdenCompra: ItemOrdenCompraDTO) => {
            this.itemOrdenCompra = itemOrdenCompra;
        });
    }

    private obtenerOrdenCompra() {
        this.ordenCompraService.obtenerPorId(this.idOrdenCompra).subscribe((ordenCompra: IOrdenCompraDTO) => {
            this.ordenCompra = ordenCompra;
            if (this.tipoUsuario === TipoUsuario.PROVEEDOR) {
                if (this.idItemOrdenCompra) {
                    this.actualizarEventoEntregable();
                } else {
                    this.obtenerItemOrdenCompra();
                }
            } else if (this.idItemOrdenCompra) {
                    this.actualizarEventoEntregable();
            } else {
                this.obtenerItemOrdenCompra();
            }
        });
    }

    actualizarFiltro(): void {
        const codigo = this.form.get('entregable')?.value;
        const estado = this.form.get('estado')?.value;
        this.parametros.filtro = {
            idOC: this.idOrdenCompra,
            idItemOrdenCompra: this.idItemOrdenCompra,
            codigo: codigo,
            estado: estado
        };
    }

    private guardarFiltro(): void {
        this.snapshotGenericService.save(SeguimientoEntregableComponent.SNAPSHOT_KEY,
            this.parametros
        );
    }

    actualizarEventoEntregable(): void {
        this.marcarTodos = false;
        this.hayItemsSeleccionados = false;
        
        this.actualizarFiltrosYBuscar();
        this.obtenerItemOrdenCompra();
        this.obtenerCodigosEntregable();
    }

    actualizarFiltrosYBuscar(): void {
        this.actualizarFiltro();
        this.buscar(true);
    }


    override buscar(resetearPagina: boolean = false): void {
        this.form.markAllAsTouched();
        this.marcarTodos = false;
        this.hayItemsSeleccionados = false;
        const esValido = this.form.valid;
        if (esValido) {

            if(resetearPagina){
                this.parametros.pagina = 0;
            }

            this.parametros.pagina ??= 0;
          
            this.guardarFiltro();

            if (this.idOrdenCompra) {
                (this.parametros.filtro).idOrdenCompra = this.idOrdenCompra;
            }
            if (this.idItemOrdenCompra) {
                (this.parametros.filtro).idItemOrdenCompra = this.idItemOrdenCompra;
            }

            this.entregableService.obtenerEntregablesPorItem({
                idOC: this.idOrdenCompra,
                idItem: this.idItemOrdenCompra,
                idVariacion: this.idVariacion,
                page: this.parametros.pagina,
                size: this.parametros.tamanoPagina ?? 10,
                sort: `${this.parametros.sort ?? this.columnaOrdenInicial},${this.parametros.order ?? this.ordenInicial}`,
                estado: this.parametros.filtro.estado,
                codigo: this.parametros.filtro.codigo
            }).subscribe({
                next: (result: any) => {
                    this.entregables = result?.content;
                    this.total = result?.page.totalElements;
                },
                error: (err) => {
                    Logger.logError('Error al obtener entregables de ítem de orden de compra', err);
                }
            });
        }
    }

    volver() {
        const url = this.router.url;
        let base = '';
        const match = RegExp(/\/entregas\/seguimiento-(proveedor|organismo)\/ordenes\/(\d+)\/items/).exec(url);
        if (match) {
            base = `/entregas/seguimiento-${match[1]}/ordenes/${match[2]}/items`;
        } else {
            const fallback = RegExp(/\/entregas\/ordenes\/(\d+)\/items/).exec(url);
            if (fallback) {
                base = `/entregas/ordenes/${fallback[1]}/items`;
            }
        }

        this.router.navigate([base], { queryParams: { volver: '1' } });
    }

    abrirPopupAgregarEntregable(): void {
        const modalConfig = {
            initialState: {
                ordenCompra: this.ordenCompra,
                itemOrdenCompra: this.itemOrdenCompra,
                esModificacion: false,
                titulo: 'Agregar entregable'
            }
        };

        const modalRef = this.abrirPopup(AgregarModificarEntregablePopupComponent, 'Agregar entregable', modalConfig);

        modalRef.guardarEvento.subscribe((nuevoEntregable: IEntregableDTO) => {
            this.agregarNuevoEntregable(nuevoEntregable, modalRef);
        });
    }

    private agregarNuevoEntregable(nuevoEntregable: IEntregableDTO, popupComponent?: AgregarModificarEntregablePopupComponent): void {
        this.actualizarService.capturarErrores = false;
        this.entregableService.crearEntregable(nuevoEntregable).subscribe({
            next: () => {
                this.cerrarPopup();

                this.entregables = [...(this.entregables ?? []), nuevoEntregable];
                this.actualizarService.mensajeCorrecto('El entregable se ha guardado de forma exitosa.');
                this.actualizarEventoEntregable();
            },
            error: (error) => {
                popupComponent?.mostrarError(error);
            },
        });
    }

    puedeAgregarEntregable(): boolean {
        return !!this.itemOrdenCompra && !this.itemOrdenCompra.tieneAjustesBloqueantes
            && ((this.itemOrdenCompra.cantidadPendienteAsignar === undefined ||
                (this.itemOrdenCompra.cantidadPendienteAsignar ?? 0) > 0))
            && this.tipoUsuario === TipoUsuario.ORGANISMO
            && this.seguridadService.tienePermiso('GC_GESTION_ENTR.ALTA');
    }

    override nuevaConsulta(): void {
        this.form.reset({ estado: null, entregable: null });
        this.parametros.pagina = 0;
        this.entregables = [];
        this.parametros.filtro = {};
        this.parametros.order = this.ordenInicial;
        this.parametros.sort = this.columnaOrdenInicial;
        this.total = -1;
        this.actualizarEventoEntregable();
    }

    seleccionado(entrega: any) {
        this.hayItemsSeleccionados = this.obtenerEntregasSeleccionadas().length > 0;
        this.marcarTodos = true;
         this.entregables.forEach(entregable => {
            entregable.entregas?.forEach(entrega => {
                if (this.mostrarCheck(entrega)) {
                   this.marcarTodos &&= entrega.seleccionado??false;
                }
            });
        });
    }

    mostrarCheck(entrega: IEntregaDTO): boolean {
        return this.entregaService.mostrarCheck(entrega);
    }

    marcarDesmarcarEntregasTodos(): void {
        // Invertimos el valor primero para usarlo en la asignación
        this.marcarTodos = !this.marcarTodos;
        this.hayItemsSeleccionados = this.marcarTodos;

        this.entregables.forEach(entregable => {
            entregable.entregas?.forEach(entrega => {
                if (this.mostrarCheck(entrega)) {
                    entrega.seleccionado = this.marcarTodos;
                }
            });
        });
    }

    abrirPopupConEntregasSeleccionadas(contenido: any,
        accion: (request: IRecepcionEntregasRequest, modalRef: RecepcionTodosPopupComponent) => void): void {
        this.actualizarService.mensajeOcultar();
        const entregasSeleccionadas = this.obtenerEntregasSeleccionadas();

        if (entregasSeleccionadas.length === 0) {
            this.actualizarService.mensajeError('Debe seleccionar al menos una entrega');
            return;
        }

        this.refrescarCabezalEntregable().subscribe({
            next: ({ ordenCompra, itemOrdenCompra }) => {
                if (ordenCompra) {
                    this.ordenCompra = ordenCompra;
                }
                if (itemOrdenCompra) {
                    this.itemOrdenCompra = itemOrdenCompra;
                }

                const modalRef = this.abrirPopup(
                    contenido,
                    'Guardar',
                    {
                        initialState: {
                            itemOrdenCompra: this.itemOrdenCompra,
                            ordenCompra: this.ordenCompra,
                            entregas: entregasSeleccionadas,
                        }
                    }
                );

                modalRef?.guardarEvento?.subscribe((request: IRecepcionEntregasRequest) => {
                    accion(request, modalRef);
                });
            },
            error: (err) => {
                Logger.logError('Error al actualizar los datos del cabezal para el popup', err);
                this.actualizarService.mensajeError('No fue posible obtener los datos actualizados.');
            }
        });
    }


    private refrescarCabezalEntregable(): Observable<{ ordenCompra: IOrdenCompraDTO | null; itemOrdenCompra: ItemOrdenCompraDTO | null }> {
        const orden$ = this.idOrdenCompra ? this.ordenCompraService.obtenerPorId(this.idOrdenCompra) : of(null);
        const item$ = this.idOrdenCompra && this.idItemOrdenCompra
            ? this.itemOrdenCompraService.obtenerItemOrdenCompra(this.idOrdenCompra, this.idItemOrdenCompra, this.idVariacion)
            : of(null);

        return forkJoin({ ordenCompra: orden$, itemOrdenCompra: item$ });
    }

    abrirPopupRecepcionarSeleccionados(): void {
        this.abrirPopupConEntregasSeleccionadas(RecepcionTodosPopupComponent,
            (request: IRecepcionEntregasRequest, modalRef: PopupBaseComponent) => {
                this.recepcionarEntregasSeleccionadas(request, modalRef);
            });
    }

    abrirPopupDarConformidadSeleccionados(): void {
        this.abrirPopupConEntregasSeleccionadas(ConformidadTodosPopupComponent,
            (request: IRecepcionEntregasRequest, modalRef: PopupBaseComponent) => {
                this.darConformidadEntregasSeleccionadas(request, modalRef);
            });
    }


    puedeRecepcionarEntregaMasivo(): boolean {
        return this.tipoUsuario === TipoUsuario.ORGANISMO
            && this.seguridadService.tienePermiso('GC_GESTION_RECEP.ALTA')
            && this.entregables.some(entregable => !!entregable.entregas?.some(entrega => this.entregaService.puedeRecepcionarMasivo(entrega)));
    }

    puedeDarConformidadEntregaMasivo(): boolean {
        return this.tipoUsuario === TipoUsuario.ORGANISMO
            && this.seguridadService.tienePermiso('GC_GESTION_CONF.ALTA')
            && this.entregables.some(entregable =>
                entregable.entregas?.some(entrega => this.entregaService.puedeDarConformidadMasivo(entrega)) ?? false
            );
    }


    obtenerEntregasSeleccionadas(): IEntregaDTO[] {
        const entregasSeleccionadas: IEntregaDTO[] = [];

        this.entregables.forEach(entregable => {
            if (entregable.entregas && entregable.entregas.length > 0) {
                const seleccionadas = entregable.entregas.filter(entrega => entrega.seleccionado);
                entregasSeleccionadas.push(...seleccionadas);
            }
        });

        return entregasSeleccionadas;
    }

    hayEntregasSeleccionadas(): boolean {
        return this.obtenerEntregasSeleccionadas().length > 0;
    }

    recepcionarDarConformidadEntregasSeleccionadas(accion: () => Observable<IEntregaDTO[]>, modalRef: PopupBaseComponent): void {
        accion().subscribe({
            next: (entregas) => {
                this.actualizarService.mensajeCorrecto('Se han recepcionado las entregas seleccionados');
                this.marcarTodos = false;
                this.hayItemsSeleccionados = false;
                this.actualizarEventoEntregable();
                modalRef?.cerrarPopup();
            },
            error: (err) => {
                Logger.logError('Error al recepcionar entregas seleccionados', err);
                modalRef.procesarError(err);
            }
        });
    }

    recepcionarEntregasSeleccionadas(request: any, modalRef: PopupBaseComponent): void {
        this.recepcionarDarConformidadEntregasSeleccionadas(
            () => this.entregaService.recepcionarEntregasSeleccionadas(request),
            modalRef);
    }

    darConformidadEntregasSeleccionadas(request: any, modalRef: PopupBaseComponent): void {
        this.recepcionarDarConformidadEntregasSeleccionadas(
            () => this.entregaService.darConformidadEntregasSeleccionadas(request),
            modalRef);
    }
}
