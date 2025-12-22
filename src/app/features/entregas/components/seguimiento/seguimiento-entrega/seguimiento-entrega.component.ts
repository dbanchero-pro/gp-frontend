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
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { Logger } from 'src/app/shared/utils/logger';
import { ESTADO_ENTREGA_SEGUIMIENTO_OPCIONES, EstadoEntrega, EstadoEntregaOpcion } from '../../../enum/estado-entrega.enum';
import { TipoArticuloServObra } from '../../../enum/tipo-articulo-serv-obra';
import { IEntregaDTO } from '../../../models/entrega.model';
import { IFiltroEntregaEntregable } from '../../../models/filtros/filtro-entrega-entregable.model';
import { IRecepcionEntregasRequest } from '../../../models/recepcion-entrega-request-model';
import { EntregaService } from '../../../services/entrega.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { ConformidadTodosPopupComponent } from '../../conformidad/conformidad-todos-popup/conformidad-todos-popup.component';
import { RecepcionTodosPopupComponent } from '../../recepcion/recepcion-todos-popup/recepcion-todos-popup.component';
import { AgregarModificarEntregaBienPopupComponent } from '../agregar-modificar-entrega-bien-popup/agregar-modificar-entrega-bien-popup.component';
import { AgregarModificarEntregaObraPopupComponent } from '../agregar-modificar-entrega-obra-popup/agregar-modificar-entrega-obra-popup.component';

@Component({
    selector: 'app-seguimiento-entrega',
    templateUrl: './seguimiento-entrega.component.html',
    styleUrl: './seguimiento-entrega.component.scss',
    standalone: false
})
export class SeguimientoEntregaComponent extends PaginaBusquedaComponent<IFiltroEntregaEntregable> implements OnInit {

    tipoUsuario!: any;
    TipoUsuario = TipoUsuario;
    itemOrdenCompra!: ItemOrdenCompraDTO;
    ordenCompra!: IOrdenCompraDTO;
    recCol: boolean[] = [];
    confCol: boolean[] = [];
    entCol: boolean[] = [];
    EstadoEntrega = EstadoEntrega;
    esUsuarioProveedor: boolean = false;

    entregas: IEntregaDTO[] = [];

    idOrdenCompra!: number;
    idItemOrdenCompra!: number;
    idVariacion!: number;
    tienePermisoRecepcion: boolean = false;
    marcarTodos: boolean = false;
    hayItemsSeleccionados: boolean = false;

    override listaOrden: IColumnaOrden[] = [
        { id: 'estado', nombre: 'Estado' },
    ];

    override get columnaOrdenInicial(): string {
        return 'estado';
    }

    override get ordenInicial(): 'asc' | 'desc' {
        return 'asc';
    }


