import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { FormularioBaseComponent } from 'src/app/shared/components/base/formulario-base.component';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { Logger } from 'src/app/shared/utils/logger';
import { EstadoEntrega } from '../../../enum/estado-entrega.enum';
import { TipoArticuloServObra } from '../../../enum/tipo-articulo-serv-obra';
import { IDescargoDTO } from '../../../models/descargo.model';
import { IEntregaDTO } from '../../../models/entrega.model';
import { IEntregableDTO } from '../../../models/entregable.model';
import { ItemOrdenCompraDTO } from '../../../models/item-orden-compra.model';
import { IOrdenCompraDTO } from '../../../models/orden-ompra.model';
import { EntregaService } from '../../../services/entrega.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { ConformidadEntregaPopupComponent } from '../../conformidad/conformidad-entrega-popup/conformidad-entrega-popup.component';
import { AgregarDescargoEntregaPopupComponent } from '../../descargo/agregar-descargo-entrega-popup/agregar-descargo-entrega-popup.component';
import { RecepcionEntregaPopupComponent } from '../../recepcion/recepcion-entrega-popup/recepcion-entrega-popup.component';
import { AgregarModificarEntregaBienPopupComponent } from '../../seguimiento/agregar-modificar-entrega-bien-popup/agregar-modificar-entrega-bien-popup.component';
import { AgregarModificarEntregaObraPopupComponent } from '../../seguimiento/agregar-modificar-entrega-obra-popup/agregar-modificar-entrega-obra-popup.component';

@Component({
    selector: 'app-entrega',
    templateUrl: './entrega.component.html',
    styleUrl: './entrega.component.scss',
    standalone: false
})

export class EntregaComponent extends FormularioBaseComponent implements OnInit {
    @Input() entregable!: IEntregableDTO;
    @Input() entrega!: IEntregaDTO;
    @Input() ordenCompra!: IOrdenCompraDTO;
    @Input() itemOrdenCompra!: ItemOrdenCompraDTO;
    @Output() actualizarEvento = new EventEmitter<{ idEntrega: number, idItem?: number }>();
    @Output() seleccionado = new EventEmitter<IEntregaDTO>();
    @Input() usuarioLogueadoTienePermisosRecepcion?: boolean = undefined;

    esUsuarioProveedor: boolean = false;
    tipoUsuario: TipoUsuario = TipoUsuario.ORGANISMO;
    EstadoEntrega = EstadoEntrega;

    etiquetaCantidad: string = '';
   
    tienePermisoRecepcion: boolean = false;
    
    constructor(
        private readonly seguridadService: SeguridadService,
        private readonly entregaService: EntregaService,
        private readonly documentosUtilService: DocumentosUtilService,
        private readonly ordenCompraService: OrdenCompraService,
        private readonly itemOrdenCompraService: ItemOrdenCompraService
    ) {
        super();
    }

    ngOnInit(): void {
        this.tipoUsuario = this.seguridadService.obtenerTipoUsuario();
        this.esUsuarioProveedor = this.seguridadService.usuarioLogueadoEsUsuarioProveedor();

        if (this.entrega.entregable) {
            this.etiquetaCantidad = "Cantidad";
        }
        else {
            this.etiquetaCantidad = "Cantidad prevista";
        }
        if (this.tipoUsuario === TipoUsuario.ORGANISMO) {
            if (this.usuarioLogueadoTienePermisosRecepcion === undefined) {
                this.ordenCompraService.usuarioLogueadoTienePermisosRecepcion(this.ordenCompra.idOC).subscribe((tienePermiso: boolean) => {
                    this.tienePermisoRecepcion = tienePermiso;
                });
            } else {
                this.tienePermisoRecepcion = this.usuarioLogueadoTienePermisosRecepcion;
            }
        } else {
            this.tienePermisoRecepcion = false;
        }
    }

    sePuedeGestionarEntregasYRecepcionar(): boolean {
        return ((this.tipoUsuario === TipoUsuario.PROVEEDOR ||
                (this.tipoUsuario === TipoUsuario.ORGANISMO
                && this.tienePermisoRecepcion))
                && this.tieneSoloEntrega());
    }

