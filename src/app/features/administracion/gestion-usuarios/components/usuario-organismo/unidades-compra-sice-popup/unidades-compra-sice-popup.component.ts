import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { UnidadCompraDTO } from 'src/app/shared/models/sice/unidad-compra.model';
import { UsuarioOrganismoDTO } from 'src/app/shared/models/usuario/usuario-organismo.model';
import { OrganismoService } from 'src/app/shared/services/organismo.service';
import { ordenarMultipleYPaginar } from 'src/app/shared/utils/paginador';

@Component({
    selector: 'app-unidades-compra-sice-popup',
    templateUrl: './unidades-compra-sice-popup.component.html',
    styleUrls: ['./unidades-compra-sice-popup.component.scss'],
    standalone: false,
})
export class UnidadesCompraSicePopupComponent extends PopupBaseComponent implements OnInit {
    @Output() guardarEvento = new EventEmitter<any>();

    @Input() submitText = 'Guardar';
    @Input() titulo = 'Asignar UC';
    @Input() tipoPerfil!: TipoPerfil;

    usuario!: UsuarioOrganismoDTO;
    unidadesCompra: UnidadCompraDTO[] = [];
    todasUC: UnidadCompraDTO[] = [];
    unidadCompraSeleccionada: UnidadCompraDTO | null = null;
    protected intentoGuardar = false;

    override listaOrden: IColumnaOrden[] = [
        { id: 'idInciso', nombre: 'Inciso' },
        { id: 'idInciso,idUnidadEjecutora', nombre: 'Unidad ejecutora' },
        { id: 'idInciso,idUnidadEjecutora,idUnidadCompra', nombre: 'Unidad compra' }
    ];

    override ordenInicial: 'asc' | 'desc' = 'asc';
    override columnaOrdenInicial: string = 'idInciso,idUnidadEjecutora,idUnidadCompra';

    constructor(
        private readonly organismoService: OrganismoService,
        private readonly fb: FormBuilder
    ) {
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.form = this.fb.group({
            unidadCompra: [null, Validators.required],
            esEditorPrincipal: [false],
            esEditor: [false],
            esValidador: [false],
            esAprobador: [false],
        });
        this.buscar();
    }

    override buscar(): void {
        this.organismoService.obtenerUCUsuarioOrganismo(this.usuario.id).subscribe(
            (datos: UnidadCompraDTO[]) => {
            this.todasUC = datos;

            if (!this.todasUC || this.todasUC === null) {
                this.todasUC = [];
            }
            if (this.todasUC.length > 0) {
                this.unidadesCompra = ordenarMultipleYPaginar(this.todasUC,
                    this.parametros.pagina, this.parametros.tamanoPagina, this.parametros.sort.split(','), this.parametros.order);
            } else {
                this.unidadesCompra = [];
            }
            this.total = this.todasUC.length;
        })
    }

    onSeleccionUnidadCompra(event: any): void {
        const ucSeleccionada = event.target.value;
        if (ucSeleccionada) {
            const [idInciso, idUnidadEjecutora, idUnidadCompra] = ucSeleccionada.split('-');
            this.unidadCompraSeleccionada = this.todasUC.find(
                uc => uc.idInciso?.toString() === idInciso &&
                      uc.idUnidadEjecutora?.toString() === idUnidadEjecutora &&
                      uc.idUnidadCompra?.toString() === idUnidadCompra
            ) || null;
        } else {
            this.unidadCompraSeleccionada = null;
        }
    }

    guardar(): void {
        this.intentoGuardar = true;
        this.form.get('unidadCompra')?.markAsTouched();

        if (this.form.get('unidadCompra')?.invalid || !this.alMenosUnRolSeleccionado()) {
            return;
        }

        const dataAGuardar = {
            idUsuario: this.usuario.id,
            unidadCompra: this.unidadCompraSeleccionada,
            roles: {
                esEditorPrincipal: this.form.get('esEditorPrincipal')?.value || false,
                esEditor: this.form.get('esEditor')?.value || false,
                esValidador: this.form.get('esValidador')?.value || false,
                esAprobador: this.form.get('esAprobador')?.value || false,
            }
        };

        this.guardarEvento.emit(dataAGuardar);
        this.cerrarPopup();
    }

    alMenosUnRolSeleccionado(): boolean {
        return (
            this.form.get('esEditorPrincipal')?.value ||
            this.form.get('esEditor')?.value ||
            this.form.get('esValidador')?.value ||
            this.form.get('esAprobador')?.value
        );
    }

    validarPopUpInvalido(): boolean {
        if (this.intentoGuardar) {
            return this.form.invalid || !this.alMenosUnRolSeleccionado();
        }
        return this.form.invalid;
    }
}