    readonly estadoEntregaOpciones = ESTADO_ENTREGA_SEGUIMIENTO_OPCIONES;
    tiposEstado: EstadoEntregaOpcion[] = this.estadoEntregaOpciones.filter(opcion => opcion.aplicaBienes);

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        protected readonly seguridadService: SeguridadService,
        private readonly ordenCompraService: OrdenCompraService,
        private readonly itemOrdenCompraService: ItemOrdenCompraService,
        private readonly entregaService: EntregaService
    ) {
        super();
        const idParam = this.route.snapshot.paramMap.get('idOrdenCompra');
        const idItemParam = this.route.snapshot.paramMap.get('idItemOrdenCompra');
        const idVariacionParam = this.route.snapshot.paramMap.get('idVariacion');

        this.idVariacion = idVariacionParam ? +idVariacionParam : 0;
        this.idItemOrdenCompra = idItemParam ? +idItemParam : 0;
        this.idOrdenCompra = idParam ? +idParam : 0;

        this.form = this.fb.group({
            estado: [null],
            entregable: [null]
        });
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.tipoUsuario = this.seguridadService.obtenerTipoUsuario();
        this.esUsuarioProveedor = this.tipoUsuario === TipoUsuario.PROVEEDOR;

        this.controlarPermisos()
        this.obtenerOrdenCompra();
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
                        'GC_GESTION_CONF.IMPRESION'])
            ))) {
            this.router.navigate(['/403']);
        }
    }

    actualizarTiposEstadoSegunTipoArticulo(tipoArticulo?: TipoArticuloServObra): void {
        const esServicioObra = tipoArticulo === TipoArticuloServObra.SERVICIO || tipoArticulo === TipoArticuloServObra.OBRA;
        this.tiposEstado = this.estadoEntregaOpciones.filter(opcion =>
            esServicioObra ? opcion.aplicaServiciosObras : opcion.aplicaBienes
        );

        const estadoSeleccionado = this.form?.get('estado')?.value;
        if (estadoSeleccionado !== undefined && !this.tiposEstado.some(opcion => opcion.id === estadoSeleccionado)) {
            this.form?.patchValue({ estado: null }, { emitEvent: false });
        }
    }


    actualizarFiltrosYBuscar(): void {
        this.actualizarFiltro();
        this.buscar(true);
    }

    actualizarFiltro(): void {
         const estadoEntrega = this.form.value.estado;
           
        this.parametros.filtro = this.form.value;
        this.parametros.filtro.estadoEntrega = estadoEntrega;

    }

    override buscar(resetearPagina: boolean = false): void {
        this.form.markAllAsTouched();
        this.marcarTodos = false;
        this.hayItemsSeleccionados = false;
        const esValido = this.form.valid;
        if (esValido) {
           
            if (resetearPagina) {
                this.parametros.pagina = 0;
            }

            this.parametros.pagina ??= 0;
            
            const params: any = {
                idOC: this.idOrdenCompra,
                idCompra: this.ordenCompra?.compra?.idCompra ?? 0,
                idItemCompra: this.idItemOrdenCompra,
                idVariacion: this.idVariacion,
                page: this.parametros.pagina,
                size: this.parametros.tamanoPagina ?? 10,
                sort: this.parametros.sort ?? this.columnaOrdenInicial,
                order: this.parametros.order ?? this.ordenInicial
            };


            if (this.parametros.filtro.estadoEntrega !== null && this.parametros.filtro.estadoEntrega !== undefined) {
                params.estadoEntrega = this.parametros.filtro.estadoEntrega;
            }

            this.entregaService.obtenerEntregas(params).subscribe({
                next: (resp) => {
                    this.entregas = resp?.content ?? [];
                    this.total = resp?.page?.totalElements ?? this.entregas.length;

                    // Inicializar arrays de control para los colapsables
                    this.recCol = new Array(this.entregas.length).fill(false);
                    this.confCol = new Array(this.entregas.length).fill(false);
                    this.entCol = new Array(this.entregas.length).fill(false);

                    // Configurar paneles abiertos por defecto
                    this.entregas.forEach((entrega: any, index: number) => {
                        if (this.entregaService.tieneSoloEntrega(entrega)) {
                            this.entCol[index] = true;
                        }

                        if (this.entregaService.tieneSoloRecepcion(entrega)) {
                            this.recCol[index] = true;
                        }

                        if (this.entregaService.tieneConformidad(entrega)) {
                            this.confCol[index] = true;
                        }
                    });
                },
                error: (err) => {
                    Logger.logError('Error al consultar entregas', err);
                    this.entregas = [];
                    this.total = 0;
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

    abrirPopupAgregarEntrega(): void {
        if (this.itemOrdenCompra.tipoArticulo === TipoArticuloServObra.OBRA || this.itemOrdenCompra.tipoArticulo === TipoArticuloServObra.SERVICIO) {
            this.actualizarService.mensajeOcultar();
            const modalRef = this.abrirPopupGrande(
                AgregarModificarEntregaObraPopupComponent,
                undefined,
                {
                    initialState: {
                        ordenCompra: this.ordenCompra,
                        itemOrdenCompra: this.itemOrdenCompra,
                        entregasDelItem: this.entregas,
                    }
                }
            );

            modalRef?.guardarEvento?.subscribe((dto: IEntregaDTO) => {
                this.guardarEntrega(dto, modalRef);
            });

        } else {
            this.actualizarService.mensajeOcultar();
            const modalRef = this.abrirPopupGrande(
                AgregarModificarEntregaBienPopupComponent,
                undefined,
                {
                    initialState: {
                        entrega: undefined,
                        ordenCompra: this.ordenCompra,
                        itemOrdenCompra: this.itemOrdenCompra,
                    }
                }
            ) as AgregarModificarEntregaBienPopupComponent;

            modalRef.guardarEvento.subscribe((dto: IEntregaDTO) => {
                this.guardarEntrega(dto, modalRef)
            });
        }

    }

    guardarEntrega(dto: IEntregaDTO, popupComponent?: AgregarModificarEntregaBienPopupComponent | AgregarModificarEntregaObraPopupComponent): void {
        this.actualizarService.capturarErrores = false;
        this.entregaService.crearEntrega(dto, this.tipoUsuario).subscribe({
            next: () => {
                this.actualizarService.mensajeCorrecto('La entrega ha sido agregada de forma exitosa.');
                popupComponent?.cerrarPopup();
                this.actualizarEventoEntrega();
            },
            error: (error) => {
                popupComponent?.procesarError(error, 'Error al agregar la entrega');
            },
        });
    }

    override nuevaConsulta(): void {
        this.form.reset({ estado: null });
        this.parametros.pagina = 0;
        this.entregas = [];
        this.parametros.filtro = {};
        this.parametros.order = this.ordenInicial;
        this.parametros.sort = this.columnaOrdenInicial;
        this.total = -1;
        this.actualizarEventoEntrega();
    }


    private obtenerOrdenCompra() {
        this.ordenCompraService.obtenerPorId(this.idOrdenCompra).subscribe((ordenCompra: IOrdenCompraDTO) => {
            this.ordenCompra = ordenCompra;
            if (this.tipoUsuario == TipoUsuario.PROVEEDOR) {
                this.tienePermisoRecepcion = true;
                if (this.idItemOrdenCompra) {
                    this.actualizarEventoEntrega();
                }
            } else {
                this.ordenCompraService.usuarioLogueadoTienePermisosRecepcion(this.ordenCompra.idOC).subscribe((tienePermiso: boolean) => {
                    this.tienePermisoRecepcion = tienePermiso;
                    if (this.idItemOrdenCompra) {
                        this.actualizarEventoEntrega();
                    }
                });
            }
        });
    }

    private obtenerItemOrdenCompra() {
        this.itemOrdenCompraService.obtenerItemOrdenCompra(this.idOrdenCompra, this.idItemOrdenCompra, this.idVariacion).subscribe({
            next: (item) => {
                this.itemOrdenCompra = item;
                this.actualizarTiposEstadoSegunTipoArticulo(item?.tipoArticulo);
            }
        });
    }

    actualizarEventoEntrega(): void {
        this.marcarTodos = false;
        this.hayItemsSeleccionados = false;
        this.actualizarFiltro();
        this.buscar();
        this.obtenerItemOrdenCompra()
    }

    puedeAgregarEntrega(): boolean {
        return !!this.itemOrdenCompra && !this.itemOrdenCompra.tieneAjustesBloqueantes
            && ((this.tipoUsuario === TipoUsuario.ORGANISMO && this.tienePermisoRecepcion
            && this.seguridadService.tienePermiso('GC_GESTION_RECEP.ALTA'))
            || this.tipoUsuario === TipoUsuario.PROVEEDOR)
            && (this.itemOrdenCompra?.cantidadPendienteAsignar ?? 0) > 0;
    }

    seleccionar(entrega: IEntregaDTO): void {
        this.hayItemsSeleccionados = this.entregas.some(entrega => entrega.seleccionado);
        this.marcarTodos = this.entregas.every(entrega => this.mostrarCheck(entrega) ? entrega.seleccionado : true);
    }

    mostrarCheck(entrega: IEntregaDTO): boolean {
        return this.entregaService.mostrarCheck(entrega);
    }

    marcarDesmarcarEntregasTodos(): void {
        this.marcarTodos = !this.marcarTodos;
        this.hayItemsSeleccionados = this.marcarTodos;

        this.entregas.forEach(entrega => {
            if (this.mostrarCheck(entrega)) {   // solo los que muestran checkbox
                entrega.seleccionado = this.marcarTodos;
            }
        });

    }


    private refrescarCabezalEntrega(): Observable<{ ordenCompra: IOrdenCompraDTO | null; itemOrdenCompra: ItemOrdenCompraDTO | null }> {
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

    abrirPopupConEntregasSeleccionadas(contenido: any,
        accion: (request: IRecepcionEntregasRequest, modalRef: RecepcionTodosPopupComponent) => void): void {
        this.actualizarService.mensajeOcultar();
        const entregasSeleccionadas = this.entregas.filter(entrega => entrega.seleccionado);

        if (entregasSeleccionadas.length === 0) {
            this.actualizarService.mensajeError('Debe seleccionar al menos una entrega');
            return;
        }

        this.refrescarCabezalEntrega().subscribe({
            next: ({ ordenCompra, itemOrdenCompra }) => {
                if (ordenCompra) {
                    this.ordenCompra = ordenCompra;
                }
                if (itemOrdenCompra) {
                    this.itemOrdenCompra = itemOrdenCompra;
                }

                const modalRef = this.abrirPopup(contenido, 'Guardar', {
                    initialState: {
                        itemOrdenCompra: this.itemOrdenCompra,
                        ordenCompra: this.ordenCompra,
                        entregas: entregasSeleccionadas,
                    }
                });

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

 
    puedeRecepcionarEntregaMasivo(): boolean {
        return this.tipoUsuario==TipoUsuario.ORGANISMO && this.seguridadService.tienePermiso('GC_GESTION_RECEP.ALTA') 
        && this.entregas.some(entrega => this.entregaService.puedeRecepcionarMasivo(entrega));
    }

    puedeDarConformidadEntregaMasivo(): boolean {
        return this.tipoUsuario==TipoUsuario.ORGANISMO && this.seguridadService.tienePermiso('GC_GESTION_CONF.ALTA')
            && this.entregas.some(entrega => this.entregaService.puedeDarConformidadMasivo(entrega));
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

    recepcionarDarConformidadEntregasSeleccionadas(accion: () => Observable<IEntregaDTO[]>,
        modalRef: PopupBaseComponent): void {
        accion().subscribe({
            next: (entregas) => {
                this.actualizarService.mensajeCorrecto('Se han recepcionado las entregas seleccionados');
                this.marcarTodos = false;
                this.hayItemsSeleccionados = false;
                this.actualizarEventoEntrega();
                modalRef?.cerrarPopup();
            },
            error: (err) => {
                Logger.logError('Error al recepcionar entregas seleccionados', err);
                modalRef.procesarError(err);
            }
        });
    }


    override descargarExcel(): void {

        Logger.logInfo('Parametros de excel: ', this.form.value.estado);
        const estadoEntrega = this.form.value.estado;
        const params: any = {
            idOC: this.idOrdenCompra,
            idItemCompra: this.idItemOrdenCompra,
            idCompra: this.ordenCompra?.compra?.idCompra ?? 0,
            idVariacion: this.idVariacion ?? 0,
            idEntregable: null,
            sort: this.parametros.sort ?? this.columnaOrdenInicial,
            order: this.parametros.order ?? this.ordenInicial

        };

        if (estadoEntrega !== null && estadoEntrega !== undefined) {
            params.estadoEntrega = estadoEntrega;
        }

        this.entregaService.exportarExcel(params);
    }
}