    //Obtener acciones
    obtenerAccionesEstadoEntrega(acciones: AccionBoton[]) {

        if (this.sePuedeGestionarEntregasYRecepcionar()){
             if (this.entrega.puedeRecepcionEntregas! && this.tipoUsuario === TipoUsuario.ORGANISMO) {
                    acciones.push({
                        nombre: 'Recepcionar',
                        ariaLabel: "Recepcionar entrega id " + this.entrega.idEntrega,
                        clase: 'btn btn-success btn-ancho-fijo-wider-lg',
                        icono: 'fa fa-retweet',
                        permisos: ['GC_GESTION_RECEP.ALTA'],
                        accion: () => this.abrirPopupAgregarModificarRecepcion(false),
                    });
            }

             if (this.entrega.itemOrdenCompra?.tipoArticulo === TipoArticuloServObra.ARTICULO) {
                    acciones.push({
                        nombre: 'Modificar entrega',
                        ariaLabel: "Modificar entrega id " + this.entrega.idEntrega,
                        clase: 'btn btn-success btn-ancho-fijo-wider-lg',
                        icono: 'fa fa-edit',
                        permisos: this.tipoUsuario === TipoUsuario.PROVEEDOR ? [] : ['GC_GESTION_RECEP.MODIFICACION'],
                        accion: () => this.abrirPopupAgregarModificarEntrega()
                    });
                }
                else {
                    acciones.push({
                        nombre: 'Modificar entrega',
                        ariaLabel: "Modificar entrega id " + this.entrega.idEntrega,
                        clase: 'btn btn-success btn-ancho-fijo-wider-lg',
                        icono: 'fa fa-edit',
                        permisos: this.tipoUsuario === TipoUsuario.PROVEEDOR ? [] : ['GC_GESTION_RECEP.MODIFICACION'],
                        accion: () => this.abrirPopupModificarEntregaObra()
                    });
                }
                
                acciones.push({
                    nombre: 'Eliminar entrega',
                    ariaLabel: "Eliminar entrega id " + this.entrega.idEntrega,
                    clase: 'btn btn-primary',
                    icono: 'fa fa-trash',
                    permisos: this.tipoUsuario === TipoUsuario.PROVEEDOR ? [] : ['GC_GESTION_RECEP.BAJA'],
                    accion: () => this.eliminarEntrega(),
                });

        }

        this.accionesSiTieneSoloRecepcion(acciones);

    }

    accionesSiTieneSoloRecepcion(acciones: AccionBoton[]) {
        if (this.tipoUsuario === TipoUsuario.ORGANISMO && this.tieneSoloRecepcion() && this.entrega.cantidadRecepcionAceptada != 0) {
            if (this.entrega.puedeConformidadEntregas) {
                acciones.push({
                    nombre: 'Dar conformidad',
                    ariaLabel: "Dar conformidad entrega id " + this.entrega.idEntrega,
                    clase: 'btn btn-success btn-ancho-fijo-wider-lg',
                    icono: 'fa fa-check-circle',
                    permisos: ['GC_GESTION_CONF.ALTA'],
                    accion: () => this.abrirPopupAgregarModificarConformidad(false),
                });
            }
        }
    }

    obtenerAccionesEstadoRecepcion(acciones: AccionBoton[]) {
        if (this.tipoUsuario === TipoUsuario.ORGANISMO && this.tieneRecepcion() && !this.tieneConformidad()) {
            if (this.entrega.puedeRecepcionEntregas) {
                acciones.push({
                    nombre: 'Modificar recepción',
                    ariaLabel: "Modificar recepción entrega id " + this.entrega.idEntrega,
                    clase: 'btn btn-success btn-ancho-fijo-wider-lg',
                    icono: 'fa fa-edit',
                    permisos: ['GC_GESTION_RECEP.MODIFICACION'],
                    accion: () => this.abrirPopupAgregarModificarRecepcion(true),
                });

                acciones.push({
                    nombre: 'Eliminar recepción',
                    ariaLabel: "Eliminar recepción entrega id " + this.entrega.idEntrega,
                    clase: 'btn btn-primary',
                    icono: 'fa fa-trash',
                    permisos: ['GC_GESTION_RECEP.BAJA'],
                    accion: () => this.eliminarRecepcion(),
                });
            }

        }
    }

    obtenerAccionesEstadoConformidad(acciones: AccionBoton[]) {
        if (this.tipoUsuario === TipoUsuario.ORGANISMO && this.tieneConformidad() && this.entrega.puedeConformidadEntregas) {
            acciones.push({
                nombre: 'Modificar conformidad',
                ariaLabel: "Modificar conformidad entrega id " + this.entrega.idEntrega,
                clase: 'btn btn-success btn-ancho-fijo-wider-lg',
                icono: 'fa fa-edit',
                permisos: ['GC_GESTION_CONF.MODIFICACION'],
                accion: () => this.abrirPopupAgregarModificarConformidad(true),
            });

            acciones.push({
                nombre: 'Eliminar conformidad',
                ariaLabel: "Eliminar conformidad entrega id " + this.entrega.idEntrega,
                clase: 'btn btn-primary',
                icono: 'fa fa-trash',
                permisos: ['GC_GESTION_CONF.BAJA'],
                accion: () => this.eliminarConformidad(),
            });
        }
    }

