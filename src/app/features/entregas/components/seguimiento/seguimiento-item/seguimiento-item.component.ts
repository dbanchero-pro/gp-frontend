import { DecimalPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AjusteErroresPopupComponent } from 'src/app/features/ajustes/components/ajuste-errores-popup/ajuste-errores-popup.component';
import { AjusteMasivoItemsPopupComponent } from 'src/app/features/ajustes/components/ajuste-masivo-items-popup/ajuste-masivo-items-popup.component';
import { IAjustesItemsRequestDTO } from 'src/app/features/ajustes/models/ajustes-items-request.model';
import { IAjustesItemsResponseDTO } from 'src/app/features/ajustes/models/ajustes-items-response.model';
import { AjusteService } from 'src/app/features/ajustes/services/ajuste.service';
import { TipoArticuloServObra } from 'src/app/features/entregas/enum/tipo-articulo-serv-obra';
import { IItemOrdenCompraDTO, ItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { IOrdenCompraDTO } from 'src/app/features/entregas/models/orden-ompra.model';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { EstadoOrdenCompra } from 'src/app/shared/enum/estado-orden-compra.enum';
import { TipoBusqueda } from 'src/app/shared/enum/tipo-busqueda-item.enum';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { FiltroItemCompraDTO } from 'src/app/shared/models/filtros/filtro-item-compra.model';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { fechaEntregaParaProveedor } from 'src/app/shared/utils/functions';
import { Logger } from 'src/app/shared/utils/logger';
import { EstadoItemOrdenCompra } from '../../../enum/estado-item-orden-compra';
import { TipoCantidad } from '../../../enum/tipo-cantidad.enum';
import { TipoSeguimiento } from '../../../enum/tipo-seguimiento.enum';
import { IConformidadItemsRequest } from '../../../models/conformidad-item-request.model';
import { IEntregaDTO } from '../../../models/entrega.model';
import { IFiltroOrdenCompra } from '../../../models/filtros/filtro-seguimiento-entrega.model';
import { IRecepcionItemsRequest } from '../../../models/recepcion-item-request.model';
import { EntregaService } from '../../../services/entrega.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { ConformidadTodosPopupComponent } from '../../conformidad/conformidad-todos-popup/conformidad-todos-popup.component';
import { RecepcionTodosPopupComponent } from '../../recepcion/recepcion-todos-popup/recepcion-todos-popup.component';
import { CaracteristicasItemPopupComponent } from '../caracteristicas-item-popup/caracteristicas-item-popup.component';

export const ITEMS_MOCK: ItemOrdenCompraDTO[] = [
];

@Component({
    selector: 'app-seguimiento-item',
    templateUrl: './seguimiento-item.component.html',
    standalone: false
})

export class SeguimientoItem extends PaginaBusquedaComponent<IFiltroOrdenCompra> implements OnInit {
    @ViewChild('filtroItems') filtroItemsComponent: any;

    tiposEstado = [
        { id: null, nombre: 'Todos los estados' },
        { id: EstadoItemOrdenCompra.PENDIENTE, nombre: 'Pendiente' },
        { id: EstadoItemOrdenCompra.CONFORMIDAD_EMITIDA, nombre: 'Conformidad emitida' }
    ];

    listaOrden: IColumnaOrden[] = [
        { id: 'nroItem', nombre: 'N° ítem' },
        { id: 'descArticulo', nombre: 'Descripción artículo' },
        { id: 'cantidadPendienteEntrega', nombre: 'Cantidad pendiente' },
        { id: 'fechaComprometida', nombre: 'Fecha última entrega ítem' },

    ];

    columnaOrdenInicial = 'nroItem';
    ordenInicial: 'asc' | 'desc' = 'desc';

    idOrdenCompra?: number;
    tipoSeguimiento!: TipoSeguimiento;
    TipoSeguimiento = TipoSeguimiento;
    ordenCompra!: IOrdenCompraDTO;
    tipoUsuario!: TipoUsuario;
    EstadoOrdenCompra = EstadoOrdenCompra;
    filtroItem: FiltroItemCompraDTO = { tipoBusqueda: TipoBusqueda.NROITEM, item: '' };

    items: ItemOrdenCompraDTO[] = [];
    decimalPipe = new DecimalPipe('es');

    marcarTodos: boolean = false;
    sePuedeRecepcionarTodos: boolean = false;
    sePuedeDarConformidadTodos: boolean = false;
    sePuedeAjustarTodos: boolean = false;

    static readonly SNAPSHOT_KEY = 'SeguimientoEntregaItem.FILTRO';

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        protected readonly seguridadService: SeguridadService,
        private readonly itemOrdenCompraService: ItemOrdenCompraService,
        private readonly ordenCompraService: OrdenCompraService,
        private readonly snapshotGenericService: SnapshotGenericService,
        private readonly entregaService: EntregaService,
        private readonly ajusteService: AjusteService
    ) {
        super();
        const idParam = this.route.snapshot.paramMap.get('idOrdenCompra');
        this.idOrdenCompra = idParam ? +idParam : undefined;
        this.tipoSeguimiento = this.route.snapshot.data['tipoSeguimiento'];
        this.form = this.fb.group(
            {
                filtroBase: [null],
                estado: [EstadoItemOrdenCompra.PENDIENTE],
            });
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.tipoUsuario = this.seguridadService.obtenerTipoUsuario();

        const paramVolver = this.route.snapshot.queryParamMap.get('volver');
        if (paramVolver === '1') {
            this.buscarVolver();
            const currentUrl = this.router.url.split('?')[0];
            this.router.navigateByUrl(currentUrl, { replaceUrl: true });

        } else {
            this.actualizarFiltrosYBuscar();
        }

        if (this.idOrdenCompra) {
            this.ordenCompraService.obtenerPorId(this.idOrdenCompra).subscribe({
                next: (orden) => {
                    this.ordenCompra = orden;
                },
                error: (err) => {
                    Logger.logError('Error al obtener orden de compra', err);
                }
            });
        }
    }

    onFiltroOrganismo(filtro: any): void {
        this.form.get('filtroBase')?.setValue(filtro);
    }

    onFiltroItemsCambio(filtroItem: FiltroItemCompraDTO): void {
        this.filtroItem = filtroItem;
        
    }

    actualizarFiltrosYBuscar(): void {
        this.actualizarFiltro();
        this.buscar(true);
    }

    buscar(resetearPagina: boolean = false): void {
        this.form.markAllAsTouched();
        this.marcarTodos = false;
        this.sePuedeRecepcionarTodos = false;
        this.sePuedeDarConformidadTodos = false;
        this.sePuedeAjustarTodos = false;
        const esValido = this.form.valid;
        if (esValido) {

            if (resetearPagina) {
                this.parametros.pagina ??=  0;
            }

            this.guardarFiltro();

            if (this.idOrdenCompra) {
                (this.parametros.filtro).idCompra = this.idOrdenCompra;
            }

            const estadoItem = this.parametros.filtro.estado;

            this.itemOrdenCompraService.obtenerItemsDeOrdenCompra({
                idOC: this.idOrdenCompra!,
                tipoUsuario: this.tipoUsuario,
                page: this.parametros.pagina,
                size: this.parametros.itemsPorPagina,
                sort: `${this.parametros.sort ?? this.columnaOrdenInicial},${this.parametros.order ?? this.ordenInicial}`,
                estadoItem: estadoItem,
                descArticulo: this.parametros.filtro.descripcionArticulo,
                nroItem: this.parametros.filtro.nroItem
            }).subscribe({
                next: (result: any) => {
                    this.items = result?.content;
                    this.total = result?.page.totalElements;
                },
                error: (err) => {
                    Logger.logError('Error al obtener items de orden de compra', err);
                }
            });
        }
    }

    actualizarFiltro(): void {
        let nroItem = this.parametros.filtro.nroItem;
        let descArticulo = this.parametros.filtro.descripcionArticulo;
        const codArt = this.parametros.filtro.codArticulo;
        const estado = this.form.get('estado')?.value;

        if (this.filtroItem) {
            const texto = (this.filtroItem.item ?? '').toString().trim();
            if (this.filtroItem.tipoBusqueda === TipoBusqueda.NROITEM && texto) {
                nroItem = +texto;
                descArticulo = undefined;
            } else if (this.filtroItem.tipoBusqueda === TipoBusqueda.ARTICULO && texto) {
                descArticulo = texto;
                nroItem = undefined;
            } else {
                // Si no hay texto o no se puede determinar el tipo de búsqueda, limpiamos ambos filtros
                nroItem = undefined;
                descArticulo = undefined;
            }
        }

        this.parametros.filtro = {
            nroItem,
            codArticulo: codArt,
            descripcionArticulo: descArticulo,
            estado
        };
    }

    override nuevaConsulta(): void {
        this.form?.reset({ estado: EstadoItemOrdenCompra.PENDIENTE });
        this.filtroItemsComponent?.limpiar();
        this.filtroItem = { tipoBusqueda: TipoBusqueda.NROITEM, item: '' };
        this.parametros.pagina = 0;
        this.parametros.filtro = {};
        this.parametros.order = this.ordenInicial;
        this.parametros.sort = this.columnaOrdenInicial;
        this.items = [];
        this.total = 0;
        this.snapshotGenericService.clear(SeguimientoItem.SNAPSHOT_KEY);

        this.actualizarFiltrosYBuscar();
    }

    verItems(ordenCompra: IOrdenCompraDTO): void {
        this.router.navigate(['../items'], {
            relativeTo: this.route,
            queryParams: { idOrdenCompra: ordenCompra.nroOC },
            queryParamsHandling: 'merge'
        });
    }

    cambioTipoDoc(): void {
        setTimeout(() => {
            const ctrl = this.form.get('nroDocumento');
            if (ctrl) {
                ctrl.setValue(ctrl.value);
            }
        });
    }

    protected obtenerAcciones(item: ItemOrdenCompraDTO): AccionBoton[] {
        // Determinar el tipo de artículo: ARTICULO = Bien, SERVICIO/OBRA = Servicio/Obra
        const tipoArticulo = item.tipoArticulo;
        const acciones: AccionBoton[] = [];
        const tieneEntregables = item.tipoCantidad === TipoCantidad.ENTREGABLE ||
            item.tipoCantidad === TipoCantidad.ITEM_ENTREGABLE;
        const tieneEntregas = item.tipoCantidad === TipoCantidad.ENTREGA ||
            item.tipoCantidad === TipoCantidad.ITEM_ENTREGA;

        if (tipoArticulo === undefined || tipoArticulo === null) {
            return acciones;
        }

        if (tipoArticulo !== TipoArticuloServObra.ARTICULO && !tieneEntregas) {
            acciones.push({
                nombre: 'Entregables ítem',
                ariaLabel: "Entregables ítem id " + item.idItem + " variación " + item.idVariacion,
                clase: 'btn-success btn-ancho-fijo-wider',
                icono: 'fa-list-alt',
                permisos: this.tipoUsuario == TipoUsuario.PROVEEDOR ? [] : [
                    'GC_GESTION_ENTR.CONSULTA',
                    'GC_GESTION_ENTR.ALTA',
                    'GC_GESTION_ENTR.MODIFICACION',
                    'GC_GESTION_ENTR.BAJA',
                    'GC_GESTION_RECEP.CONSULTA',
                    'GC_GESTION_RECEP.ALTA',
                    'GC_GESTION_RECEP.MODIFICACION',
                    'GC_GESTION_RECEP.BAJA',
                    'GC_GESTION_CONF.CONSULTA',
                    'GC_GESTION_CONF.ALTA',
                    'GC_GESTION_CONF.MODIFICACION',
                    'GC_GESTION_CONF.BAJA'],
                accion: () => this.verEntregables(item)
            });
        }

        if (!tieneEntregables) {
            acciones.push({
                nombre: 'Entregas ítem',
                ariaLabel: "Entregas ítem id " + item.idItem + " variación " + item.idVariacion,
                clase: 'btn-success btn-ancho-fijo-wider',
                icono: 'fa-location-arrow',
                permisos: this.tipoUsuario == TipoUsuario.PROVEEDOR ? [] : [
                    'GC_GESTION_RECEP.CONSULTA',
                    'GC_GESTION_RECEP.ALTA',
                    'GC_GESTION_RECEP.MODIFICACION',
                    'GC_GESTION_RECEP.BAJA',
                    'GC_GESTION_CONF.CONSULTA',
                    'GC_GESTION_CONF.ALTA',
                    'GC_GESTION_CONF.MODIFICACION',
                    'GC_GESTION_CONF.BAJA'],
                accion: () => this.verEntregas(item)
            });
        }

        acciones.push({
            nombre: 'Ajustes ítem',
            ariaLabel: "Ajustes de ítem id " + item.idItem + " variación " + item.idVariacion,
            clase: 'btn-primary',
            icono: 'fa fa-cog',
            permisos: this.tipoUsuario == TipoUsuario.PROVEEDOR ? [] :
                [
                    'GC_AJUSTES_ORDE.ALTA',
                    'GC_AJUSTES_ORDE.MODIFICACION',
                    'GC_AJUSTES_ORDE.BAJA',
                    'GC_AJUSTES_ORDE.CONSULTA',
                    'GC_AJUSTES_ORDE.APROBACION',
                    'GC_AJUSTES_ORDE.IMPRESION'
                ],
            accion: () => this.verAjustesItem(this.ordenCompra, item)
        });

        if (item.tieneCaracteristicas === true) {
            acciones.push({
                nombre: 'Ver características',
                ariaLabel: "Ver características de ítem id " + item.idItem + " variación " + item.idVariacion,
                clase: 'btn-primary',
                icono: 'fa-list',
                permisos: [],
                accion: () => this.verCaracteristicas(item)
            });
        }


        return acciones;
    }

    verEntregables(item: ItemOrdenCompraDTO): void {
        this.router.navigate([item.idItem, item.idVariacion, 'entregables'], { relativeTo: this.route });
    }

    verEntregas(item: ItemOrdenCompraDTO): void {
        this.router.navigate([item.idItem, item.idVariacion, 'entregas'], { relativeTo: this.route });
    }

    verCaracteristicas(item: ItemOrdenCompraDTO): void {
        const modalConfig = {
            initialState: {
                item: item,
                ordenCompra: this.ordenCompra,
            }
        };

        this.abrirPopup(CaracteristicasItemPopupComponent, undefined, modalConfig);
    }


    verAjustesItem(ordenCompra: IOrdenCompraDTO, item: ItemOrdenCompraDTO): void {
        this.router.navigate(['/ajustes', ordenCompra.idOC, 'item', item.idItem, item.idVariacion], { queryParams: { volver: '1' } });
    }

    volver() {
        if (this.tipoSeguimiento === TipoSeguimiento.Proveedor) {
            this.router.navigate(
                ['/entregas/seguimiento-proveedor'],
                { queryParams: { volver: '1' } }
            );
        }
        else if (this.tipoSeguimiento === TipoSeguimiento.Organismo) {
            this.router.navigate(
                ['/entregas/seguimiento-organismo'],
                { queryParams: { volver: '1' } }
            );
        }
    }

    private guardarFiltro(): void {
        this.snapshotGenericService.save(
            SeguimientoItem.SNAPSHOT_KEY,
            this.parametros
        );
    }

    private buscarVolver(): void {
        const snap = this.snapshotGenericService.load<any>(SeguimientoItem.SNAPSHOT_KEY);

        // Inicializar filtroItem con valor por defecto
        this.filtroItem = { tipoBusqueda: TipoBusqueda.NROITEM, item: '' };

        if (snap) {
            this.parametros = snap;
            this.form.patchValue({
                estado: snap.filtro.estado
            });
            this.parametros.pagina = snap.pagina ?? 0;
            this.parametros.tamanoPagina = snap.tamanoPagina ?? 10;
            this.parametros.sort = snap.sort ?? this.columnaOrdenInicial;
            this.parametros.order = snap.order ?? this.ordenInicial;

            if (snap.filtro.nroItem || snap.filtro.descripcionArticulo) {
                this.parametros.filtro ??= {};
                this.parametros.filtro.nroItem = snap.filtro.nroItem;
                this.parametros.filtro.descripcionArticulo = snap.filtro.descripcionArticulo;
                this.filtroItem = {
                    tipoBusqueda: snap.filtro.nroItem ? TipoBusqueda.NROITEM : TipoBusqueda.ARTICULO,
                    item: snap.filtro.nroItem ?? snap.filtro.descripcionArticulo
                };
            }
        }

        setTimeout(() => {
            this.buscar();
        }, 200);

    }

    cantidadesPendienteEntrega(item: IItemOrdenCompraDTO): string {
        return this.itemOrdenCompraService.cantidadesPendienteEntregaYTotal(item);
    }

    cantidadesPendienteRecepcion(item: IItemOrdenCompraDTO): string {
        return this.itemOrdenCompraService.cantidadesPendienteRecepcionYTotal(item);
    }

    cantidadesPendienteConformidad(item: IItemOrdenCompraDTO): string {
        return this.itemOrdenCompraService.cantidadesPendienteConformidadYTotal(item);
    }

    fechaEntregaParaProveedor(item: ItemOrdenCompraDTO): boolean {
        return fechaEntregaParaProveedor(item, this.tipoUsuario);
    }

    marcarDesmarcarItemsTodos(): void {
        this.marcarTodos = !this.marcarTodos;
        this.items.forEach(item => {
            if (this.mostrarCheck(item)) {   // solo los que muestran checkbox
                item.seleccionado = this.marcarTodos;
            }
        });

        this.habilitarBotonesTodos();
    }

    abrirPopupConItemsSeleccionadas(contenido: any,
        accion: (request: any, modalRef: RecepcionTodosPopupComponent) => void): void {
        this.actualizarService.mensajeOcultar();
        const itemsSeleccionados = this.items.filter(item => item.seleccionado);

        if (itemsSeleccionados.length === 0) {
            this.actualizarService.mensajeError('Debe seleccionar al menos un ítem');
            return;
        }

        this.refrescarOrdenCompra().subscribe({
            next: (ordenCompraActualizada) => {
                if (ordenCompraActualizada) {
                    this.ordenCompra = ordenCompraActualizada;
                }

                const modalRef = this.abrirPopup(
                    contenido,
                    'Guardar',
                    {
                        initialState: {
                            ordenCompra: this.ordenCompra,
                            itemsOrdenCompra: itemsSeleccionados,
                        }
                    }
                );

                modalRef?.guardarEvento?.subscribe((request: IRecepcionItemsRequest) => {
                    accion(request, modalRef);
                });
            },
            error: (err) => {
                Logger.logError('Error al actualizar los datos de la orden de compra para el popup', err);
                this.actualizarService.mensajeError('No fue posible obtener los datos actualizados de la orden de compra.');
            }
        });
    }


    abrirPopupRecepcionarSeleccionados(): void {
        this.abrirPopupConItemsSeleccionadas(RecepcionTodosPopupComponent,
            (request: IRecepcionItemsRequest, modalRef: PopupBaseComponent) => {
                this.recepcionarItemsSeleccionados(request, modalRef);
            });
    }

    abrirPopupDarConformidadSeleccionados(): void {
        this.abrirPopupConItemsSeleccionadas(ConformidadTodosPopupComponent,
            (request: IConformidadItemsRequest, modalRef: PopupBaseComponent) => {
                this.darConformidadItemsSeleccionados(request, modalRef);
            });
    }

    abrirPopupAjustarSeleccionados(): void {
        const itemsSeleccionados = this.items.filter(i => i.seleccionado);
        if (itemsSeleccionados.length === 0) {
            this.actualizarService.mensajeError('Debe seleccionar al menos un ítem');
            return;
        }

        this.refrescarOrdenCompra().subscribe({
            next: (ordenCompraActualizada) => {
                if (ordenCompraActualizada) {
                    this.ordenCompra = ordenCompraActualizada;
                }

                const modalRef = this.abrirPopupXXL(AjusteMasivoItemsPopupComponent, undefined, {
                    initialState: {
                        tipoUsuario: this.tipoUsuario,
                        ordenCompra: this.ordenCompra,
                        items: itemsSeleccionados,
                        ajustesPendientes: []
                    }
                }) as AjusteMasivoItemsPopupComponent | undefined;

                modalRef?.ajustesGuardados?.subscribe((request: IAjustesItemsRequestDTO) => {
                    this.ajustarItemsSeleccionados(request, modalRef as any);
                });
            },
            error: (err) => {
                Logger.logError('Error al obtener la orden de compra para abrir el popup de ajustes', err);
                this.actualizarService.mensajeError('No fue posible obtener los datos actualizados de la orden de compra.');
            }
        });
    }

    puedeRecepcionarEntrega(): boolean {
        return this.tipoUsuario==TipoUsuario.ORGANISMO && this.seguridadService.tienePermiso('GC_GESTION_RECEP.ALTA')
        && this.items.some(item => !!item.puedeRecepcionEntregas);
    }

    puedeDarConformidadEntrega(): boolean {
        return this.tipoUsuario==TipoUsuario.ORGANISMO && this.seguridadService.tienePermiso('GC_GESTION_CONF.ALTA')
            && this.items.some(item => !!item.puedeConformidadEntregas);
    }


    private refrescarOrdenCompra(): Observable<IOrdenCompraDTO | undefined> {
        if (!this.idOrdenCompra) {
            return of(this.ordenCompra);
        }
        return this.ordenCompraService.obtenerPorId(this.idOrdenCompra);
    }

    puedeAjustarItems(): boolean {
        return ((this.tipoUsuario == TipoUsuario.PROVEEDOR
                || (this.tipoUsuario == TipoUsuario.ORGANISMO && this.seguridadService.tienePermiso('GC_AJUSTES_ORDE.ALTA')))
            && this.items.some(item => !!item.puedeAgregarAjusteAnulacion || !!item.puedeAgregarAjusteCantidad || !!item.puedeAgregarAjusteCantidad));
    }

    seleccionar(item: ItemOrdenCompraDTO, seleccionado: boolean): void {
        item.seleccionado = seleccionado;

        if (this.items.filter(item => item.seleccionado).length == 0) {
            this.marcarTodos = false;
        }

        this.habilitarBotonesTodos();
    }

    habilitarBotonesTodos() {
        this.sePuedeRecepcionarTodos = this.items.filter(item => item.seleccionado).length > 0 && this.items.filter(item => item.seleccionado).length === this.items.filter(item => item.seleccionado && item.puedeRecepcionEntregas).length;
        this.sePuedeDarConformidadTodos = this.items.filter(item => item.seleccionado).length > 0 && this.items.filter(item => item.seleccionado).length === this.items.filter(item => item.seleccionado && item.puedeConformidadEntregas).length;
        this.sePuedeAjustarTodos =this.items.filter(item => item.seleccionado && (!!item.puedeAgregarAjusteFecha || !!item.puedeAgregarAjusteCantidad || !!item.puedeAgregarAjusteAnulacion)).length>0;
    }

    mostrarCheck(item: IItemOrdenCompraDTO): boolean {
        return (this.tipoUsuario == TipoUsuario.ORGANISMO
                && ((this.seguridadService.tienePermiso('GC_GESTION_RECEP.ALTA') && !!item.puedeRecepcionEntregas)
                || (this.seguridadService.tienePermiso('GC_GESTION_CONF.ALTA') && !!item.puedeConformidadEntregas))
                )
            || ((this.tipoUsuario == TipoUsuario.PROVEEDOR
                || (this.tipoUsuario == TipoUsuario.ORGANISMO && this.seguridadService.tienePermiso('GC_AJUSTES_ORDE.ALTA')))
                && (!!item.puedeAgregarAjusteAnulacion || !!item.puedeAgregarAjusteCantidad || !!item.puedeAgregarAjusteFecha));
    }

    mostrarFechaComprometidaOC(): boolean {
        return this.items.some(item => !item.fechaComprometida);
    }

    puedeAgregarAjuste(item: ItemOrdenCompraDTO): boolean {
        return !!item.puedeAgregarAjusteFecha || !!item.puedeAgregarAjusteCantidad || !!item.puedeAgregarAjusteAnulacion;
    }

    recepcionarDarConformidadAjustarItemsSeleccionados(accion: () => Observable<IEntregaDTO[]>,
        textoExito: string, textoError: string,
        modalRef: PopupBaseComponent): void {
        accion().subscribe({
            next: (items) => {
                this.marcarTodos = false;
                this.sePuedeRecepcionarTodos = false;
                this.sePuedeDarConformidadTodos = false;
                this.sePuedeAjustarTodos = false;
                this.actualizarService.mensajeCorrecto(textoExito);
                this.buscar();
                modalRef?.cerrarPopup();
            },
            error: (err) => {
                Logger.logError(textoError, err);
                modalRef.procesarError(err);
            }
        });
    }

    recepcionarItemsSeleccionados(request: IRecepcionItemsRequest, modalRef: PopupBaseComponent): void {
        this.recepcionarDarConformidadAjustarItemsSeleccionados(
            () => this.entregaService.recepcionarItemsSeleccionados(request),
            'Se han recepcionado los ítems seleccionados',
            'Error al recepcionar ítems seleccionados', modalRef);
    }

    darConformidadItemsSeleccionados(request: IConformidadItemsRequest, modalRef: PopupBaseComponent): void {
        this.recepcionarDarConformidadAjustarItemsSeleccionados(
            () => this.entregaService.darConformidadItemsSeleccionados(request),
            'Se han dado la conformidad los ítems seleccionados',
            'Error al dar conformidad los ítems seleccionados', modalRef);
    }


    ajustarItemsSeleccionados(request: IAjustesItemsRequestDTO, modalRef: PopupBaseComponent): void {
        this.actualizarService.capturarErrores = false;
        const tipoParaEndpoint = request.tipoSolicitante
            ?? (this.tipoUsuario === TipoUsuario.PROVEEDOR ? TipoUsuario.PROVEEDOR : TipoUsuario.ORGANISMO);

        const ejecutarCreacion = (payload: IAjustesItemsRequestDTO) => {
            this.ajusteService.crearAjustesItemsSeleccionados(payload, tipoParaEndpoint).subscribe({
                next: () => {
                    if(this.tipoUsuario===TipoUsuario.PROVEEDOR){
                        this.actualizarService.mensajeCorrecto('Su solicitud está pendiente de aprobación por parte del comprador');
                    } else {
                        this.actualizarService.mensajeCorrecto('Se ha creado el ajuste de forma exitosa');
                    }

                    this.marcarTodos = false;
                    this.sePuedeRecepcionarTodos = false;
                    this.sePuedeDarConformidadTodos = false;
                    this.sePuedeAjustarTodos = false;

                    this.buscar();
                    modalRef?.cerrarPopup();
                },
                error: (err) => {
                    Logger.logError('Error al crear ajustes masivos', err);
                    modalRef?.procesarError(err);
                }
            });
        };

        this.ajusteService.validarAjustesItemsSeleccionados(request, tipoParaEndpoint).subscribe({
            next: (respuestaValidacion: IAjustesItemsResponseDTO) => {
                const requestFiltrado: IAjustesItemsRequestDTO = {
                    ...request,
                    ajusteDto: respuestaValidacion?.ajustesProcesados ?? request.ajusteDto,
                    listadoAjustesErrores: respuestaValidacion?.ajustesConError
                        ?? request.listadoAjustesErrores
                        ?? []
                };

                const totalSolicitados = request.ajusteDto?.length ?? 0;
                const totalErrores = respuestaValidacion?.ajustesConError?.length ?? 0;
                const todosLosAjustesConError = totalSolicitados > 0 && totalErrores >= totalSolicitados;

                if (respuestaValidacion?.ajustesConError?.length) {
                    const mensajeConfirmacion = todosLosAjustesConError
                        ? 'No es posible crear los ajustes solicitados. Los siguientes ítems tienen errores:'
                        : 'Algunos de los ajustes solicitados tienen errores. ¿Desea de todas maneras crear solo los ajustes que no tienen errores?';
                    const popupErrores = this.abrirPopupXXL(AjusteErroresPopupComponent, 'Crear ajustes', {
                        initialState: {
                            mensajeConfirmacion,
                            errores: respuestaValidacion.ajustesConError,
                            deshabilitarGuardar: todosLosAjustesConError
                        }
                    }) as AjusteErroresPopupComponent | undefined;

                    popupErrores?.confirmar.subscribe(() => ejecutarCreacion(requestFiltrado));
                    popupErrores?.cancelar.subscribe(() => { this.actualizarService.capturarErrores = true; });
                } else {
                    ejecutarCreacion(requestFiltrado);
                }
            },
            error: (err) => {
                Logger.logError('Error al validar ajustes masivos', err);
                modalRef?.procesarError(err);
            }
        });
    }

    override descargarExcel(): void {

        this.actualizarFiltro();
        this.guardarFiltro();

    Logger.logInfo('Parámetros de búsqueda: ', this.parametros);

        const params = {
            idOC: this.idOrdenCompra,
            filtro: this.parametros.filtro,
            sort: this.parametros.sort ?? this.columnaOrdenInicial,
            order: this.parametros.order ?? this.ordenInicial
        };

        this.itemOrdenCompraService.exportarSeguimientoItemExcel(params);
    }

}
















