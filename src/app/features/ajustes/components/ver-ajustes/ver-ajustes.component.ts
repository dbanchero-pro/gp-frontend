import { DecimalPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { IDescargoDTO } from 'src/app/features/entregas/models/descargo.model';
import { IItemOrdenCompraDTO, ItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { IOrdenCompraDTO } from 'src/app/features/entregas/models/orden-ompra.model';
import { ItemOrdenCompraService } from 'src/app/features/entregas/services/item-orden-compra.service';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { TipoBusqueda } from 'src/app/shared/enum/tipo-busqueda-item.enum';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { FiltroItemCompraDTO } from 'src/app/shared/models/filtros/filtro-item-compra.model';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { Logger } from 'src/app/shared/utils/logger';
import { EstadoAjuste } from '../../enum/estado-ajuste.enum';
import { obtenerTiposParaItem, obtenerTiposParaOC, TipoAjuste, TipoAjusteInfo } from '../../enum/tipo-ajuste.enum';
import { IAjusteDTO } from '../../models/ajuste.model';
import { IAjusteFiltro } from '../../models/filtros/ajuste-filtro.model';
import { AjusteService } from '../../services/ajuste.service';
import { AgregarDescargoAjustePopupComponent } from '../agregar-descargo-ajuste-popup/agregar-descargo-ajuste-popup.component';
import { AgregarModificarAjustePopupComponent } from '../agregar-modificar-ajuste-popup/agregar-modificar-ajuste-popup.component';
import { ResolucionAjustePopupComponent } from '../resolucion-ajuste/resolucion-ajuste-popup.component';

@Component({
    selector: 'app-ver-ajustes',
    templateUrl: './ver-ajustes.component.html',
    standalone: false,
})
export class VerAjustesComponent extends PaginaBusquedaComponent<IAjusteFiltro> implements OnInit {
    @ViewChild('filtroItems') filtroItemsComponent: any;

    tiposAjuste: TipoAjusteInfo[] = [];

    private readonly tiposEstadoBase = [
        { id: null, nombre: 'Todos los estados' },
        { id: EstadoAjuste.EN_PROCESO, nombre: 'En proceso' },
        { id: EstadoAjuste.PENDIENTE_APROBACION, nombre: 'Pendiente de aprobación' },
        { id: EstadoAjuste.APROBADO, nombre: 'Aprobado' },
        { id: EstadoAjuste.RECHAZADO, nombre: 'Rechazado' },
        { id: EstadoAjuste.ENVIADO_APROBACION, nombre: 'Pendiente de aprobación SICE' }
    ];

    tiposEstado = [...this.tiposEstadoBase];

    listaOrden: IColumnaOrden[] = [
        { id: 'fechaSolicitud', nombre: 'Fecha solicitud del ajuste' },
        { id: 'tipoAjuste', nombre: 'Tipo de ajuste' },
        { id: 'estado', nombre: 'Estado' },
    ];

    columnaOrdenInicial = 'fechaSolicitud';
    ordenInicial: 'asc' | 'desc' = 'desc';

    idOrdenCompra?: number;
    idItem?: number;
    idVariacion?: number;
    consultaParaItem: boolean = false;
    ordenCompra!: IOrdenCompraDTO;
    itemOrdenCompra!: ItemOrdenCompraDTO;
    tipoUsuario!: TipoUsuario;
    esUsuarioProveedor: boolean = false;
    filtroItem: FiltroItemCompraDTO = { tipoBusqueda: TipoBusqueda.NROITEM, item: '' };

    ajustes: IAjusteDTO[] = [];

    decimalPipe = new DecimalPipe('es');

    static readonly SNAPSHOT_KEY = 'VerAjustes.FILTRO';
    private ajusteEnResolucion?: IAjusteDTO;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        protected readonly seguridadService: SeguridadService,
        private readonly itemOrdenCompraService: ItemOrdenCompraService,
        private readonly ordenCompraService: OrdenCompraService,
        private readonly snapshotGenericService: SnapshotGenericService,
        private readonly ajustesService: AjusteService,

    ) {
        super();
        const idParam = this.route.snapshot.paramMap.get('idOrdenCompra');
        this.idOrdenCompra = idParam ? +idParam : undefined;
        this.form = this.fb.group(
            {
                filtroBase: [null],
                rangoFechas: [null],
                tipoAjuste: [null],
                estado: [null],
            });
    }

    override ngOnInit(): void {
        super.ngOnInit();

        this.tipoUsuario = this.seguridadService.obtenerTipoUsuario();
        this.esUsuarioProveedor = this.tipoUsuario === TipoUsuario.PROVEEDOR;
        this.controlarPermisos();
        
        this.obtenerIdsParametrosRuta();
        this.obtenerTiposEstado();
        this.obtenerTipoConsulta();
        this.obtenerOrdenCompra();
        this.obtenerTiposAjuste();

        if (this.consultaParaItem) {
            this.obtenerItemOrdenCompra();
        }

        const paramVolver = this.route.snapshot.queryParamMap.get('volver');
        if (paramVolver === '1') {
            this.buscarVolver();
            const currentUrl = this.router.url.split('?')[0];
            this.router.navigateByUrl(currentUrl, { replaceUrl: true });

        } else {
            this.actualizarFiltrosYBuscar();
        }

        this.actualizarService.tipoUsuario$.subscribe((tipoUsuario) => {
            if (tipoUsuario !== undefined) {
                this.tipoUsuario = tipoUsuario;
                this.nuevaConsulta();
            }
        });
    }

     controlarPermisos() {
        if (!(this.seguridadService.obtenerTipoUsuario() === TipoUsuario.PROVEEDOR || 
            (this.seguridadService.obtenerTipoUsuario() === TipoUsuario.ORGANISMO &&
            this.seguridadService.tieneAlgunPermiso(['GC_AJUSTES_ORDE.ALTA', 'GC_AJUSTES_ORDE.BAJA', 'GC_AJUSTES_ORDE.MODIFICACION'
                        , 'GC_AJUSTES_ORDE.CONSULTA', 'GC_AJUSTES_ORDE.IMPRESION', 'GC_AJUSTES_ORDE.APROBACION'])
            ))) {
            this.router.navigate(['/403']);
        }
    }

    obtenerTipoConsulta() {
        const hayVariacion = this.route.snapshot.paramMap.get('idVariacion');
        this.consultaParaItem = !!hayVariacion;
    }

    obtenerTiposAjuste() {
        const paraItemFiltrado = obtenerTiposParaItem().filter(tipo => {
            if (tipo.tipo !== TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD) {
                return true;
            }
            return false;
        });
        
        this.tiposAjuste = this.consultaParaItem ? paraItemFiltrado : obtenerTiposParaOC().concat(paraItemFiltrado);
    }

    obtenerTiposEstado() {
        this.obtenerUsuarioyValidar();
        if (this.tipoUsuario === TipoUsuario.ORGANISMO) {
            this.tiposEstado = this.tiposEstadoBase.filter(estado => estado.id !== EstadoAjuste.EN_PROCESO);
        } else {
            this.tiposEstado = [...this.tiposEstadoBase];
        }
    }

    obtenerUsuarioyValidar() {
        this.tipoUsuario = this.seguridadService.obtenerTipoUsuario();
        this.esUsuarioProveedor = this.tipoUsuario === TipoUsuario.PROVEEDOR;
    }

    onFiltroOrganismo(filtro: any): void {
        this.form.get('filtroBase')?.setValue(filtro);
    }

    onFiltroItemsCambio(filtroItem: FiltroItemCompraDTO): void {
        if (this.consultaParaItem) {
            return;
        }
        this.filtroItem = filtroItem;
        const texto = (filtroItem.item ?? '').toString().trim();
        const esPorNumero = filtroItem.tipoBusqueda === TipoBusqueda.NROITEM;

        if (!texto) {
            this.parametros.filtro.nroItem = undefined;
            this.parametros.filtro.descripcionArticulo = undefined;
            return;
        }

        if (esPorNumero) {
            this.parametros.filtro.nroItem = Number(texto);
            this.parametros.filtro.descripcionArticulo = undefined;
        } else {
            this.parametros.filtro.descripcionArticulo = texto;
            this.parametros.filtro.nroItem = undefined;
        }

    }
    actualizarFiltrosYBuscar(): void {
        this.actualizarFiltro();
        this.buscar(true);
    }

    

    buscar(resetearPagina: boolean = false): void {
        this.form.markAllAsTouched();
        const esValido = this.form.valid;
        if (esValido) {

            this.obtenerOrdenCompra();
            if (this.consultaParaItem) {
                this.obtenerItemOrdenCompra();
            }

            if (resetearPagina) {
                this.parametros.pagina = 0;
            }

            this.guardarFiltro();

            if (this.idOrdenCompra) {
                (this.parametros.filtro).idCompra = this.idOrdenCompra;
            }

            const estadoSel: EstadoAjuste | null = this.form.get('estado')?.value ?? null;
            const tipoAjusteSel: TipoAjusteInfo | null = this.form.get('tipoAjuste')?.value ?? null;
            const fechas = this.form.get('rangoFechas')?.value ?? {};
            const fechaDesde: string | null = fechas?.fechaDesde ?? null;
            const fechaHasta: string | null = fechas?.fechaHasta ?? null;

            let estadoFiltro = estadoSel;

            const filtro: IAjusteFiltro = {
                tipoAjuste: tipoAjusteSel?.tipo ?? undefined,
                estado: estadoFiltro ?? undefined,
                fechaDesde,
                fechaHasta,
                nroItem: this.parametros.filtro?.nroItem,
                codArticulo: this.parametros.filtro?.codArticulo,
                idItem: this.idItem,
                idVariacion: this.idVariacion
            };

            const idOC = this.idOrdenCompra;
            const page = this.parametros.pagina ?? 0;
            const size = this.parametros.tamanoPagina ?? 10;
            const sort = this.parametros.sort ?? this.columnaOrdenInicial;
            const order = this.parametros.order ?? this.ordenInicial;
            let obs$;

            if (this.consultaParaItem && (!idOC || !filtro.idItem || !filtro.idVariacion)) {
                Logger.logError('Faltan parámetros para consultar ajustes por ítem', { idOC, idItem: filtro.idItem, idVariacion: filtro.idVariacion });
                return;
            } else if (!idOC) {
                Logger.logError('Falta idOrdenCompra para consultar ajustes por orden.');
                return;
            }
            this.ajustesService.buscarAjustes(this.tipoUsuario, idOC, filtro, page, size, sort, order).subscribe((res: PageModel<IAjusteDTO>) => {
                this.ajustes = res.content ?? [];
                this.total = res.page.totalElements ?? 0;
            });

        }
    }

    actualizarFiltro(): void {
        const estado = this.form.get('estado')?.value;

        if (this.consultaParaItem) {
            this.parametros.filtro = {
                estado
            };
            return;
        }
        let descArticulo = this.parametros.filtro.descripcionArticulo;
        let nroItem = this.parametros.filtro.nroItem;

        const codArt = this.parametros.filtro.codArticulo;

        if (this.filtroItem) {
            const texto = (this.filtroItem.item ?? '').toString().trim();
            if (this.filtroItem.tipoBusqueda === TipoBusqueda.ARTICULO && texto) {
                descArticulo = texto;
                nroItem = undefined;
            } else if (this.filtroItem.tipoBusqueda === TipoBusqueda.NROITEM && texto) {
                nroItem = +texto;
                descArticulo = undefined;
            } else {
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
        this.form?.reset();
        this.filtroItemsComponent?.limpiar();
        this.filtroItem = { tipoBusqueda: TipoBusqueda.NROITEM, item: '' };
        this.parametros.pagina = 0;
        this.parametros.filtro = {};
        this.parametros.order = this.ordenInicial;
        this.parametros.sort = this.columnaOrdenInicial;
        this.ajustes = [];
        this.total = 0;
        this.snapshotGenericService.clear(VerAjustesComponent.SNAPSHOT_KEY);
        this.obtenerTiposEstado();

        this.actualizarFiltrosYBuscar();

    }

    protected obtenerAcciones(item: ItemOrdenCompraDTO): AccionBoton[] {
        const acciones: AccionBoton[] = [];
        return acciones;
    }

    verAjustesItem(item: ItemOrdenCompraDTO): void {
        this.router.navigate(['ordenes', item.idItem, 'ajustes'], { relativeTo: this.route });
    }

    volver(): void {
        const rutaBase = this.esUsuarioProveedor ? '/entregas/seguimiento-proveedor' : '/entregas/seguimiento-organismo';

        if (this.consultaParaItem) {
            const comandos = this.idOrdenCompra
                ? [`${rutaBase}/ordenes`, this.idOrdenCompra, 'items']
                : [rutaBase];
            this.router.navigate(comandos, { queryParams: { volver: '1' } });
            return;
        }

        this.router.navigate([rutaBase], { queryParams: { volver: '1' } });
    }


    private guardarFiltro(): void {
        this.snapshotGenericService.save(
            VerAjustesComponent.SNAPSHOT_KEY,
            this.parametros
        );
    }

    private buscarVolver(): void {
        const snap = this.snapshotGenericService.load<any>(VerAjustesComponent.SNAPSHOT_KEY);

        this.filtroItem = { tipoBusqueda: TipoBusqueda.NROITEM, item: '' };

        if (snap) {
            this.parametros = snap;
            this.form.patchValue({
                estado: snap.filtro.estado
            });


            if (snap.filtro.nroItem || snap.filtro.descripcionArticulo) {
                this.parametros.filtro ??= {};
                this.parametros.filtro.descripcionArticulo = snap.filtro.descripcionArticulo;
                this.parametros.filtro.nroItem = snap.filtro.nroItem;
                this.filtroItem = {
                    tipoBusqueda: snap.filtro.nroItem ? TipoBusqueda.NROITEM : TipoBusqueda.ARTICULO,
                    item: snap.filtro.nroItem ?? snap.filtro.descripcionArticulo
                };
            }
            this.parametros.tamanoPagina = snap.tamanoPagina ?? 10;
            this.parametros.pagina = snap.pagina ?? 0;
            this.parametros.sort = snap.sort ?? this.columnaOrdenInicial;
            this.parametros.order = snap.order ?? this.ordenInicial;
        }

        setTimeout(() => {
            this.buscar();
        }, 200);

    }

    private obtenerOrdenCompra() {
        if (this.idOrdenCompra) {
            this.ordenCompraService.obtenerPorId(this.idOrdenCompra, this.tipoUsuario).subscribe({
                next: (ordenCompra: IOrdenCompraDTO) => {
                    this.ordenCompra = ordenCompra;
                }
            });
        }
    }

    private obtenerItemOrdenCompra() {
        if (this.idItem && this.idVariacion) {
            this.itemOrdenCompraService.obtenerItemOrdenCompra(this.idOrdenCompra, this.idItem, this.idVariacion, this.tipoUsuario).subscribe((itemOrdenCompra: IItemOrdenCompraDTO) => {
                this.itemOrdenCompra = itemOrdenCompra;
            });
        }
    }

    private obtenerIdsParametrosRuta() {
        const idItemParam = this.route.snapshot.paramMap.get('idItemOrdenCompra');
        const idVariacionParam = this.route.snapshot.paramMap.get('idVariacion');
        const idOc = this.route.snapshot.paramMap.get('idOrdenCompra');
        this.idItem = idItemParam ? +idItemParam : undefined;
        this.idVariacion = idVariacionParam ? +idVariacionParam : undefined;
        this.idOrdenCompra = idOc ? +idOc : undefined;
    }

    protected descripcionEstado(estado: EstadoAjuste | undefined): string {
        return this.tiposEstadoBase.find(tipo => tipo.id === estado)?.nombre ?? 'Desconocido';
    }

    protected origenSolicitud(tipoSolicitante: TipoUsuario | undefined): string {
        switch (tipoSolicitante) {
            case TipoUsuario.PROVEEDOR:
                return 'Proveedor';
            case TipoUsuario.ORGANISMO:
                return 'Organismo';
            default:
                return 'Organismo';
        }
    }


    esOriginadorDelAjuste(ajuste: IAjusteDTO): boolean {
        return ajuste.usuarioSolicitante?.id == this.seguridadService.obtenerUsuarioLogueado();
    }

    puedeAgregarAjuste(): boolean {
        return ((
                (this.tipoUsuario === TipoUsuario.ORGANISMO &&
                this.seguridadService.tienePermiso('GC_AJUSTES_ORDE.ALTA')) ||
                this.tipoUsuario === TipoUsuario.PROVEEDOR
                )
                &&
                (
                    (this.consultaParaItem &&
                    (!!this.itemOrdenCompra?.puedeAgregarAjusteAnulacion ||
                    !!this.itemOrdenCompra?.puedeAgregarAjusteCantidad ||
                    !!this.itemOrdenCompra?.puedeAgregarAjusteFecha))
                    ||
                    (!this.consultaParaItem &&
                    (!!this.ordenCompra?.puedeAgregarAjusteAnulacion ||
                    !!this.ordenCompra?.puedeAgregarAjustePuntoRecepcion ||
                    !!this.ordenCompra?.puedeAgregarAjusteFecha))
                )
                );
    }

    puedeEliminarAjuste(ajuste: IAjusteDTO): boolean {
        return this.esOriginadorDelAjuste(ajuste) &&
            ajuste.estado === EstadoAjuste.EN_PROCESO &&
            ((this.tipoUsuario === TipoUsuario.ORGANISMO && this.seguridadService.tienePermiso('GC_AJUSTES_ORDE.BAJA')) ||
                this.tipoUsuario === TipoUsuario.PROVEEDOR);
    }

    puedeModificarAjuste(ajuste: IAjusteDTO): boolean {
        return this.esOriginadorDelAjuste(ajuste) &&
            ajuste.estado === EstadoAjuste.EN_PROCESO &&
            ((this.tipoUsuario === TipoUsuario.ORGANISMO && this.seguridadService.tienePermiso('GC_AJUSTES_ORDE.MODIFICACION')) ||
                this.tipoUsuario === TipoUsuario.PROVEEDOR);
    }

    puedeAprobarAjuste(ajuste: IAjusteDTO): boolean {
        return this.tipoUsuario === TipoUsuario.ORGANISMO &&
            ajuste.estado === EstadoAjuste.PENDIENTE_APROBACION &&
            this.seguridadService.tienePermiso('GC_AJUSTES_ORDE.APROBACION');
    }

    puedeRealizarDescargo(ajuste: IAjusteDTO): boolean {
        return this.tipoUsuario === TipoUsuario.PROVEEDOR &&
            ajuste.estado === EstadoAjuste.RECHAZADO;
    }

    private obtenerDatosOCeItem(): Observable<{ ordenCompra: IOrdenCompraDTO | null; itemOrdenCompra: IItemOrdenCompraDTO | null }> {
        const orden$ = this.idOrdenCompra? this.ordenCompraService.obtenerPorId(this.idOrdenCompra, this.tipoUsuario): of(null);

        const item$ = this.consultaParaItem && this.idOrdenCompra !== undefined && this.idItem !== undefined && this.idVariacion !== undefined
                    ? this.itemOrdenCompraService.obtenerItemOrdenCompra( this.idOrdenCompra, this.idItem, this.idVariacion, this.tipoUsuario )
                : of(null);

        return forkJoin({ ordenCompra: orden$, itemOrdenCompra: item$ });
    }

    private actualizarOCeItemYEjecutarAccion(accion: () => void): void {
        this.obtenerDatosOCeItem().subscribe({
            next: ({ ordenCompra, itemOrdenCompra }) => {
                if (ordenCompra) {
                    this.ordenCompra = ordenCompra;
                }
                if (itemOrdenCompra) {
                    this.itemOrdenCompra = itemOrdenCompra;
                }
                accion();
            },
            error: (err) => {
                Logger.logError('Error al actualizar los datos de oc e ítem', err);
                this.actualizarService.mensajeError('No fue posible obtener los datos actualizados.');
            }
        });
    }

    agregarAjuste(): void {
        this.actualizarOCeItemYEjecutarAccion(() => {
            const modalRef = this.abrirPopupGrande(AgregarModificarAjustePopupComponent, undefined,
                {
                    initialState: {
                        modo: 'agregar',
                        consultaParaItem: this.consultaParaItem,
                        tipoUsuario: this.tipoUsuario,
                        ordenCompra: this.ordenCompra,
                        itemOrdenCompra: this.consultaParaItem ? this.itemOrdenCompra : undefined,
                        ajustesPendientes: this.ajustes,
                    }
                }
            ) as AgregarModificarAjustePopupComponent | undefined;

            modalRef?.ajusteGuardado?.subscribe((dto: IAjusteDTO) => this.guardarAjuste(dto, modalRef, false));
        }, );
    }

    modificarAjuste(ajuste: IAjusteDTO): void {
        if (!ajuste) {
            Logger.logError('No se puede modificar un ajuste sin datos');
            return;
        }

        this.actualizarOCeItemYEjecutarAccion(() => {
            const modalRef = this.abrirPopupGrande(AgregarModificarAjustePopupComponent, undefined,
                {
                    initialState: {
                        modo: 'modificar',
                        consultaParaItem: this.consultaParaItem,
                        tipoUsuario: this.tipoUsuario,
                        ordenCompra: this.ordenCompra,
                        itemOrdenCompra: this.consultaParaItem ? this.itemOrdenCompra : ajuste.itemOrdenCompra,
                        ajuste,
                        ajustesPendientes: this.ajustes,
                    }
                }
            ) as AgregarModificarAjustePopupComponent | undefined;

            modalRef?.ajusteGuardado?.subscribe((dto: IAjusteDTO) => this.guardarAjuste(dto, modalRef, true));
        });
    }

    guardarAjuste(ajuste: IAjusteDTO, popupComponent: AgregarModificarAjustePopupComponent, modificar: boolean): void {
        this.actualizarService.capturarErrores = false;
        if (modificar) {
            this.ajustesService.modificarAjuste(ajuste, this.tipoUsuario).subscribe({
                next: () => {
                    //Mensaje distinto para modificar?
                    if (this.tipoUsuario === TipoUsuario.PROVEEDOR) {
                        this.actualizarService.mensajeCorrecto('Su solicitud está pendiente de aprobación por parte del comprador');
                    } else {
                        this.actualizarService.mensajeCorrecto('Se ha modificado el ajuste de forma exitosa');
                    }
                    popupComponent.cerrarPopup();
                    this.buscar();
                },
                error: (error) => {
                    popupComponent.procesarError(error);
                }
            });
        } else {
            this.ajustesService.crearAjuste(ajuste, this.tipoUsuario).subscribe({
                next: () => {
                    if (this.tipoUsuario === TipoUsuario.PROVEEDOR) {
                        this.actualizarService.mensajeCorrecto('Su solicitud está pendiente de aprobación por parte del comprador');
                    } else {
                        this.actualizarService.mensajeCorrecto('Se ha creado el ajuste de forma exitosa');
                    }
                    popupComponent.cerrarPopup();
                    this.buscar();
                },
                error: (error) => {
                    popupComponent.procesarError(error);
                }
            });
        }
    }

    eliminarAjuste(ajuste: IAjusteDTO): void {
        this.actualizarService.confirmar(`¿Está seguro que desea eliminar el ajuste?`,
            () => {
                this.actualizarService.capturarErrores = true;
                if (ajuste.idAjuste) {
                    this.ajustesService.eliminarAjuste(ajuste.idAjuste, this.tipoUsuario).subscribe(() => {
                        this.actualizarService.mensajeCorrecto('Se ha eliminado el ajuste de forma exitosa');
                        this.buscar();
                    });
                } else {
                    Logger.logError('Error al eliminar ajuste: ID de ajuste no válido');
                }
            });
    }

    aprobarAjuste(ajuste: IAjusteDTO): void {
        if (!ajuste) {
            Logger.logError('No se puede modificar un ajuste sin identificador');
            return;
        }

        this.ajusteEnResolucion = ajuste;
        this.actualizarOCeItemYEjecutarAccion(() => {
            const modalRef = this.abrirPopupGrande(ResolucionAjustePopupComponent, undefined, {
                initialState: {
                    ajuste: ajuste,
                    ordenCompra: this.ordenCompra,
                    itemOrdenCompra: this.itemOrdenCompra,
                    tipoUsuario: this.tipoUsuario,
                    consultaParaItem: this.consultaParaItem
                }
            });

            modalRef?.aprobarEvento?.subscribe((dto: IAjusteDTO) => {
                this.procesarResolucionAjuste(dto, "Ajuste aprobado en forma exitosa.", EstadoAjuste.APROBADO);
            });

            modalRef?.rechazarEvento?.subscribe((dto: IAjusteDTO) => {
                this.procesarResolucionAjuste(dto, "Ajuste rechazado en forma exitosa.", EstadoAjuste.RECHAZADO);
            });
        });
    }

    private procesarResolucionAjuste(dto: IAjusteDTO | undefined, mensaje: string, estadoEsperado: EstadoAjuste) {
        this.cerrarPopup();
        const ajusteBase = this.ajusteEnResolucion ?? {};
        const estadoFinal = dto?.estado ?? estadoEsperado;
        const tipoFinal = dto?.tipoAjuste ?? ajusteBase.tipoAjuste;
        const ajusteResultado: IAjusteDTO = {
            ...ajusteBase,
            ...dto,
            estado: estadoFinal,
            tipoAjuste: tipoFinal
        };
        const esAnulacionAprobada = estadoFinal === EstadoAjuste.APROBADO &&
            (tipoFinal === TipoAjuste.ITEM_ANULAR || tipoFinal === TipoAjuste.OC_ANULAR);
        setTimeout(() => {
            this.actualizarService.mensajeOcultar();
            setTimeout(() => {
                if (estadoFinal === EstadoAjuste.APROBADO) {
                    this.actualizarService.mensajeCorrecto(mensaje);
                    if (esAnulacionAprobada) {
                        this.ajusteEnResolucion = undefined;
                        this.volver();
                        return;
                    }
                } else if (estadoFinal === EstadoAjuste.ENVIADO_APROBACION) {
                    this.actualizarService.mensajeAdvertencia("No fue posible dar de alta el ajuste en SICE, se volverá a intentar en forma automatica. Mientras tanto no sera posible operar con el ajuste.")
                }
                this.buscar();
            }, 100);
        });
        if (!esAnulacionAprobada && ajusteResultado.idAjuste !== undefined) {
            this.buscar();
        }
        this.ajusteEnResolucion = undefined;
    }

    realizarDescargo(ajuste: IAjusteDTO): void {
        if (!ajuste) {
            Logger.logError('No se puede realizar un descargo de un ajuste sin identificador');
            return;
        }

        this.actualizarOCeItemYEjecutarAccion(() => {
            const modalRef = this.abrirPopupGrande(AgregarDescargoAjustePopupComponent, undefined,
                {
                    initialState: {
                        ajuste: ajuste,
                        ordenCompra: this.ordenCompra,
                        itemOrdenCompra: this.itemOrdenCompra
                    },
                }
            );

            modalRef?.descargoAgregado?.subscribe((dto: IDescargoDTO) => {
                this.cerrarPopup();
                setTimeout(() => this.actualizarService.mensajeOcultar(), 100);
                setTimeout(() => this.actualizarService.mensajeCorrecto("Descargo agregado en forma exitosa."), 250);
              
                if (dto.idAjuste !== undefined) {
                    this.buscar();
                }
            });
        });
    }

    obtenerAccionesAjuste(ajuste: IAjusteDTO): AccionBoton[] {
        const acciones: AccionBoton[] = [];

        if (this.puedeModificarAjuste(ajuste)) {
            acciones.push({
                nombre: 'Modificar',
                ariaLabel: "Modificar ajuste id " + ajuste.idAjuste,
                clase: 'btn btn-success btn-ancho-fijo-wider-lg',
                icono: 'fa fa-edit',
                permisos: this.tipoUsuario === TipoUsuario.ORGANISMO ? ['GC_AJUSTES_ORDE.MODIFICACION'] : [],
                accion: () => this.modificarAjuste(ajuste),
            });
        }

        if (this.puedeEliminarAjuste(ajuste)) {
            acciones.push({
                nombre: 'Eliminar',
                ariaLabel: "Eliminar ajuste id " + ajuste.idAjuste,
                clase: 'btn btn-primary',
                icono: 'fa fa-trash',
                permisos: this.tipoUsuario === TipoUsuario.ORGANISMO ? ['GC_AJUSTES_ORDE.BAJA'] : [],
                accion: () => this.eliminarAjuste(ajuste),
            });
        }

        if (this.puedeAprobarAjuste(ajuste)) {
            acciones.push({
                nombre: 'Aprobar',
                ariaLabel: "Aprobar ajuste id " + ajuste.idAjuste,
                clase: 'btn btn-success btn-ancho-fijo-wider-lg',
                icono: 'fa fa-check',
                permisos: ['GC_AJUSTES_ORDE.APROBACION'],
                accion: () => this.aprobarAjuste(ajuste),
            });
        }

        if (this.puedeRealizarDescargo(ajuste)) {
            acciones.push({
                nombre: 'Realizar descargo',
                ariaLabel: "Realizar descargo ajuste id " + ajuste.idAjuste,
                clase: 'btn btn-success btn-ancho-fijo-wider-lg',
                icono: 'fa fa-sticky-note-o',
                permisos: [],
                accion: () => this.realizarDescargo(ajuste),
            });
        }

        return acciones;
    }

    get labelAccionAgregarAjuste(): string {
        return this.consultaParaItem ? 'Agregar ajuste ítem' : 'Agregar ajuste OC';
    }
}