    obtenerAcciones(): AccionBoton[] {
        let acciones: AccionBoton[] = [];

        if (!!this.itemOrdenCompra && !this.itemOrdenCompra.tieneAjustesBloqueantes) {
            this.obtenerAccionesEstadoEntrega(acciones);
            this.obtenerAccionesEstadoRecepcion(acciones);
            this.obtenerAccionesEstadoConformidad(acciones);
        }
        
        // Descargos
        if (this.tipoUsuario === TipoUsuario.PROVEEDOR
            && this.entregaService.tieneRechazosUObservaciones(this.entrega)) {
            acciones.push({
                nombre: 'Realizar descargo',
                ariaLabel: "Realizar descargo entrega id " + this.entrega.idEntrega,
                clase: 'btn btn-success btn-ancho-fijo-wider-lg',
                icono: 'fa fa-sticky-note-o',
                accion: () => this.abrirPopupAgregarDescargo(),
            });
        }

        return acciones;
    }

    seleccionar(entrega: IEntregaDTO, seleccionado: boolean): void {
        entrega.seleccionado = seleccionado;
        this.seleccionado.emit(entrega);
    }

    // Eliminar entrega, recepción y conformidad
    eliminarEntrega(): void {
        this.actualizarService.confirmar('¿Está seguro que desea eliminar la entrega: Identificador ' + this.entrega.idEntrega + '?',
            () => {
                this.actualizarService.capturarErrores = true;
                if (this.entrega?.idEntrega) {
                    this.entregaService.eliminarEntrega(this.entrega.idEntrega, this.tipoUsuario).subscribe(() => {
                        this.actualizarService.mensajeCorrecto('Se ha eliminado la entrega de forma exitosa');
                        this.actualizarEvento.emit({ idEntrega: this.entrega.idEntrega!, idItem: this.itemOrdenCompra?.idItem });
                    });
                } else {
                    Logger.logError('Error al eliminar entrega: ID de entrega no válido');
                }
            });
    }

    private eliminarRecepcion(): void {
        this.eliminarRecepcionConformidad(true, (id: number) => {
            return this.entregaService.eliminarRecepcion(id);
        });
    }

    private eliminarConformidad(): void {
        this.eliminarRecepcionConformidad(false, (id: number) => {
            return this.entregaService.eliminarConformidad(id);
        });
    }

    private eliminarRecepcionConformidad(esRecepcion: boolean, accion: (id: number) => Observable<IEntregaDTO>): void {
        const textoAccion = esRecepcion ? 'recepción' : 'conformidad';
        this.actualizarService.confirmar('¿Está seguro que desea eliminar la ' + textoAccion + ' de la entrega con identificador ' + this.entrega.idEntrega + '?',
            () => {
                if (this.entrega?.idEntrega) {
                    this.actualizarService.capturarErrores = true;
                    accion(this.entrega.idEntrega).subscribe(() => {
                        this.actualizarService.mensajeCorrecto('La ' + textoAccion + ' se ha eliminado de forma exitosa');
                        this.actualizarEvento.emit({ idEntrega: this.entrega.idEntrega!, idItem: this.itemOrdenCompra?.idItem });
                    });
                } else {
                    Logger.logError('No se puede eliminar la ' + textoAccion + ': identififcador de entrega no válido');
                }
            });
    }

    private modificarEntrega(entregaActualizada: IEntregaDTO, popupComponent?: PopupBaseComponent): void {
        this.modificarRecepcionarDarConformidadEntrega(entregaActualizada,
            (id: number, dto: IEntregaDTO) => {
                return this.entregaService.modificarEntrega(id, dto, this.tipoUsuario);
            },
            'La entrega ha sido modificada de forma exitosa.',
            'Error al modificar la entrega', popupComponent);
    }

