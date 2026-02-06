import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AppConfig } from 'src/app/app.config';
import { IPuntoRecepcionDTO } from 'src/app/features/administracion/puntos-recepcion/models/punto-recepcion.model';
import { ZonaDto } from 'src/app/features/administracion/puntos-recepcion/models/zona.model';
import { PuntosRecepcionService } from 'src/app/features/administracion/puntos-recepcion/services/puntosRecepcion.service';
import { AgregarDocumentoPopupComponent } from 'src/app/features/entregas/components/seguimiento/agregar-documento-popup/agregar-documento-popup.component';
import { ItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { IOrdenCompraDTO } from 'src/app/features/entregas/models/orden-ompra.model';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { IAppConfig } from 'src/app/shared/models/common/app-config.model';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { UsuarioDTO } from 'src/app/shared/models/usuario/usuario.model';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { Logger } from 'src/app/shared/utils/logger';
import { EstadoAjuste } from '../../enum/estado-ajuste.enum';
import { TipoAjuste, TipoAjusteInfo } from '../../enum/tipo-ajuste.enum';
import { IAjusteDTO } from '../../models/ajuste.model';
import { AjusteService } from '../../services/ajuste.service';

@Component({
    selector: 'app-agregar-modificar-ajuste-popup',
    templateUrl: './agregar-modificar-ajuste-popup.component.html',
    styleUrls: ['./agregar-modificar-ajuste-popup.component.scss'],
    standalone: false,
})
export class AgregarModificarAjustePopupComponent extends PopupBaseComponent implements OnInit {
    @Input() modo: 'agregar' | 'modificar' = 'agregar';
    @Input() consultaParaItem = false;
    @Input() tipoUsuario!: TipoUsuario;
    @Input() ordenCompra?: IOrdenCompraDTO;
    @Input() itemOrdenCompra?: ItemOrdenCompraDTO;
    @Input() ajuste?: IAjusteDTO | null;
    @Input() ajustesPendientes: IAjusteDTO[] = [];

    @Output() ajusteGuardado = new EventEmitter<(IAjusteDTO | null)>();

    override form!: FormGroup;
    tiposAjuste: TipoAjusteInfo[] = [];
    departamentos: ZonaDto[] = [];
    puntosRecepcion: IPuntoRecepcionDTO[] = [];
    documentos: ArchivoDTO[] = [];
    settings: IAppConfig | undefined = AppConfig.settings;
    usuarioLogueadoDto!: UsuarioDTO;
    guardando = false;

    private departamentosCargados = false;
    private departamentoInicializado = false;
    private puntoRecepcionInicializado = false;

    private nuevaFechaValidators: ValidatorFn[] = [];
    private nuevaCantidadValidators: ValidatorFn[] = [];

    TipoUsuario = TipoUsuario;

    constructor(
        private readonly fb: FormBuilder,
        private readonly puntosRecepcionService: PuntosRecepcionService,
        private readonly documentosUtilService: DocumentosUtilService,
        private readonly archivoService: ArchivoService,
        private readonly ajusteService: AjusteService,
        private readonly seguridadService: SeguridadService,
        private readonly usuarioService: UsuarioService
    ) {
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.cargarTiposAjuste();
        this.inicializarFormulario();
        if (this.modo === 'modificar') {
            this.cargarDatosExistentes();
        } else {
            this.form.get('tipoAjuste')?.enable();
        }
        this.configurarReacciones();
        this.obtenerUsuarioDto();

    }

    obtenerUsuarioDto(): void {
        const idUsuario = this.seguridadService.obtenerUsuarioLogueado();
        if (idUsuario) {
            this.usuarioService.obtenerUsuarioPorId(idUsuario).subscribe({
                next: (usuario) => {
                    this.usuarioLogueadoDto = usuario;
                }
            });
        }
    }

    esProveedor(): boolean {
        return this.tipoUsuario === TipoUsuario.PROVEEDOR;
    }

    esOrganismo(): boolean {
        return this.tipoUsuario === TipoUsuario.ORGANISMO || this.tipoUsuario === TipoUsuario.AMBOS;
    }

    campoInvalido(controlName: string): boolean {
        const control: AbstractControl | null = this.form.get(controlName);
        return !!control && control.invalid && (control.dirty || control.touched);
    }

    guardar(esConfirmacion: boolean = false): void {
        this.guardando = true;
        this.form.markAllAsTouched();
        this.actualizarValidadoresTipoAjuste();
        if (this.form.invalid) {
            this.guardando = false;
            return;
        }
        if (this.tipoUsuario === TipoUsuario.ORGANISMO) {
            esConfirmacion = true;
        }
        if (!this.validarDocumentoObligatorio()) {
            this.guardando = false;
            return;
        }

        this.guardarInterno(esConfirmacion);
    }

    confirmar(): void {
        this.guardar(true);
    }

    cancelar(): void {
        this.cerrarPopup();
    }

    private guardarInterno(esConfirmacion: boolean = false): void {

        const documentoBase = this.obtenerDocumentoEmitible();
        const ajuste = this.crearAjusteDesdeFormulario(documentoBase ? this.clonarDocumento(documentoBase) : null);


        if (this.modo === 'modificar' && ajuste) {
            if (this.ajuste?.idAjuste) {
                ajuste.idAjuste = this.ajuste.idAjuste;
            }
            if (esConfirmacion) {
                ajuste.estado = EstadoAjuste.PENDIENTE_APROBACION;
            }
        }

        this.ajusteGuardado.emit(ajuste);
        this.guardando = false;
    }

    private crearAjusteDesdeFormulario(documento: ArchivoDTO | null): IAjusteDTO | null {
        const valores = this.form.value;
        const tipoAjuste = this.form.get('tipoAjuste')?.value as TipoAjuste | null;

        const ajuste: IAjusteDTO = {
            idAjuste: this.ajuste?.idAjuste ?? undefined,
            tipoAjuste: tipoAjuste ?? undefined,
            comentario: valores.comentario ?? null,
            permitidoEnPliego: valores.permitidoEnPliego ?? false,
            fuerzaMayor: valores.fuerzaMayor ?? false,
            tipoSolicitante: valores.solicitadoPor ?? this.obtenerSolicitanteInicial(),
            ordenCompra: this.ordenCompra ? { idOC: this.ordenCompra.idOC, nroOC: this.ordenCompra.nroOC } : undefined,
            usuarioSolicitante: this.usuarioLogueadoDto ?? null,
            itemOrdenCompra: this.consultaParaItem && this.itemOrdenCompra ? {
                idOC: this.itemOrdenCompra.idOC,
                idItem: this.itemOrdenCompra.idItem,
                idVariacion: this.itemOrdenCompra.idVariacion,
                ordenCompra: { idOC: this.itemOrdenCompra.idOC, nroOC: this.ordenCompra?.nroOC ?? '' },
                nroItem: this.itemOrdenCompra.nroItem,
            } : undefined,
            archivo: documento ?? undefined,
        };
        switch (tipoAjuste) {
            case TipoAjuste.OC_CAMBIAR_FECHA:
                ajuste.fechaNueva = valores.nuevaFecha;
                break;
            case TipoAjuste.OC_CAMBIAR_PR:
                ajuste.puntoRecepcionNuevo = valores.nuevoPuntoRecepcion;
                break;
            case TipoAjuste.ITEM_CAMBIAR_FECHA:
                ajuste.fechaNueva = valores.nuevaFecha;
                break;
            case TipoAjuste.ITEM_CAMBIAR_CANTIDAD:
                ajuste.cantidadNueva = this.obtenerCantidadNumerica(valores.nuevaCantidad);
                break;
            case TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD:
                ajuste.fechaNueva = valores.nuevaFecha ?? null;
                ajuste.cantidadNueva = this.obtenerCantidadNumerica(valores.nuevaCantidad);
                break;
        }

        return ajuste;
    }

    private obtenerDocumentoEmitible(): ArchivoDTO | null {
        const visibles = this.obtenerDocumentosAMostrar();
        if (visibles.length) {
            return this.clonarDocumento(visibles[0]);
        }

        const eliminado = this.documentos.find(doc => doc.eliminado === true);
        return eliminado ? this.clonarDocumento(eliminado) : null;
    }

    private clonarDocumento(documento: ArchivoDTO): ArchivoDTO {
        return { ...documento };
    }

    agregarDocumento(): void {
        if (this.obtenerDocumentosAMostrar().length >= 1) {
            return;
        }

        const modalRef = this.abrirPopup(AgregarDocumentoPopupComponent, undefined, {
            initialState: {
                extensionesPermitidas: '.pdf'
            },
            backdrop: 'static',
            keyboard: false,
        }) as AgregarDocumentoPopupComponent | undefined;

        modalRef?.documentoAgregado.subscribe((documento: ArchivoDTO) => {
            this.documentos.push(documento);
            this.actualizarService.mensajeOcultar();
        });
    }

    eliminarDocumento(documento: ArchivoDTO): void {
        this.documentos = this.documentosUtilService.eliminarDocumento(this.documentos, documento);
    }

    obtenerDocumentosAMostrar(): ArchivoDTO[] {
        return this.documentosUtilService.obtenerDocumentosAMostrar(this.documentos);
    }

    descargarDocumento(documento: ArchivoDTO): void {
        if (!documento) {
            return;
        }

        const idAjuste = this.ajuste?.idAjuste;
        const idArchivo = documento.id;
        if (idAjuste == null || idArchivo == null) {
            Logger.logError('Error al descargar documento de ajuste: identificador de ajuste o archivo inválido');
            return;
        }

        this.ajusteService.descargarDocumento(idAjuste, idArchivo).subscribe({
            next: (archivoDescargado) => {
                this.archivoService.descargar(archivoDescargado);
            },
            error: (error) => Logger.logError('Error al descargar documento de ajuste', error),
        });
    }

    private cargarTiposAjuste(): void {
        if (this.ordenCompra && !this.consultaParaItem) {
            this.cargarTiposAjustesOrdenCompra();
        } else if (this.itemOrdenCompra && this.consultaParaItem) {
            this.cargarTiposAjustesItemOrdenCompra();
        }

        if (this.modo === 'modificar') {
            this.cargarTiposAjustesModificar();
        }
    }

    private cargarTiposAjustesOrdenCompra(): void {
        if (!this.ordenCompra) {
            return;
        }
        if (this.ordenCompra.puedeAgregarAjusteFecha ?? false) {
            this.tiposAjuste.push({
                tipo: TipoAjuste.OC_CAMBIAR_FECHA,
                nombre: 'Ajuste OC - Fecha',
                esParaOC: true,
                esParaItem: false
            });
        }
        if (this.ordenCompra.puedeAgregarAjustePuntoRecepcion ?? false) {
            this.tiposAjuste.push({
                tipo: TipoAjuste.OC_CAMBIAR_PR,
                nombre: 'Ajuste OC - Punto',
                esParaOC: true,
                esParaItem: false
            });
        }

        if (this.ordenCompra.puedeAgregarAjusteAnulacion ?? false) {
            this.tiposAjuste.push({
                tipo: TipoAjuste.OC_ANULAR,
                nombre: 'Anular OC',
                esParaOC: true,
                esParaItem: false
            });
        }
    }

    private cargarTiposAjustesItemOrdenCompra(): void {
        if ((this.itemOrdenCompra?.puedeAgregarAjusteCantidad ?? false)
            && (this.itemOrdenCompra?.puedeAgregarAjusteFecha ?? false)) {
            this.tiposAjuste.push({
                tipo: TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD,
                nombre: 'Ajuste Ítem - Fecha y/o cantidad',
                esParaOC: true,
                esParaItem: false
            });
        } else if (this.itemOrdenCompra?.puedeAgregarAjusteCantidad) {
            this.tiposAjuste.push({
                tipo: TipoAjuste.ITEM_CAMBIAR_CANTIDAD,
                nombre: 'Ajuste Ítem - Cantidad',
                esParaOC: true,
                esParaItem: false
            });
        } else if (this.itemOrdenCompra?.puedeAgregarAjusteFecha) {
            this.tiposAjuste.push({
                tipo: TipoAjuste.ITEM_CAMBIAR_FECHA,
                nombre: 'Ajuste Ítem - Fecha',
                esParaOC: true,
                esParaItem: false
            });
        }

        if (this.itemOrdenCompra?.puedeAgregarAjusteAnulacion ?? false) {
            this.tiposAjuste.push({
                tipo: TipoAjuste.ITEM_ANULAR,
                nombre: 'Anular Ítem',
                esParaOC: true,
                esParaItem: false
            });
        }
    }

    private cargarTiposAjustesModificar(): void {
        this.tiposAjuste = [
            {
                tipo: TipoAjuste.OC_CAMBIAR_FECHA,
                nombre: 'Ajuste OC - Fecha',
                esParaOC: true,
                esParaItem: false
            },
            {
                tipo: TipoAjuste.OC_CAMBIAR_PR,
                nombre: 'Ajuste OC - Punto',
                esParaOC: true,
                esParaItem: false
            },
            {
                tipo: TipoAjuste.OC_ANULAR,
                nombre: 'Anular OC',
                esParaOC: true,
                esParaItem: false
            },
            {
                tipo: TipoAjuste.ITEM_CAMBIAR_FECHA,
                nombre: 'Ajuste Ítem - Fecha',
                esParaOC: false,
                esParaItem: true
            },
            {
                tipo: TipoAjuste.ITEM_CAMBIAR_CANTIDAD,
                nombre: 'Ajuste Ítem - Cantidad',
                esParaOC: false,
                esParaItem: true
            },
            {
                tipo: TipoAjuste.ITEM_ANULAR,
                nombre: 'Anular Ítem',
                esParaOC: false,
                esParaItem: true
            },
        ]
    }

    private inicializarFormulario(): void {
        const solicitanteInicial = this.obtenerSolicitanteInicial();

        this.form = this.fb.group({
            tipoAjuste: [null, Validators.required],
            solicitadoPor: [solicitanteInicial, Validators.required],
            permitidoEnPliego: [false],
            fuerzaMayor: [false],
            comentario: ['', [Validators.maxLength(500)]],
            nuevaFecha: [null],
            nuevaCantidad: [null],
            departamento: [null],
            nuevoPuntoRecepcion: [null],
        });

        this.nuevaFechaValidators = [this.nuevaFechaValidator(), this.alMenosUnoFechaCantidadValidator()];
        this.nuevaCantidadValidators = [this.nuevaCantidadValidator(), this.alMenosUnoFechaCantidadValidator()];
        this.aplicarRequerido('nuevaFecha', false, this.nuevaFechaValidators);
        this.aplicarRequerido('nuevaCantidad', false, this.nuevaCantidadValidators);

        this.cargarTipoUnico();
    }

    private cargarTipoUnico(): void {
        if (this.tiposAjuste.length === 1) {
            this.form.get('tipoAjuste')?.setValue(this.tiposAjuste[0].tipo);
        }
    }

    private cargarDatosExistentes(): void {
        if (!this.ajuste) {
            return;
        }

        const tipoAjuste = this.ajuste.tipoAjuste;

        this.cargarTiposAjuste();

        const tipoDisponible = tipoAjuste && this.tiposAjuste.some(tipo => tipo.tipo === tipoAjuste);

        this.form.patchValue({
            tipoAjuste: tipoDisponible ? tipoAjuste : null
        });

        this.form.patchValue({
            comentario: this.ajuste.comentario ?? '',
            permitidoEnPliego: this.ajuste.permitidoEnPliego ?? false,
            fuerzaMayor: this.ajuste.fuerzaMayor ?? false,
            solicitadoPor: this.ajuste.tipoSolicitante ?? this.form.get('solicitadoPor')?.value,
            nuevaFecha: this.ajuste.fechaNueva ?? null,
            nuevaCantidad: this.ajuste.cantidadNueva ?? null,
            nuevoPuntoRecepcion: this.ajuste.puntoRecepcionNuevo ?? null,
        });

        this.form.get('tipoAjuste')?.disable();

        this.documentos = [];
        if (this.ajuste.archivo) {
            this.documentos.push({
                ...this.ajuste.archivo,
                modificado: this.ajuste.archivo.modificado ?? false,
                eliminado: this.ajuste.archivo.eliminado ?? false,
            });
        }
    }

    private configurarReacciones(): void {
        this.form.get('tipoAjuste')?.valueChanges
            .subscribe(() => {
                this.actualizarValidadoresTipoAjuste();
            });

        this.form.get('solicitadoPor')?.valueChanges
            .subscribe((tipoSolicitante: TipoUsuario | null) => {
                this.actualizarFuerzaMayorSegunSolicitante(tipoSolicitante);
            });

        this.form.get('departamento')?.valueChanges
            .subscribe((zona: ZonaDto | null) => {
                if (!this.mostrarCamposPuntoRecepcion) {
                    return;
                }

                const idZona = zona?.id;
                if (idZona) {
                    this.cargarPuntosRecepcion(idZona);
                } else {
                    this.puntosRecepcion = [];
                    this.form.get('nuevoPuntoRecepcion')?.setValue(null, { emitEvent: false });
                }
            });

        this.form.get('nuevaFecha')?.valueChanges
            .subscribe(() => {
                this.form.get('nuevaCantidad')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            });

        this.form.get('nuevaCantidad')?.valueChanges
            .subscribe(() => {
                this.form.get('nuevaFecha')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            });

        this.actualizarValidadoresTipoAjuste();
        this.actualizarFuerzaMayorSegunSolicitante(this.form.get('solicitadoPor')?.value ?? null);
    }

    private actualizarValidadoresTipoAjuste(): void {
        const tipoSeleccionado = this.form.get('tipoAjuste')?.value as TipoAjuste | null;

        const requiereFecha = this.debeRequerirFecha(tipoSeleccionado);
        const requiereCantidad = this.debeRequerirCantidad(tipoSeleccionado);

        this.aplicarRequerido('nuevaFecha', requiereFecha, this.nuevaFechaValidators);
        this.aplicarRequerido('nuevaCantidad', requiereCantidad, this.nuevaCantidadValidators);
        this.aplicarRequerido('departamento', this.mostrarCamposPuntoRecepcion);
        this.aplicarRequerido('nuevoPuntoRecepcion', this.mostrarCamposPuntoRecepcion);

        if (!this.mostrarCampoFechaOC && !this.mostrarCampoFechaItem) {
            this.form.get('nuevaFecha')?.setValue(null, { emitEvent: false });
        }
        if (!this.mostrarCampoCantidad) {
            this.form.get('nuevaCantidad')?.setValue(null, { emitEvent: false });
        }
        if (!this.mostrarCamposPuntoRecepcion) {
            this.form.get('departamento')?.setValue(null, { emitEvent: false });
            this.form.get('nuevoPuntoRecepcion')?.setValue(null, { emitEvent: false });
            this.departamentos = [];
            this.puntosRecepcion = [];
            this.departamentosCargados = false;
        }

        if (this.mostrarCamposPuntoRecepcion && !this.departamentosCargados) {
            this.cargarDepartamentos();
        }
    }

    private aplicarRequerido(controlName: string, requerido: boolean, adicionales: ValidatorFn[] = []): void {
        const control = this.form.get(controlName);
        if (!control) {
            return;
        }

        const validators = requerido
            ? [Validators.required, ...adicionales]
            : [...adicionales];

        control.setValidators(validators.length ? validators : null);
        control.updateValueAndValidity({ emitEvent: false });

        control.updateValueAndValidity({ emitEvent: false });
    }

    private obtenerSolicitanteInicial(): TipoUsuario {
        if (this.ajuste?.tipoSolicitante) {
            return this.ajuste.tipoSolicitante;
        }

        if (this.tipoUsuario === TipoUsuario.PROVEEDOR) {
            return TipoUsuario.PROVEEDOR;
        }

        return TipoUsuario.ORGANISMO;
    }

    private nuevaFechaValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!this.form) {
                return null;
            }

            const valor = control.value;
            if (!valor) {
                return null;
            }

            const fechaNueva = this.parseDate(valor);
            if (!fechaNueva) {
                return { fechaInvalida: true };
            }

            const errores: ValidationErrors = {};

            if (this.mostrarCampoFechaOC) {
                this.validarFechaOrdenInterno(fechaNueva, errores);
            }
            if (this.mostrarCampoFechaItem) {
                this.validarFechaItemInterno(fechaNueva, errores);
            }

            return Object.keys(errores).length ? errores : null;
        };
    }

    validarFechaOrdenInterno(fechaNueva: Date, errores: ValidationErrors): void {
        const referenciaOc = this.obtenerFechaReferenciaOc();
        if (referenciaOc && fechaNueva < referenciaOc) {
            errores['fechaNoAdelantada'] = true;
        }
    }

    validarFechaItemInterno(fechaNueva: Date, errores: ValidationErrors): void {
        const referenciaItem = this.obtenerFechaReferenciaItem();
        if (referenciaItem && fechaNueva < referenciaItem) {
            errores['fechaNoAdelantada'] = true;
        }

        const hoy = this.obtenerFechaActual();
        if (fechaNueva < hoy) {
            errores['fechaNoAdelantada'] = true;
        }

        const maximaItem = this.obtenerFechaMaximaItem();
        if (maximaItem && fechaNueva > maximaItem) {
            errores['max'] = true;
        }
    }

    private nuevaCantidadValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!this.form || !this.mostrarCampoCantidad) {
                return null;
            }

            const valorControl = control.value;
            if (this.estaVacio(valorControl)) {
                return null;
            }

            const valor = Number(valorControl);
            if (Number.isNaN(valor)) {
                return null;
            }

            const cantidadActual = this.itemOrdenCompra?.cantidad ?? this.itemOrdenCompra?.cantidadTotal ?? null;
            const pendienteAsignar = this.itemOrdenCompra?.cantidadPendienteAsignar;

            if (cantidadActual == null || pendienteAsignar == null) {
                return null;
            }

            if ((cantidadActual === 1) && (this.itemOrdenCompra?.tipoArticulo === 'S' || this.itemOrdenCompra?.tipoArticulo === 'O')) {
                return { cantidadInvalida: true };
            }

            const minimoPermitido = cantidadActual - pendienteAsignar;
            const excedeMaximo = valor > cantidadActual;
            const inferiorMinimo = valor < minimoPermitido;
            const esIgual = valor == cantidadActual;

            if (excedeMaximo || inferiorMinimo || esIgual) {
                return { cantidadInvalida: true };
            }

            return null;
        };
    }

    private alMenosUnoFechaCantidadValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const parent = control.parent;
            if (!parent) {
                return null;
            }

            const tipo = parent.get('tipoAjuste')?.value as TipoAjuste | null;
            if (tipo !== TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD) {
                return null;
            }

            const fechaVacia = this.estaVacio(parent.get('nuevaFecha')?.value);
            const cantidadVacia = this.estaVacio(parent.get('nuevaCantidad')?.value);

            if (fechaVacia && cantidadVacia) {
                return { requeridoAlMenosUno: true };
            }

            return null;
        };
    }

    private validarDocumentoObligatorio(): boolean {
        const cantidadVisible = this.obtenerDocumentosAMostrar().length;
        if (cantidadVisible === 0) {
            this.procesarError('Debe adjuntar al menos un documento.');
            return false;
        }

        this.actualizarService.mensajeOcultar();
        return true;
    }

    private actualizarFuerzaMayorSegunSolicitante(tipoSolicitante: TipoUsuario | null): void {
        const control = this.form.get('fuerzaMayor');
        if (!control) {
            return;
        }

        const esProveedor = tipoSolicitante === TipoUsuario.PROVEEDOR || this.tipoUsuario === TipoUsuario.PROVEEDOR;
        if (!esProveedor && control.value === true) {
            control.setValue(false, { emitEvent: false });
        }
    }

    private obtenerCantidadNumerica(valor: unknown): number | null {
        if (valor === null || valor === undefined || valor === '') {
            return null;
        }

        const numero = Number(valor);
        return Number.isNaN(numero) ? null : numero;
    }

    private estaVacio(valor: unknown): boolean {
        return valor === null || valor === undefined || valor === '';
    }

    private obtenerFechaReferenciaOc(): Date | null {
        return this.obtenerFechaMinimaOc();
    }

    private obtenerFechaMinimaOc(): Date | null {
        const fechaOc = this.parseDate(this.ordenCompra?.fechaComprometida ?? '');
        if (!fechaOc) {
            return this.parseDate(this.ordenCompra?.fechaOC ?? '');
        }

        const diaSiguiente = new Date(fechaOc);
        diaSiguiente.setDate(diaSiguiente.getDate() + 1);

        return diaSiguiente;
    }

    private obtenerFechaReferenciaItem(): Date | null {
        return this.obtenerFechaMinimaItem();
    }

    private obtenerFechaMinimaItem(): Date | null {
        const fechaItem = this.parseDate(this.itemOrdenCompra?.fechaComprometida ?? '');
        if (!fechaItem) {
            return this.parseDate(this.ordenCompra?.fechaComprometida ?? this.ordenCompra?.fechaOC ?? '');
        }
        const diaSiguiente = new Date(fechaItem);
        diaSiguiente.setDate(diaSiguiente.getDate() + 1);
        return diaSiguiente;
    }

    private obtenerFechaMaximaItem(): Date | null {
        if (!this.mostrarCampoFechaItem) {
            return null;
        }

        const fechaOc = this.parseDate(this.ordenCompra?.fechaComprometida ?? this.ordenCompra?.fechaOC ?? '');
        if (!fechaOc) {
            return null;
        }

        return fechaOc;
    }

    private debeRequerirFecha(tipoSeleccionado: TipoAjuste | null): boolean {
        if (!tipoSeleccionado) {
            return false;
        }

        if (this.esAjusteFechaOCantidad(tipoSeleccionado)) {
            return false;
        }

        return this.mostrarCampoFechaOC || this.mostrarCampoFechaItem;
    }

    private debeRequerirCantidad(tipoSeleccionado: TipoAjuste | null): boolean {
        if (!tipoSeleccionado) {
            return false;
        }

        if (this.esAjusteFechaOCantidad(tipoSeleccionado)) {
            return false;
        }

        return this.mostrarCampoCantidad;
    }

    private puedeAjustarCantidadItem(item: ItemOrdenCompraDTO | null): boolean {
        if (!item) {
            return false;
        }

        const pendiente = item.cantidadPendienteAsignar ?? 0;
        if (pendiente <= 0) {
            return false;
        }

        const cantidadActual = item.cantidad ?? item.cantidadTotal ?? null;
        const tipoArticulo = item.tipoArticulo?.toString().toUpperCase();
        if (cantidadActual === 1 && (tipoArticulo === 'S' || tipoArticulo === 'O')) {
            return false;
        }

        return true;
    }

    private esAjusteFechaOCantidad(tipoSeleccionado: TipoAjuste | null): boolean {
        return tipoSeleccionado === TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD;
    }

    private obtenerFechaActual(): Date {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return hoy;
    }

    private parseDate(valor: string | Date): Date | null {
        if (!valor) {
            return null;
        }

        if (valor instanceof Date) {
            return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
        }

        const [anio, mes, dia] = valor.split('-');
        if (!anio || !mes || !dia) {
            return null;
        }

        const date = new Date(Number(anio), Number(mes) - 1, Number(dia));
        return Number.isNaN(date.getTime()) ? null : date;
    }

    private cargarDepartamentos(): void {
        const idOc = this.ordenCompra?.idOC;
        if (!idOc) {
            this.departamentos = [];
            return;
        }

        this.puntosRecepcionService.obtenerZonasPorOrdenCompra(idOc).subscribe({
            next: (zonas) => {
                this.departamentos = zonas ?? [];
                this.departamentosCargados = true;
                if (!this.departamentos.length) {
                    this.form.get('departamento')?.setValue(null, { emitEvent: false });
                    return;
                }

                if (this.modo === 'modificar' && !this.departamentoInicializado && this.ajuste?.puntoRecepcionNuevo?.zona?.id) {
                    const idZona = this.ajuste.puntoRecepcionNuevo.zona.id;
                    const depto = this.departamentos.find(z => z.id === idZona);
                    if (depto) {
                        this.departamentoInicializado = true;
                        this.form.get('departamento')?.setValue(depto, { emitEvent: true });
                    }
                }
            }
        });
    }

    private cargarPuntosRecepcion(idZona: number): void {
        const idOc = this.ordenCompra?.idOC;
        if (!idOc) {
            this.puntosRecepcion = [];
            return;
        }

        this.puntosRecepcionService.obtenerPuntosPorOrdenCompraYZona(idOc, idZona).subscribe({
            next: (puntos) => {
                this.puntosRecepcion = puntos ?? [];
                if (!this.puntosRecepcion.length) {
                    this.form.get('nuevoPuntoRecepcion')?.setValue(null, { emitEvent: false });
                    return;
                }

                if (this.modo === 'modificar' && !this.puntoRecepcionInicializado && this.ajuste?.puntoRecepcionNuevo?.id != null) {
                    const idPunto = this.ajuste.puntoRecepcionNuevo.id;
                    const pr = this.puntosRecepcion.find(p => p.id === idPunto);
                    if (pr) {
                        this.puntoRecepcionInicializado = true;
                        this.form.get('nuevoPuntoRecepcion')?.setValue(pr, { emitEvent: false });
                    }
                }
            }
        });
    }

    private get tipoSeleccionadoId(): string | null {
        return this.form?.get('tipoAjuste')?.value ?? null;
    }

    get tituloVentana(): string {
        let base = '';
        let objeto = '';
        if (this.modo === 'agregar') {
            base = this.tipoUsuario === TipoUsuario.PROVEEDOR ? 'Solicitud de Ajuste' : 'Ajuste';
        } else {
            base = this.tipoUsuario === TipoUsuario.PROVEEDOR ? 'Modificar Solicitud de Ajuste' : 'Modificar Ajuste';
        }

        objeto = this.consultaParaItem ? 'Ítem Orden de Compra' : 'Orden de Compra';
        return `${base} ${objeto}`;
    }

    get mostrarCampoFechaOC(): boolean {
        return this.tipoSeleccionadoId === TipoAjuste.OC_CAMBIAR_FECHA;
    }

    get mostrarCampoFechaItem(): boolean {
        return this.tipoSeleccionadoId === TipoAjuste.ITEM_CAMBIAR_FECHA
            || this.tipoSeleccionadoId === TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD;
    }

    get mostrarCampoCantidad(): boolean {
        if (this.tipoSeleccionadoId !== TipoAjuste.ITEM_CAMBIAR_CANTIDAD
            && this.tipoSeleccionadoId !== TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD) {
            return false;
        }
        return this.puedeAjustarCantidadItem(this.itemOrdenCompra ?? null);
    }

    get etiquetaNuevaFecha(): string {
        const tipo = this.form?.get('tipoAjuste')?.value as TipoAjuste | null;
        return this.debeRequerirFecha(tipo) ? '* Nueva fecha' : 'Nueva fecha';
    }

    get etiquetaNuevaCantidad(): string {
        const tipo = this.form?.get('tipoAjuste')?.value as TipoAjuste | null;
        return this.debeRequerirCantidad(tipo) ? '* Nueva cantidad' : 'Nueva cantidad';
    }

    get mostrarCamposPuntoRecepcion(): boolean {
        return this.tipoSeleccionadoId === TipoAjuste.OC_CAMBIAR_PR;
    }

    get mostrarValoresAjuste(): boolean {
        return this.mostrarCampoFechaOC || this.mostrarCampoFechaItem || this.mostrarCampoCantidad || this.mostrarCamposPuntoRecepcion;
    }

    get mostrarCampoFuerzaMayor(): boolean {
        const solicitante = this.form?.get('solicitadoPor')?.value as TipoUsuario | null;
        return solicitante === TipoUsuario.PROVEEDOR || this.tipoUsuario === TipoUsuario.PROVEEDOR;
    }

    get mostrarConfirmar(): boolean {
        return this.modo === 'modificar'
            && this.tipoUsuario === TipoUsuario.PROVEEDOR
            && this.ajuste?.estado === EstadoAjuste.EN_PROCESO;
    }

    get fechaMinima(): string {
        if (this.consultaParaItem) {
            return this.obtenerFechaReferenciaItem()?.toISOString().split('T')[0] ?? '';
        }
        return this.obtenerFechaReferenciaOc()?.toISOString().split('T')[0] ?? '';
    }

    get fechaMaxima(): string {
        const maxima = this.obtenerFechaMaximaItem();
        return maxima ? maxima.toISOString().split('T')[0] : '';
    }

    get mensajeParaItem(): string {
        return this.consultaParaItem ? ' y anterior o igual la de la orden' : '';
    }
}
