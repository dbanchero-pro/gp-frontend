import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { UnidadCompraDTO } from 'src/app/shared/models/sice/unidad-compra.model';
import { UsuarioOrganismoDTO } from 'src/app/shared/models/usuario/usuario-organismo.model';
import { OrganismoService } from 'src/app/shared/services/organismo.service';
import { ordenarMultipleYPaginar } from 'src/app/shared/utils/paginador';import { SharedModule } from 'src/app/shared/shared.module';


@Component({
    selector: 'app-unidades-compra-sice-popup',
    templateUrl: './unidades-compra-sice-popup.component.html',
    styleUrls: ['./unidades-compra-sice-popup.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
  ],
})
export class UnidadesCompraSicePopupComponent extends PopupBaseComponent implements OnInit {
    @Output() guardarEvento = new EventEmitter<{ idUsuario: string }>();

    @Input() submitText = 'Cerrar';
    @Input() titulo = 'Unidades de compra asignadas en SICE al usuario';
    @Input() tipoPerfil!: TipoPerfil;

    usuario!: UsuarioOrganismoDTO;
    unidadesCompra: UnidadCompraDTO[] = [];
    todasUC: UnidadCompraDTO[] = [];
    override listaOrden: IColumnaOrden[] = [
        { id: 'idInciso', nombre: 'Inciso' },
        { id: 'idInciso,idUnidadEjecutora', nombre: 'Unidad ejecutora' },
        { id: 'idInciso,idUnidadEjecutora,idUnidadCompra', nombre: 'Unidad compra' }
    ];
    
    override ordenInicial: 'asc' | 'desc' = 'asc';
    override columnaOrdenInicial: string = 'idInciso,idUnidadEjecutora,idUnidadCompra';

    constructor(
        private readonly organismoService: OrganismoService
    ) {
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();
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
}


