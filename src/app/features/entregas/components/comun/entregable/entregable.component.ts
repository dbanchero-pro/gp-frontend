import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { IOrdenCompraDTO } from 'src/app/features/entregas/models/orden-ompra.model';
import { FormularioBaseComponent } from 'src/app/shared/components/base/formulario-base.component';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { Logger } from 'src/app/shared/utils/logger';
import { EstadoEntregable } from '../../../enum/estado-entregable.enum';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { IEntregaDTO } from '../../../models/entrega.model';
import { IEntregableDTO } from '../../../models/entregable.model';
import { EntregaService } from '../../../services/entrega.service';
import { EntregableService } from '../../../services/entregable.service';
import { AgregarModificarEntregaObraPopupComponent } from '../../seguimiento/agregar-modificar-entrega-obra-popup/agregar-modificar-entrega-obra-popup.component';
import { AgregarModificarEntregablePopupComponent } from '../../seguimiento/agregar-modificar-entregable-popup/agregar-modificar-entregable-popup.component';


@Component({
    selector: 'app-entregable',
    templateUrl: './entregable.component.html',
    styleUrl: './entregable.component.scss',
    standalone: false
})

export class EntregableComponent extends FormularioBaseComponent implements OnInit {
    @Input() entregable!: IEntregableDTO;
    @Input() ordenCompra!: IOrdenCompraDTO;
    @Input() itemOrdenCompra!: ItemOrdenCompraDTO;
    @Input() usuarioLogueadoTienePermisosRecepcion?: boolean;

    @Output() actualizarEvento = new EventEmitter<{ idEntregable?: number }>();
    @Output() seleccionado = new EventEmitter<IEntregaDTO>();


    tipoUsuario!: TipoUsuario;
    TipoUsuario = TipoUsuario;
    TipoUnidad = TipoUnidad;
    EstadoEntregable = EstadoEntregable;

    recCol: boolean = false;
    confCol: boolean = false;

    tienePermisoRecepcion: boolean = false;

    constructor(
        private readonly seguridadService: SeguridadService,
        private readonly entregaService: EntregaService,
        private readonly entregableService: EntregableService,
        private readonly ordenCompraService: OrdenCompraService
    ) {
        super();
    }

    ngOnInit(): void {
        this.tipoUsuario = this.seguridadService.obtenerTipoUsuario();

        if (this.tipoUsuario === TipoUsuario.PROVEEDOR) {
            this.tienePermisoRecepcion = false;
        } else if (this.usuarioLogueadoTienePermisosRecepcion === undefined) {
            this.ordenCompraService.usuarioLogueadoTienePermisosRecepcion(this.ordenCompra.idOC).subscribe((tienePermiso: boolean) => {
                this.tienePermisoRecepcion = tienePermiso;
            });
        } else {
            this.tienePermisoRecepcion = this.usuarioLogueadoTienePermisosRecepcion;
        }
    }

    //Obtener acciones
    obtenerAccionesEntregable(): AccionBoton[] {
        const acciones: AccionBoton[] = [];

        if (!!this.itemOrdenCompra && !this.itemOrdenCompra.tieneAjustesBloqueantes) {
            if ((this.tipoUsuario === TipoUsuario.ORGANISMO)
                && (!this.entregable.entregas || this.entregable.entregas?.length === 0)) {
                acciones.push({
                    nombre: 'Modificar entregable',
                    ariaLabel: "Modificar entregable id " + this.entregable.idEntregable,
                    clase: 'btn btn-success btn-ancho-fijo-wider',
                    icono: 'fa fa-edit',
                    permisos: ['GC_GESTION_ENTR.MODIFICACION'],
                    accion: () => this.abrirPopupModificarEntregable()
                });
                acciones.push({
                    nombre: 'Eliminar entregable',
                    ariaLabel: "Eliminar entregable id " + this.entregable.idEntregable,
                    clase: 'btn btn-primary btn-ancho-fijo-wider',
                    icono: 'fa fa-trash',
                    permisos: ['GC_GESTION_ENTR.BAJA'],
                    accion: () => this.eliminarEntregable()
                });
            }
            if ((this.tipoUsuario == TipoUsuario.PROVEEDOR ||
                this.tienePermisoRecepcion) && this.entregableTieneCantidadSinAsignar()) {

                acciones.push({
                    nombre: 'Agregar entrega',
                    ariaLabel: "Agregar entrega a entregable id " + this.entregable.idEntregable,
                    clase: 'btn btn-success btn-ancho-fijo-custom',
                    icono: 'fa fa-plus',
                    permisos: this.tipoUsuario == TipoUsuario.PROVEEDOR ? [] : ['GC_GESTION_RECEP.ALTA'],
                    accion: () => this.abrirPopupAgregarEntrega()
                });
            }
        }

        return acciones;
    }

