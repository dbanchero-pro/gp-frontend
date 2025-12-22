import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgregarDocumentoPopupComponent } from 'src/app/features/entregas/components/seguimiento/agregar-documento-popup/agregar-documento-popup.component';
import { IItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { IOrdenCompraDTO } from 'src/app/features/entregas/models/orden-ompra.model';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { UsuarioDTO } from 'src/app/shared/models/usuario/usuario.model';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { FechaStringNulo } from 'src/app/shared/types/fecha-string-nulo.type';
import { EstadoAjuste } from '../../enum/estado-ajuste.enum';
import { TipoAjuste } from '../../enum/tipo-ajuste.enum';
import { IAjusteDTO } from '../../models/ajuste.model';
import { IAjustesItemsRequestDTO } from '../../models/ajustes-items-request.model';
import { TipoAjusteInfo } from './../../enum/tipo-ajuste.enum';

@Component({
    selector: 'app-ajuste-masivo-items-popup',
    templateUrl: './ajuste-masivo-items-popup.component.html',
    styleUrls: ['./ajuste-masivo-items-popup.component.scss'],
    standalone: false,
})
export class AjusteMasivoItemsPopupComponent extends PopupBaseComponent implements OnInit {
    @Input() tipoUsuario!: TipoUsuario;
    @Input() ordenCompra!: IOrdenCompraDTO;
    @Input() items: IItemOrdenCompraDTO[] = [];
    @Input() ajustesPendientes: IAjusteDTO[] = [];

    @Output() ajustesGuardados = new EventEmitter<IAjustesItemsRequestDTO>();

    override form!: FormGroup;
    documentos: ArchivoDTO[] = [];
    tiposAjuste: TipoAjusteInfo[] = [];
    usuarioLogueadoDto!: UsuarioDTO;

    TipoUsuario = TipoUsuario;
    TipoAjuste = TipoAjuste;

    constructor(
        private readonly fb: FormBuilder,
        private readonly documentosUtilService: DocumentosUtilService,
        private readonly archivoService: ArchivoService,
        private readonly seguridadService: SeguridadService,
        private readonly usuarioService: UsuarioService,
    ) {
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.ordenarItemsPorNumero();
        this.inicializarFormulario();
        this.obtenerUsuarioDto();
        this.cargarTiposAjuste();

        this.form.get('tipoAjuste')?.valueChanges.subscribe(() => {
            this.validarFilas();
            this.actualizarCamposPorTipo();
        });

        this.actualizarCamposPorTipo();
    }

    private ordenarItemsPorNumero(): void {
        this.items = [...(this.items ?? [])].sort((primero, segundo) => {
            const nroItemPrimero = primero?.nroItem ?? 0;
            const nroItemSegundo = segundo?.nroItem ?? 0;
            if (nroItemPrimero === nroItemSegundo) return 0;
            return nroItemPrimero > nroItemSegundo ? 1 : -1;
        });
    }

    private inicializarFormulario(): void {
        const solicitanteInicial = this.obtenerSolicitanteInicial();
        this.form = this.fb.group({
            tipoAjuste: [null, Validators.required],
            solicitadoPor: [solicitanteInicial, Validators.required],
            permitidoEnPliego: [false],
            fuerzaMayor: [false],
            comentario: ['', [Validators.maxLength(500)]],
            items: this.fb.array(this.items.map(() => this.crearGrupoItem()))
        });
    }

    private crearGrupoItem(): FormGroup {
        return this.fb.group({
            nuevaFecha: [null],
            nuevaCantidad: [null]
        });
    }

    private obtenerSolicitanteInicial(): TipoUsuario {
        if (this.tipoUsuario === TipoUsuario.PROVEEDOR) return TipoUsuario.PROVEEDOR;
        return TipoUsuario.ORGANISMO;
    }

    tituloVentana(): string {
        if (this.esProveedor()) {
            return 'Solicitud de Ajuste ítems';
        }

        return 'Ajuste ítems Orden Compra';
    }

    agregarDocumento(): void {
        if (this.obtenerDocumentosAMostrar().length >= 1) return;
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

    obtenerDocumentoEmitible(): ArchivoDTO | null {
        const visibles = this.obtenerDocumentosAMostrar();
        if (visibles.length === 0) return null;
        const base = visibles[0];
        return { ...base };
    }

    eliminarDocumento(documento: ArchivoDTO): void {
        this.documentos = this.documentosUtilService.eliminarDocumento(this.documentos, documento);
    }

    obtenerDocumentosAMostrar(): ArchivoDTO[] {
        return this.documentosUtilService.obtenerDocumentosAMostrar(this.documentos);
    }

    descargarDocumento(documento: ArchivoDTO): void {
        if (!documento) return;
        if (documento.contenido) { this.archivoService.descargar(documento); return; }
        if (documento.id) {
            this.archivoService.obtener(documento.id).subscribe(archivo => {
                if (archivo) {
                    this.archivoService.descargar({ ...archivo, nombre: documento.nombre ?? archivo.nombre });
                }
            });
        }
    }

    confirmar(): void { this.guardar(true); }

    cancelar(): void { this.cerrarPopup(); }

    guardar(esConfirmacion = false): void {
        this.form.markAllAsTouched();
        if (!this.form.get('tipoAjuste')?.value) return;

        const { validos, errores } = this.validarFilas();

        if (this.cabeceraInvalida()) return;

        if (errores.length > 0) {
            return;
        }

        const docs = this.obtenerDocumentosAMostrar();
        if (docs.length === 0) {
            this.procesarError('Debe adjuntar un documento'); return;
        }

        if (validos.length === 0) {
            return;
        }

        this.emitirRequest(validos, errores, esConfirmacion);
    }

    private emitirRequest(validos: IAjusteDTO[], errores: IAjusteDTO[], esConfirmacion: boolean): void {
        const valores = this.form.value;
        const tipoAjuste = valores.tipoAjuste as TipoAjuste;

        const request: IAjustesItemsRequestDTO = {
            idOC: this.ordenCompra?.idOC as any,
            ajusteDto: validos,
            documento: this.obtenerDocumentoEmitible(),
            usuarioSolicitante: this.usuarioLogueadoDto ?? null,
            tipoSolicitante: this.esProveedor() ? TipoUsuario.PROVEEDOR : (valores.solicitadoPor ?? TipoUsuario.ORGANISMO),
            tipoAjuste,
            permitidoEnPliego: !!valores.permitidoEnPliego,
            fuerzaMayor: !!valores.fuerzaMayor,
            estado: esConfirmacion || this.esOrganismo() ? EstadoAjuste.PENDIENTE_APROBACION : EstadoAjuste.EN_PROCESO,
            comentario: valores.comentario ?? null,
            listadoAjustesErrores: errores,
        };

        this.ajustesGuardados.emit(request);
    }

    private cabeceraInvalida(): boolean {
        const controles = ['tipoAjuste', 'solicitadoPor', 'comentario'];
        for (const nombre of controles) {
            const control = this.form.get(nombre);
            if (control?.invalid) {
                return true;
            }
        }
        return false;
    }

    private limpiarErroresFila(campoFecha: AbstractControl, campoCantidad: AbstractControl): void {
        this.removerError(campoFecha, 'fechaNoAdelantada');
        this.removerError(campoFecha, 'requeridoAlMenosUno');
        this.removerError(campoCantidad, 'requeridoAlMenosUno');
        this.removerError(campoCantidad, 'cantidadInvalida');
        this.removerError(campoCantidad, 'noPermitido');
    }

    private validarFilas(): { validos: IAjusteDTO[]; errores: IAjusteDTO[] } {
        const tipo = this.form.get('tipoAjuste')?.value as TipoAjuste | null;
        const validos: IAjusteDTO[] = [];
        const errores: IAjusteDTO[] = [];

        this.itemsForm.controls.forEach((grupo, idx) => {
            const item = this.items[idx];
            const campoFecha = grupo.get('nuevaFecha');
            const campoCantidad = grupo.get('nuevaCantidad');
            const dto = this.crearAjusteItemDesdeFila(item, grupo, tipo);

            if (!this.debeIncluirFila(dto, tipo)) {
                if (campoFecha && campoCantidad) {
                    this.limpiarErroresFila(campoFecha, campoCantidad);
                }
                return;
            }

            const esValido = this.validarFila(item, grupo, tipo);
            if (esValido) {
                validos.push(dto);
            } else {
                errores.push(dto);
            }
        });

        return { validos, errores };
    }

    private crearAjusteItemDesdeFila(item: IItemOrdenCompraDTO, grupo: AbstractControl, tipo: TipoAjuste | null): IAjusteDTO {
        const valores = (grupo as FormGroup).value;
        const dto: IAjusteDTO = {
            itemOrdenCompra: { idItem: item.idItem, idVariacion: item.idVariacion, idOC: item.idOC },
            fechaNueva: this.debeTocarFecha(tipo) ? valores.nuevaFecha ?? null : null,
            cantidadNueva: this.debeTocarCantidad(tipo) && this.puedeMostrarCantidad(item) ? (valores.nuevaCantidad ?? null) : null,
            tipoAjuste: tipo ?? undefined,
            ordenCompra: { idOC: this.ordenCompra?.idOC } as any,
        };
        return dto;
    }

    private debeIncluirFila(dto: IAjusteDTO, tipo: TipoAjuste | null): boolean {
        if (!this.esFechaOCantidad(tipo)) {
            return true;
        }

        const tieneFecha = dto.fechaNueva != null;
        const tieneCantidad = dto.cantidadNueva != null;
        return tieneFecha || tieneCantidad;
    }

    private validarFila(item: IItemOrdenCompraDTO, grupo: AbstractControl, tipo: TipoAjuste | null): boolean {
        const formGroup = grupo as FormGroup;
        const campoFecha = formGroup.get('nuevaFecha')!;
        const campoCantidad = formGroup.get('nuevaCantidad')!;

        this.limpiarErroresFila(campoFecha, campoCantidad);

        const valores = this.obtenerValoresFila(campoFecha, campoCantidad);

        if (this.validarTipoAnular(tipo, campoFecha, campoCantidad)) {
            return true;
        }

        if (this.validarRequerimientos(tipo, valores, campoFecha, campoCantidad)) {
            return true;
        }

        const fechaValida = this.validarFecha(item, valores.fecha, campoFecha);
        const cantidadValida = this.validarCantidad(item, tipo, valores, campoCantidad);

        return fechaValida && cantidadValida;
    }

    private obtenerValoresFila(campoFecha: AbstractControl, campoCantidad: AbstractControl): { fecha: FechaStringNulo; cantidad: number | null; cantidadValida: boolean } {
        const fechaRaw = campoFecha.value as FechaStringNulo;
        const fecha = fechaRaw ?? null;
        const cantRaw = campoCantidad.value;
        const cantidad = cantRaw === '' || cantRaw === null || cantRaw === undefined ? null : Number(cantRaw);
        const cantidadValida = cantidad !== null && !Number.isNaN(cantidad);
        return { fecha, cantidad, cantidadValida };
    }

    private validarRequerimientos(tipo: TipoAjuste | null, valores: { fecha: FechaStringNulo; cantidad: number | null; cantidadValida: boolean }, campoFecha: AbstractControl, campoCantidad: AbstractControl): boolean {
        if (this.esFechaOCantidad(tipo) && !valores.fecha && !valores.cantidadValida) {
            return true;
        }

        if (this.debeRequerirFecha(tipo) && !valores.fecha) {
            return true;
        }

        if (this.debeRequerirCantidad(tipo) && !valores.cantidadValida) {
            return true;
        }

        return false;
    }

    private validarFecha(item: IItemOrdenCompraDTO, fecha: FechaStringNulo, campoFecha: AbstractControl): boolean {
        if (!fecha) return true;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaParsed = this.parseDate(fecha);
        const referenciaItem = item.fechaComprometida ? this.parseDate(item.fechaComprometida as any) : null;
        const referenciaOrden = !referenciaItem
            ? this.parseDate(this.ordenCompra?.fechaComprometida ?? this.ordenCompra?.fechaComprometida ?? '')
            : null;

        if (!item.fechaComprometida) {
            return true;
        }

        if (!fechaParsed
            || (referenciaItem && fechaParsed < referenciaItem)
            || (!referenciaItem && referenciaOrden && fechaParsed < referenciaOrden)) {
            this.agregarError(campoFecha, 'fechaNoAdelantada');
            return false;
        }
        return true;
    }

    private validarCantidad(item: IItemOrdenCompraDTO, tipo: TipoAjuste | null, valores: { cantidad: number | null; cantidadValida: boolean }, campoCantidad: AbstractControl): boolean {
        if (!this.puedeMostrarCantidad(item)) return true;
        if (!valores.cantidadValida) return true;
        const cant = valores.cantidad as number;
        const cantidadActual = item.cantidad ?? item.cantidadTotal ?? null;
        const pendiente = item.cantidadPendienteAsignar ?? null;
        if (cantidadActual != null) {
            if (cant >= cantidadActual) {
                this.agregarError(campoCantidad, 'cantidadInvalida');
                return false;
            }
            if (pendiente != null) {
                const minimo = cantidadActual - pendiente;
                if (cant < minimo) {
                    this.agregarError(campoCantidad, 'cantidadInvalida');
                    return false;
                }
            }

            if ((cantidadActual === 1) && (item.tipoArticulo === 'S' || item.tipoArticulo === 'O') && this.debeTocarCantidad(tipo)) {
                this.agregarError(campoCantidad, 'noPermitido');
                return false;
            }
        }
        return true;
    }

    private validarTipoAnular(tipo: TipoAjuste | null, campoFecha: AbstractControl, campoCantidad: AbstractControl): boolean {
        if (tipo !== TipoAjuste.ITEM_ANULAR) {
            return false;
        }

        this.removerError(campoFecha, 'noPermitido');
        this.removerError(campoCantidad, 'noPermitido');
        return true;
    }

    private esFechaOCantidad(tipo: TipoAjuste | null): boolean {
        return tipo === TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD;
    }

    private debeTocarFecha(tipo: TipoAjuste | null): boolean {
        return tipo === TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD;
    }

    private debeTocarCantidad(tipo: TipoAjuste | null): boolean {
        return tipo === TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD;
    }

    private debeRequerirFecha(tipo: TipoAjuste | null): boolean {
        return !!tipo && tipo !== TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD && this.debeTocarFecha(tipo);
    }

    private debeRequerirCantidad(tipo: TipoAjuste | null): boolean {
        return !!tipo && tipo !== TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD && this.debeTocarCantidad(tipo);
    }

    private parseDate(valor: string | Date): Date | null {
        if (!valor) return null;
        if (valor instanceof Date) return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
        const [y, m, d] = valor.toString().split('-');
        if (!y || !m || !d) return null;
        const dt = new Date(Number(y), Number(m) - 1, Number(d));
        return Number.isNaN(dt.getTime()) ? null : dt;
    }

    private agregarError(control: AbstractControl, clave: string): void {
        const errores = control.errors ?? {};
        if (!errores[clave]) { errores[clave] = true; control.setErrors(errores); }
    }

    private removerError(control: AbstractControl, clave: string): void {
        const errores = control.errors; if (!errores?.[clave]) return;
        delete errores[clave]; control.setErrors(Object.keys(errores).length ? errores : null);
    }

    private obtenerUsuarioDto(): void {
        const idUsuario = this.seguridadService.obtenerUsuarioLogueado();
        if (idUsuario) {
            this.usuarioService.obtenerUsuarioPorId(idUsuario).subscribe(u => this.usuarioLogueadoDto = u);
        }
    }

    puedeMostrarCantidad(item: IItemOrdenCompraDTO | null): boolean {
        if (!item) return false;
        return item.puedeAgregarAjusteCantidad ?? false;
    }

    puedeMostrarFecha(item: IItemOrdenCompraDTO | null): boolean {
        if (!item) return false;
        return item.puedeAgregarAjusteFecha ?? false;
    }

    private actualizarCamposPorTipo(): void {
        if (!this.form) return;
        const tipo = this.form.get('tipoAjuste')?.value as TipoAjuste | null;
        const permiteFecha = this.debeTocarFecha(tipo);
        const permiteCantidad = this.debeTocarCantidad(tipo);

        this.itemsForm.controls.forEach((grupo, index) => {
            const formGroup = grupo;
            const campoFecha = formGroup.get('nuevaFecha');
            const campoCantidad = formGroup.get('nuevaCantidad');
            const item = this.items[index] ?? null;
            if (campoFecha) {
                this.actualizarControlItem(campoFecha, permiteFecha);
            }
            if (campoCantidad) {
                const habilitarCantidad = permiteCantidad && this.puedeMostrarCantidad(item);
                this.actualizarControlItem(campoCantidad, habilitarCantidad);
                if (!habilitarCantidad) {
                    campoCantidad.setValue(null, { emitEvent: false });
                }
            }
            if (campoFecha && campoCantidad) {
                this.limpiarErroresFila(campoFecha, campoCantidad);
            }
        });
    }

    private actualizarControlItem(control: AbstractControl, habilitar: boolean): void {
        if (habilitar) {
            control.enable({ emitEvent: false });
            return;
        }
        control.disable({ emitEvent: false });
    }

    private cargarTiposAjuste(): void {
        this.tiposAjuste.push({
            tipo: TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD,
            nombre: 'Ajuste ítem - Fecha y/o cantidad',
            esParaOC: true,
            esParaItem: false
        });

        this.tiposAjuste.push({
            tipo: TipoAjuste.ITEM_ANULAR,
            nombre: 'Anular ítem',
            esParaOC: true,
            esParaItem: false
        });
    }

    esProveedor(): boolean {
        return this.tipoUsuario === TipoUsuario.PROVEEDOR;
    }

    esOrganismo(): boolean {
        return this.tipoUsuario === TipoUsuario.ORGANISMO || this.tipoUsuario === TipoUsuario.AMBOS;
    }

    fechaMinima(item: IItemOrdenCompraDTO): string {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const origen = item.fechaComprometida
            ?? this.ordenCompra.fechaComprometida
            ?? this.ordenCompra.fechaOC;
        
        if(item.fechaComprometida){
            const diaSiguiente = this.parseDate(item.fechaComprometida as any);
            if(diaSiguiente){
                diaSiguiente.setDate(diaSiguiente.getDate() + 1);
                return diaSiguiente.toISOString().split('T')[0];
            }
        }

        const referencia = this.parseDate(origen ?? hoy) ?? hoy;
        return referencia.toISOString().split('T')[0];
    }

    get fechaMaxima(): string {
        const fechaActual = new Date();
        const date = new Date(this.ordenCompra.fechaComprometida ?? this.ordenCompra.fechaOC ?? fechaActual);
        return date.toISOString().split('T')[0];
    }

    get mostrarCampoFuerzaMayor(): boolean {
        const solicitante = this.form?.get('solicitadoPor')?.value as TipoUsuario | null;
        return solicitante === TipoUsuario.PROVEEDOR || this.tipoUsuario === TipoUsuario.PROVEEDOR;
    }

    get deshabilitarConfirmar(): boolean {
        const tipo = this.form.get('tipoAjuste')?.value as TipoAjuste | null;
        if (!tipo) return true;
        return this.ajustesPendientes?.some(a => a.estado === EstadoAjuste.PENDIENTE_APROBACION && a.tipoAjuste === tipo) ?? false;
    }

    get itemsForm(): FormArray<FormGroup> {
        return this.form.get('items') as any;
    }

    get mostrarColFechaYCantidad(): boolean {
        const t = this.form?.get('tipoAjuste')?.value as TipoAjuste | null;
        return t === this.TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD;
    }
}


