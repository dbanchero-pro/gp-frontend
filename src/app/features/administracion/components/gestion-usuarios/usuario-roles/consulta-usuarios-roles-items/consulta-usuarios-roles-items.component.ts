import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IConsultaUsuarioOrganismoPerfilFiltroDTO } from 'src/app/features/administracion/models/filtros/consulta-usuario-organismo-perfil-filtro.model';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { TipoBusqueda } from 'src/app/shared/enum/tipo-busqueda-item.enum';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { CompraDTO } from 'src/app/shared/models/compra.model';
import { FiltroItemCompraDTO } from 'src/app/shared/models/filtros/filtro-item-compra.model';
import { ItemCompraFiltroDTO } from 'src/app/shared/models/item-compra-filtro.model';
import { ItemCompraDto } from 'src/app/shared/models/item-compra.model';
import { TipoCompraDTO } from 'src/app/shared/models/sice/tipo-compra.model';
import { UsuarioDTO } from 'src/app/shared/models/usuario/usuario.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { CompraSiceService } from 'src/app/shared/services/compra-sice.service';
import { UsuarioRolesService } from 'src/app/shared/services/usuario/usuario-roles.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { ordenarYPaginar } from 'src/app/shared/utils/paginador';
@Component({
    selector: 'app-consulta-usuarios-roles-items',
    templateUrl: './consulta-usuarios-roles-items.component.html',

    standalone: false
})
export class ConsultaUsuariosRolesItemsComponent extends PaginaBusquedaComponent<IConsultaUsuarioOrganismoPerfilFiltroDTO>
    implements OnInit {
    @ViewChild('filtroItems') filtroItemsComponent: any;

    tiposCompra: TipoCompraDTO[] = [];
    listaOrden: IColumnaOrden[] = [
        { id: 'nroItem', nombre: 'N° ítem' },
        { id: 'descArticulo', nombre: 'Descripción artículo' },
    ];
    columnaOrdenInicial = 'nroItem';
    ordenInicial: 'asc' | 'desc' = 'asc';

    permisos: any = {};
    nroCompra!: number;
    usuario!: UsuarioDTO;
    compra?: CompraDTO;
    idUsuario: string | null = null;
    idCompra: string | null = null;
    items: ItemCompraDto[] = [];
    todos: ItemCompraDto[] = [];
    filtroItem!: FiltroItemCompraDTO;

    constructor(
        private readonly fb: FormBuilder,
        private readonly actualizarServ: ActualizarService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly usuarioService: UsuarioService,
        private readonly compraSiceService: CompraSiceService,
        private readonly usuarioRolesService: UsuarioRolesService
    ) {
        super();
        this.form = this.fb.group({
            tipoCompra: [''],
            nroAnioCompra: [''],
        });
    }
    override ngOnInit(): void {
        super.ngOnInit();

        this.route.paramMap.subscribe((params) => {
            this.idCompra = params.get('idCompra');
            this.idUsuario = params.get('idUsuario');
            if (this.idCompra) {
                this.obtenerCompra(Number(this.idCompra));
            }
            if (this.idUsuario) {
                this.obtenerUsuario(this.idUsuario);
            }
            this.actualizarFiltro();
            this.buscarInicial(true);
        });
    }

    actualizarFiltrosYBuscar(): void {
        this.actualizarFiltro();
        this.buscar(true);
    }


    onFiltroItemsCambio(filtroItem: FiltroItemCompraDTO): void {
        this.filtroItem = filtroItem;
    }

    buscar(resetearPagina: boolean = false): void {
        this.form.markAllAsTouched();
        if (resetearPagina) {
            this.parametros.pagina = 0;
        }

        const { pagina, tamanoPagina, sort, order, _ } = this.parametros;
        let todosFiltrados = this.todos.filter(item =>
            (!this.parametros.filtro.descripcionArticulo && !this.parametros.filtro.nroItem && !this.parametros.filtro.codArticulo)
            || item.nroItem === this.parametros.filtro.nroItem
            || item.descArticulo === this.parametros.filtro.descripcionArticulo);
        this.items = ordenarYPaginar(todosFiltrados, pagina, tamanoPagina, sort, order);
        this.total = todosFiltrados.length;

    }

    buscarInicial(resetearPagina: boolean = false): void {

        if (!this.parametros.filtro.idCompra || !this.parametros.filtro.idUsuario) {
            return;
        }

        const { _pagina, _tamanoPagina, _sort, _order, filtro } = this.parametros;

        this.compraSiceService.obtenerListaItemsCompra(filtro)
            .subscribe((res) => {
                this.todos = res;
                this.total = res.length;
                this.buscar(resetearPagina);
            });
    }

    override nuevaConsulta(): void {
        this.filtroItemsComponent?.limpiar();
        this.form?.reset();
        this.actualizarFiltrosYBuscar();
    }

    volver() {
        this.router.navigate(['/administracion/gestion-usuarios/consulta-usuario-roles', this.idUsuario],{queryParams: { volver: '1' },});
    }

    obtenerAccionesItem(item: ItemCompraDto): AccionBoton[] {
        const acciones: AccionBoton[] = [
            {
                nombre: 'Agregar',
                ariaLabel: "Agregar rol por item " + item.nroItem + " usuario id " + this.usuario.id,
                clase: 'btn btn-success btn-ancho-fijo-wider',
                icono: 'fa fa-plus',
                permisos: ['GC_GESTION_USU.ALTA'],
                accion: () => this.agregarPermisoPorItem(item),
            },
        ];
        return acciones;
    }

    obtenerUsuario(idCompuesto: string): void {
        this.usuarioService.obtenerUsuarioPorId(idCompuesto)
            .subscribe((res: UsuarioDTO) => {
                this.usuario = {
                    id: res.id,
                    nombre: res.nombre,
                    nroDocumento: res.nroDocumento,
                    pais: res.pais,
                    tipoDocumento: res.tipoDocumento,
                };
            });
    }

    obtenerCompra(idCompra: number) {
        this.compraSiceService.obtenerCompraPorId(idCompra).subscribe({
            next: (res) => {
                this.compra = res;

            },
        });
    }

    private actualizarFiltro(): void {
        const esPorNumero = (this.filtroItem?.tipoBusqueda ?? TipoBusqueda.NROITEM) === TipoBusqueda.NROITEM;

        this.parametros.filtro.nroItem = esPorNumero && this.filtroItem?.item ? Number(this.filtroItem.item) : undefined;

        this.parametros.filtro.descripcionArticulo = !esPorNumero && this.filtroItem.item !== undefined &&
            this.filtroItem.item !== null ? String(this.filtroItem.item) : undefined;

        const nroItem = this.parametros.filtro.nroItem;
        const descArt = this.parametros.filtro.descripcionArticulo;
        const codArt = this.parametros.filtro.codArticulo;

        this.parametros.filtro = {
            idCompra: this.idCompra,
            idUsuario: this.idUsuario,
            nroItem: nroItem,
            codArticulo: codArt,
            descripcionArticulo: descArt,
        };

    }

    agregarPermisoPorItem(item: ItemCompraDto): void {
        this.actualizarServ.confirmar('¿Está seguro que desea agregar el rol?',
            () => {
                const idCompra = this.compra?.idCompra;
                const idUsuario = this.usuario?.id;
                const idItem = item.idItem;
                if (idCompra && idUsuario && idItem) {
                    this.usuarioRolesService.agregarRolPorItem(idCompra, idItem, idUsuario)
                        .subscribe(() => {
                            this.actualizarServ.mensajeCorrecto('El rol ha sido agregado de forma exitosa.')
                            this.buscarInicial(false);
                        });
                }
            }
        );
    }

    limpiarFiltroItems(): void {
        this.parametros.filtro.nroItem = undefined;
        this.parametros.filtro.descripcionArticulo = undefined;
    }

    obtenerItemsFiltro(items: ItemCompraDto[]): ItemCompraFiltroDTO[] {
        return items.map((item) => {
            return {
                nroItem: item.nroItem + "",
                descripcionItem: item.descArticulo + " (" + item.codArticulo + ")",
                descArticulo: item.descArticulo,
            };
        });
    }
}