    // Eliminar entregable
    private eliminarEntregable(): void {
        this.actualizarService.confirmar('¿Está seguro que desea eliminar el entregable?',
            () => {
                this.entregableService.eliminarEntregable(this.entregable.idEntregable!).subscribe({
                    next: () => {
                        this.actualizarService.mensajeCorrecto('El entregable ha sido eliminado de forma exitosa.');
                        this.actualizarEntregable(this.entregable);
                    },
                    error: (error) => {
                        Logger.logError('Error al eliminar el entregable', error);
                    }
                });
            }
        );
    }

    //Abrir popups entregable y entrega
    abrirPopupModificarEntregable(): void {
        const modalConfig = {
            initialState: {
                ordenCompra: this.ordenCompra,
                itemOrdenCompra: this.itemOrdenCompra,
                entregableModificar: this.entregable,
                esModificacion: true,
                titulo: 'Modificar entregable'
            }
        };

        const modalRef = this.abrirPopup(AgregarModificarEntregablePopupComponent, undefined, modalConfig);
        modalRef.guardarEvento.subscribe((entregableModificado: IEntregableDTO) => {
            this.modificarEntregable(entregableModificado, modalRef);
        });
    }

    abrirPopupAgregarEntrega(): void {
        const modalConfig = {
            initialState: {
                itemOrdenCompra: this.itemOrdenCompra,
                ordenCompra: this.ordenCompra,
                entregable: this.entregable,
                esModificacion: false,
                titulo: 'Agregar entrega'

            },
            backdrop: true,
            ignoreBackdropClick: true,
            class: 'modal-lg'
        };

        const modalRef = this.abrirPopupGrande(AgregarModificarEntregaObraPopupComponent, undefined, modalConfig);

        modalRef.guardarEvento.subscribe((entregaGuardada: any) => {
            this.agregarEntrega(entregaGuardada, this.entregable, modalRef);
        });
    }

    //Operaciones invocación a servicios entregable y entrega
    private modificarEntregable(entregableModificado: IEntregableDTO, popupComponent: AgregarModificarEntregablePopupComponent): void {
        this.actualizarService.capturarErrores = false;
        this.entregableService.modificarEntregable(entregableModificado.idEntregable!, entregableModificado).subscribe({
            next: () => {
                this.actualizarService.mensajeCorrecto('El entregable se ha guardado de forma exitosa.');
                this.entregable = entregableModificado;
                this.actualizarEntregable(entregableModificado);
                this.cerrarPopup();
            },
            error: (error) => {
                popupComponent.mostrarError(error);
            },
        });

    }

    seleccionarEntrega(entrega: any) {
        this.seleccionado.emit(entrega);
    }

    private agregarEntrega(entregaGuardada: any, entregable: IEntregableDTO, popupComponent: AgregarModificarEntregaObraPopupComponent): void {
        this.actualizarService.capturarErrores = false;
        this.entregaService.crearEntrega(entregaGuardada, this.tipoUsuario).subscribe({
            next: () => {
                this.actualizarService.mensajeCorrecto('La entrega ha sido agregada de forma exitosa.');
                this.actualizarEntregable(entregable);
                popupComponent?.cerrarPopup();
            },
            error: (error) => {
                popupComponent?.mostrarError(error, 'Error al agregar la entrega');
            },
        });

    }

    //Funciones internas
    actualizarEntregable(entregable: IEntregableDTO): void {
        this.actualizarEvento.emit({ idEntregable: entregable.idEntregable });
    }

    obtenerCantidadEntregasPendientes(entregable: IEntregableDTO): number {
        return entregable.entregas!.filter(e => e.cantidadRecepcionAceptada != e.cantidad).length;
    }

    cantidadesPendienteEntrega(): string {
        return this.entregableService.cantidadesPendienteEntrega(this.entregable, this.itemOrdenCompra);
    }

    entregableTieneCantidadSinAsignar() {
        if (this.entregable) {
            this.entregable.itemOrdenCompra = this.itemOrdenCompra;
        }
        return this.entregableService.entregableTieneCantidadSinAsignar(this.entregable);
    }

    fechaEntregaParaProveedor(): boolean {
        if (this.entregable.proximoAVencerse && this.seguridadService.obtenerTipoUsuario() === TipoUsuario.PROVEEDOR) {
            return true;
        }

        return false;
    }

    obtenerCantidadEntregable(entregable: IEntregableDTO): string {
        return this.entregableService.obtenerCantidadEntregable(entregable, this.itemOrdenCompra);
    }
}