    private modificarRecepcionarDarConformidadEntrega(entregaActualizada: IEntregaDTO,
        accion: (id: number, dto: IEntregaDTO) => Observable<IEntregaDTO>,
        textoExito: string,
        textoError: string, popupComponent?: PopupBaseComponent): void {
        this.actualizarService.capturarErrores = false;
        if (this.entrega?.idEntrega) {

            accion(this.entrega.idEntrega, entregaActualizada).subscribe({
                next: () => {
                    this.cerrarPopup();
                    setTimeout(() => {
                        this.actualizarService.mensajeOcultar();
                        setTimeout(() => {
                            this.actualizarService.mensajeCorrecto(textoExito);
                        }, 100);
                    });
                    if (this.entrega.idEntrega !== undefined) {
                        this.actualizarEvento.emit({ idEntrega: this.entrega.idEntrega });
                    }
                },
                error: (error) => {
                    Logger.logError(textoError, error);
                    popupComponent?.procesarError(error, textoError);
                },
            });

        } else {
            Logger.logError('No se puede modificar una entrega sin identificador');
        }
    }


    //Abrir popups entrega, recepción y conformidad

    private refrescarCabezalEntrega(): Observable<{ ordenCompra: IOrdenCompraDTO | null; itemOrdenCompra: ItemOrdenCompraDTO | null }> {
        const idOC = this.ordenCompra?.idOC ?? this.itemOrdenCompra?.idOC ?? null;
        const orden$ = idOC ? this.ordenCompraService.obtenerPorId(idOC) : of(null);

        const idItem = this.itemOrdenCompra?.idItem;
        const idVariacion = this.itemOrdenCompra?.idVariacion ?? 0;
        const item$ = idOC && idItem !== undefined && idItem !== null
            ? this.itemOrdenCompraService.obtenerItemOrdenCompra(idOC, idItem, idVariacion)
            : of(null);

        return forkJoin({ ordenCompra: orden$, itemOrdenCompra: item$ });
    }

    private ejecutarConCabezalActualizado(accion: () => void, contextoError: string): void {
        this.refrescarCabezalEntrega().subscribe({
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
                Logger.logError(contextoError, err);
                this.actualizarService.mensajeError('No fue posible obtener los datos actualizados.');
            }
        });
    }

    abrirPopupAgregarDescargo(): void {
        if (!this.entrega) {
            return;
        }

        this.ejecutarConCabezalActualizado(() => {
            const modalRef = this.abrirPopupGrande(AgregarDescargoEntregaPopupComponent, undefined,
                {
                    initialState: {
                        entrega: this.entrega,
                        ordenCompra: this.ordenCompra,
                        itemOrdenCompra: this.itemOrdenCompra,
                        cantidadPendiente: this.entrega.cantidad
                    }
                }
            );

            modalRef?.descargoAgregado?.subscribe((dto: IDescargoDTO) => {
                this.actualizarEvento.emit({ idEntrega: this.entrega.idEntrega! });
            });
        }, 'Error al actualizar los datos del cabezal para el popup de descargo');
    }


    abrirPopupAgregarModificarEntrega(): void {
        if (!this.entrega) {
            return;
        }

        this.ejecutarConCabezalActualizado(() => {
            const modalRef = this.abrirPopupGrande(AgregarModificarEntregaBienPopupComponent, undefined,
                {
                    initialState: {
                        entrega: this.entrega,
                        ordenCompra: this.ordenCompra,
                        itemOrdenCompra: this.itemOrdenCompra,
                        cantidadPendiente: this.entrega.cantidad
                    }
                }
            );

            modalRef?.guardarEvento?.subscribe((dto: IEntregaDTO) => {
                this.modificarEntrega(dto, modalRef);
            });
        }, 'Error al actualizar los datos del cabezal para el popup de entrega');
    }

    abrirPopupModificarEntregaObra(): void {
        this.ejecutarConCabezalActualizado(() => {
            const modalRef = this.abrirPopupGrande(AgregarModificarEntregaObraPopupComponent, undefined,
                {
                    initialState: {
                        entregable: this.entregable ?? undefined,
                        entregaModificar: this.entrega,
                        esModificacion: true,
                        ordenCompra: this.ordenCompra,
                        itemOrdenCompra: this.itemOrdenCompra,
                        cantidadPendiente: this.entrega.cantidad
                    }
                }
            );

            modalRef?.guardarEvento?.subscribe((dto: IEntregaDTO) => {
                this.modificarEntrega(dto, modalRef);
            });
        }, 'Error al actualizar los datos del cabezal para el popup de modificación de entrega');
    }

    abrirPopupAgregarModificarRecepcion(esModificacion: boolean): void {
        if (!this.entrega) {
            return;
        }

        this.ejecutarConCabezalActualizado(() => {
            const modalRef = this.abrirPopupGrande(RecepcionEntregaPopupComponent, undefined,
                {
                    initialState: {
                        entrega: this.entrega,
                        entregable: this.entregable,
                        esModificacion: esModificacion,
                        ordenCompra: this.ordenCompra,
                        itemOrdenCompra: this.itemOrdenCompra,
                        cantidadPendiente: this.entrega.cantidad
                    },
                }
            );

            modalRef?.guardarEvento?.subscribe((dto: IEntregaDTO) => {
                if (esModificacion) { //NOSONAR
                    this.modificarRecepcionarDarConformidadEntrega(dto,
                        (id: number, dto: IEntregaDTO) => {
                            return this.entregaService.modificarRecepcion(id, dto);
                        },
                        'El recepción de entrega ha sido modificada de forma exitosa.',
                        'Error al modificar la recepción de entrega', modalRef);
                } else {
                    this.modificarRecepcionarDarConformidadEntrega(dto,
                        (id: number, dto: IEntregaDTO) => {
                            return this.entregaService.recepcionEntrega(id, dto);
                        },
                        'La recepción de entrega ha sido dada de alta de forma exitosa.',
                        'Error al modificar la recepción de entrega', modalRef);
                }
            });
        }, 'Error al actualizar los datos del cabezal para el popup de recepción');
    }


    abrirPopupAgregarModificarConformidad(esModificacion: boolean): void {
        if (!this.entrega) {
            return;
        }

        this.ejecutarConCabezalActualizado(() => {
            const modalRef = this.abrirPopupGrande(ConformidadEntregaPopupComponent, undefined,
                {
                    initialState: {
                        entrega: this.entrega,
                        esModificacion: esModificacion,
                        ordenCompra: this.ordenCompra,
                        itemOrdenCompra: this.itemOrdenCompra,
                        cantidadPendiente: this.entrega.cantidad,
                        entregable: this.entregable
                    },
                }
            );

            modalRef?.guardarEvento?.subscribe((dto: IEntregaDTO) => {
                if (esModificacion) { //NOSONAR
                    this.modificarRecepcionarDarConformidadEntrega(dto,
                        (id: number, dto: IEntregaDTO) => {
                            return this.entregaService.modificarConformidad(id, dto);
                        },
                        'El dar conformidad de entrega ha sido modificada de forma exitosa.',
                        'Error al modificar el dar conformidad de entrega', modalRef);
                } else {
                    this.modificarRecepcionarDarConformidadEntrega(dto,
                        (id: number, dto: IEntregaDTO) => {
                            return this.entregaService.darConformidadEntrega(id, dto);
                        },
                        'El dar conformidad de entrega ha sido dado de alta de forma exitosa.',
                        'Error al modificar el dar conformidad de entrega', modalRef);
                }
            });
        }, 'Error al actualizar los datos del cabezal para el popup de conformidad');
    }


    // Funciones internas
    estadoAmarillo(estado: EstadoEntrega): boolean {
        return estado === EstadoEntrega.EN_CURSO
            || estado === EstadoEntrega.EN_TRANSITO
            || estado === EstadoEntrega.EN_PREPARACION
            || estado === EstadoEntrega.ENTREGADO;
    }

    estadoRojo(estado: EstadoEntrega): boolean {
        return estado === EstadoEntrega.CONFORMIDAD_PARCIAL
            || estado === EstadoEntrega.CONFORMIDAD_RECHAZADA
            || estado === EstadoEntrega.CONFORMIDAD_PARCIAL_CON_OBSERVACION
            || estado === EstadoEntrega.ENTREGA_RECHAZADA
            || estado === EstadoEntrega.ENTREGA_PARCIAL;
    }

    estadoVerde(estado: EstadoEntrega): boolean {
        return estado === EstadoEntrega.CONFORMIDAD_EMITIDA
            || estado === EstadoEntrega.ENTREGA_ACEPTADA
            || estado === EstadoEntrega.CONFORMIDAD_EMITIDA_CON_OBSERVACION;
    }

    tieneSoloEntrega(): boolean {
        return this.entregaService.tieneSoloEntrega(this.entrega);
    }

    tieneSoloRecepcion(): boolean {
        return this.entregaService.tieneSoloRecepcion(this.entrega);
    }

    tieneConformidad(): boolean {
        return this.entregaService.tieneConformidad(this.entrega);
    }

    tieneRecepcion(): boolean {
        return this.entregaService.tieneRecepcion(this.entrega);
    }

    mostrarCheck(): boolean {
        return this.entregaService.mostrarCheck(this.entrega);
    }

    //Documentos
    descargarDocumento(documento: ArchivoDTO): void {
        this.documentosUtilService.descargarDocumento(documento, this.entrega?.idEntrega);
    }

}
