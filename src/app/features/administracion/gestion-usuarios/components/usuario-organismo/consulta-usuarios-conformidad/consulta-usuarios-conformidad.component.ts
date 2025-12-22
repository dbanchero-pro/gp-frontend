import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { OrganismoPopupComponent } from 'src/app/shared/components/organismo-popup/organismo-popup.component';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { TipoBusqueda } from 'src/app/shared/enum/tipo-busqueda-item.enum';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { FiltroBusquedaArticulosDTO } from 'src/app/shared/models/filtros/filtro-busqueda-articulos.model';
import { FiltroItemCompraDTO } from 'src/app/shared/models/filtros/filtro-item-compra.model';
import { TipoCompraDTO } from 'src/app/shared/models/sice/tipo-compra.model';
import { UsuarioOrganismoPerfilDTO } from 'src/app/shared/models/usuario/usuario-organismo-perfil.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { TipoCompraService } from 'src/app/shared/services/sice/tipo-compra.service';
import { UsuarioOrganismoPerfilService } from 'src/app/shared/services/usuario/usuario-perfil.service';
import { dividirNroAnioCompra } from 'src/app/shared/utils/functions';
import { Logger } from 'src/app/shared/utils/logger';
import { mascaraNroAnioCompra } from 'src/app/shared/utils/masks';
import { IConsultaUsuarioOrganismoPerfilFiltroDTO } from '../../../models/consulta-usuario-organismo-perfil-filtro.model';
import { UsuarioPermisoAgrupado } from '../../../models/usuario-permiso-agrupado.model';
import { NuevoUsuarioPopupComponent } from '../nuevo-usuario-popup/nuevo-usuario-popup.component';
import { NuevoUsuarioUcPopupComponent } from '../nuevo-usuario-uc-popup/nuevo-usuario-uc-popup.component';
import { UnidadesCompraSicePopupComponent } from '../unidades-compra-sice-popup/unidades-compra-sice-popup.component';

@Component({
    selector: 'app-consulta-usuarios-conformidad',
    templateUrl: './consulta-usuarios-conformidad.component.html',
    styleUrls: ['./consulta-usuarios-conformidad.component.scss'],
    standalone: false,
})
export class ConsultaUsuariosConformidadComponent
    extends PaginaBusquedaComponent<IConsultaUsuarioOrganismoPerfilFiltroDTO>
    implements OnInit {
    @ViewChild('filtroItems') filtroItemsComponent!: any;
    listaOrden: IColumnaOrden[] = [

        { id: 'usuarioOrganismo.usuario.nroDocumento', nombre: 'Cédula de identidad' },
        { id: 'usuarioOrganismo.usuario.nombre', nombre: 'Nombre' },
        { id: 'usuarioOrganismo.unidadCompra.id.unidadEjecutora.id.inciso.descInciso', nombre: 'Inciso', },
        { id: 'usuarioOrganismo.unidadCompra.id.unidadEjecutora.descUnidadEjecutora', nombre: 'Unidad ejecutora', },
        { id: 'usuarioOrganismo.unidadCompra.descUnidadCompra', nombre: 'Unidad compra', },
        { id: 'compra.numCompra', nombre: 'N° compra' },
        { id: 'compra.anioCompra', nombre: 'Año compra' },
        { id: 'itemCompra.nroItem', nombre: 'N° ítem' },
    ];

    get filtroParaBusquedaArticulos(): FiltroBusquedaArticulosDTO {
        const { numCompra, anioCompra } = dividirNroAnioCompra(
            this.form.get('nroAnioCompra')?.value
        );

        return {
            numCompra: numCompra?.toString(),
            anioCompra: anioCompra?.toString(),
        };
    }

    columnaOrdenInicial = 'usuarioOrganismo.usuario.nroDocumento';
    ordenInicial: 'asc' | 'desc' = 'asc';
    permisos: any = {};
    nroCompra!: number;
    usuariosAgrupados: UsuarioPermisoAgrupado[] = [];
    filtroItem?: FiltroItemCompraDTO;

    tiposCompra: TipoCompraDTO[] = [];
    nroCompraValido = true;
   

    readonly MODO_FILTROS = 'filtros';
    readonly MODO_TODAS_UC = 'todasUc';

     modo: string = this.MODO_FILTROS;

    public static readonly SNAPSHOT_KEY = 'CONSULTA_USUARIO_CONFORMIDAD';

    constructor(
        private readonly fb: FormBuilder,
        private readonly actualizarServ: ActualizarService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly usuarioOrganismoPerfilService: UsuarioOrganismoPerfilService,
        private readonly tipoCompraService: TipoCompraService,
        private readonly snapshotGenericService: SnapshotGenericService,
        protected readonly seguridad: SeguridadService
    ) {
        super();
        this.form = this.fb.group({
            modoBusqueda: [this.MODO_FILTROS],
            nroDocumento: ['', Validators.minLength(7)],
            filtroBase: [null],
            idTipoCompra: [''],
            nroAnioCompra: ['', Validators.pattern(mascaraNroAnioCompra)],
            codEntregable: [''],
            nomEntregable: [''],
            organismo: [null],
        });

        this.form.get('modoBusqueda')!.valueChanges.subscribe((m) => this.toggleCamposPorModo(m));
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.obtenerTiposCompra();

        const paramVolver = this.route.snapshot.queryParamMap.get('volver');

        if (paramVolver === '1') {
            this.buscarVolver();

            const currentUrl = this.router.url.split('?')[0];
            this.router.navigateByUrl(currentUrl, { replaceUrl: true });
        } else {
            this.nuevaConsulta();
        }
    }

    private buscarVolver(): void {
        const organismo = this.form.get('organismo');
        const snap = this.snapshotGenericService.load<any>(
            ConsultaUsuariosConformidadComponent.SNAPSHOT_KEY
        );
        if (snap) {
            this.form.patchValue({
                modoBusqueda: snap.filtro.modoBusqueda ?? this.MODO_FILTROS,
                nroDocumento: snap.filtro.nroDocumento ?? '',
                idTipoCompra: snap.filtro.idTipoCompra ?? '',
                nroAnioCompra: snap.filtro.nroAnioCompra ?? '',
                codEntregable: snap.filtro.codEntregable ?? '',
                nomEntregable: snap.filtro.nomEntregable ?? '',
            });
            if (snap.filtro.idInciso || snap.filtro.idUnidadEjecutora || snap.filtro.idUnidadCompra) {
                organismo?.setValue({
                    idInciso: snap.filtro.idInciso,
                    idUnidadEjecutora: snap.filtro.idUnidadEjecutora,
                    idUnidadCompra: snap.filtro.idUnidadCompra,
                });
            }
            this.parametros.pagina = snap.pagina ?? 0;
            this.parametros.tamanoPagina = snap.tamanoPagina ?? 10;
            this.parametros.sort = snap.sort ?? this.columnaOrdenInicial;
            this.parametros.order = snap.order ?? this.ordenInicial;

            if (snap.nroItem || snap.descripcionArticulo) {
                this.parametros.filtro ??= {};
                this.parametros.filtro.nroItem = snap.nroItem;
                this.parametros.filtro.descripcionArticulo =
                    snap.descripcionArticulo;
            }

            setTimeout(() => {
                this.buscar();
            }, 200);
        } else {
            this.nuevaConsulta();
        }
    }

    onFiltroOrganismo(filtro: any): void {
        this.form.get('filtroBase')?.setValue(filtro);
    }

    private toggleCamposPorModo(modo: string): void {
        const deshabilitar = modo === this.MODO_TODAS_UC;

        const controlesAfectados = [
            'filtroBase',
            'idTipoCompra',
            'nroAnioCompra',
            'codEntregable',
            'nomEntregable',
            'organismo',
        ];

        controlesAfectados.forEach((c) =>
            deshabilitar
                ? this.form.get(c)!.disable({ emitEvent: false })
                : this.form.get(c)!.enable({ emitEvent: false })
        );

        this.filtroItemsComponent?.setDisabledState(deshabilitar);
    }

    obtenerTiposCompra() {
        this.tipoCompraService.obtenerTiposCompraSinPaginado().subscribe({
            next: (res) => {
                this.tiposCompra = res;
            },
        });
    }

    validarNroAnioCompra() {
        this.nroCompraValido = !this.form.get('nroAnioCompra')?.invalid;
    }

    actualizarFiltrosYBuscar(): void {
        this.actualizarFiltro();
        this.buscar();
    }

    buscar(resetearPagina: boolean = false): void {
        this.form.markAllAsTouched();

        const esValido = this.modo === this.MODO_TODAS_UC ? true : this.form.valid;
        if (!esValido) return;

        if (resetearPagina) {
            this.parametros.pagina = 0;
        }

        this.guardarFiltro();

        const { pagina, tamanoPagina, sort, order, filtro } = this.parametros;
        filtro.tipoPerfil = TipoPerfil.Conformidad;
        const sortParam = `${sort},${order}`;

        this.usuarioOrganismoPerfilService.obtenerTodos(filtro, pagina, tamanoPagina, sortParam)
            .pipe(map((response) => {
                const mapa = new Map<string, UsuarioPermisoAgrupado>();

                this.agruparPorUsuario(response, mapa);

                mapa.forEach(u => { u.acciones = this.obtenerAcciones(u, this.modo); });

                return {
                    usuariosAgrupados: Array.from(mapa.values()),
                    totalUsuarios: response.page?.totalElements,
                };
            }))
            .subscribe(({ usuariosAgrupados, totalUsuarios }) => {
                this.usuariosAgrupados = usuariosAgrupados;
                this.total = totalUsuarios;
            });
    }

    private actualizarFiltro(): void {
        const v = this.form.value;
        const organismo = this.form.get('organismo')?.value;
        const { numCompra, anioCompra } = dividirNroAnioCompra(v.nroAnioCompra);
        this.modo = v.modoBusqueda;

        let nroItem: number | undefined;
        let descArticulo: string | undefined;

        if (this.filtroItem) {
            const texto = (this.filtroItem.item ?? '').toString().trim();
            if (this.filtroItem.tipoBusqueda === TipoBusqueda.NROITEM && texto) {
                nroItem = +texto;
            } else if (this.filtroItem.tipoBusqueda === TipoBusqueda.ARTICULO && texto) {
                descArticulo = texto;
            }
        }

        this.parametros.filtro = {
            permisoTodas: this.modo === this.MODO_TODAS_UC,
            idTipoCompra: v.idTipoCompra,
            idInciso: organismo?.idInciso,
            idUnidadEjecutora: organismo?.idUnidadEjecutora,
            idUnidadCompra: organismo?.idUnidadCompra,
            nroCompra: numCompra,
            anioCompra: anioCompra,
            nroItem: nroItem,
            descArticulo: descArticulo,
            nomEntregable: v.nomEntregable,
            codEntregable: v.codEntregable,
            nroDocumento: v.nroDocumento,
            tipoPerfil: TipoPerfil.Conformidad,
            nroAnioCompra: v.nroAnioCompra,
        };

        if (this.modo === this.MODO_TODAS_UC) {
            Object.assign(this.parametros.filtro, {
                idTipoCompra: undefined,
                idInciso: undefined,
                idUnidadEjecutora: undefined,
                idUnidadCompra: undefined,
                nroCompra: undefined,
                anioCompra: undefined,
                nroItem: undefined,
                descArticulo: undefined,
                nomEntregable: undefined,
                codEntregable: undefined,
            });
        }
    }

    private guardarFiltro(): void {
        this.snapshotGenericService.save(
            ConsultaUsuariosConformidadComponent.SNAPSHOT_KEY,
            this.parametros
        );
    }

    override nuevaConsulta(): void {
        this.filtroItemsComponent?.limpiar();
        this.form?.reset({ modoBusqueda: this.MODO_FILTROS, idTipoCompra: '' });
        this.parametros.pagina = 0;
        this.parametros.sort = this.columnaOrdenInicial;
        this.parametros.order = this.ordenInicial;
        this.parametros.filtro = {};
        this.total = -1;
        this.usuariosAgrupados = [];
        this.snapshotGenericService.clear(
            ConsultaUsuariosConformidadComponent.SNAPSHOT_KEY
        );

        this.actualizarFiltrosYBuscar();
    }

    override descargarExcel(): void {
        const { _pagina, _tamanoPagina, _sort, _order, filtro } = this.parametros;
        this.usuarioOrganismoPerfilService.exportarUsuariosPerfil(filtro);
    }

    obtenerAcciones(usuario: UsuarioPermisoAgrupado, modoBusqueda: string): AccionBoton[] {
        let acciones: AccionBoton[] = [];

        if (usuario.tienePermisoTodas) {
            return [{
                nombre: 'Eliminar permiso todas las UC',
                ariaLabel: "Eliminar permiso todas las UC usuario id " + usuario.id,
                clase: 'btn btn-success',
                icono: 'fa fa-trash',
                permisos: ['GC_GESTION_USU.BAJA'],
                accion: this.eliminarPerfilTodos.bind(this, usuario),
            },
            {
                nombre: 'Ver todas las UC de SICE',
                ariaLabel: "Ver todas las UC de SICE usuario id " + usuario.id,
                clase: 'btn btn-success',
                icono: 'fa-list',
                permisos: ['GC_GESTION_USU.BAJA', 'GC_GESTION_USU.CONSULTA', 'GC_GESTION_USU.MODIFICACION'],
                accion: this.verTodasUCSice.bind(this, usuario),
            }];
        } else {
            acciones = [{
                nombre: 'Agregar por compra',
                ariaLabel: "Agregar por compra usuario id " + usuario.id,
                clase: 'btn btn-success',
                icono: 'fa fa-shopping-cart',
                permisos: ['GC_GESTION_USU.ALTA'],
                url: ['/administracion/gestion-usuarios/consulta-usuario-conformidad', usuario.id],
            }];

            acciones.push(
                {
                    nombre: 'Agregar por UC',
                    ariaLabel: "Agregar por UC usuario id " + usuario.id,
                    clase: 'btn btn-secondary',
                    icono: 'fa fa-folder',
                    permisos: ['GC_GESTION_USU.ALTA'],
                    accion: this.abrirOrganismoPopup.bind(this, usuario),
                },
                {
                    nombre: 'Agregar todas UC',
                    ariaLabel: "Agregar todas UC usuario id " + usuario.id,
                    clase: 'btn btn-secondary',
                    icono: 'fa fa-sitemap',
                    permisos: ['GC_GESTION_USU.ALTA'],
                    accion: this.guardarPerfilUsuarioParaTodasUc.bind(this, usuario),
                }
            );

            // Ajusto estilo para que el ancho sea correcto
            if (acciones.length === 1) {
                acciones[0].clase += ' btn-una-accion-conformidad';
            }
        }

        return acciones;
    }

    abrirAgregarPermisoPorCompra() {
        const comp = this.abrirPopup(NuevoUsuarioPopupComponent, 'Buscar compra',
            {
                initialState: {
                    titulo: "Agregar usuario con permiso a nivel de la compra",
                    tipoPerfil: TipoPerfil.Conformidad,
                },
            }
        ) as NuevoUsuarioPopupComponent;
        comp.guardarEvento.subscribe((data) =>
            this.abrirBuscadorDeCompra(data)
        );
    }

    abrirAgregarPermisoTodasUcPopup() {
        const comp = this.abrirPopup(NuevoUsuarioPopupComponent, 'Guardar', {
            initialState: {
                titulo: "Agregar usuario con permiso a nivel de todas las UC definidas en SICE para ese usuario",
                tipoPerfil: TipoPerfil.Conformidad,
            },
        }) as NuevoUsuarioPopupComponent;
        comp.guardarEvento.subscribe((data) =>
            this.guardarPerfilNuevoUsuarioParaTodasUc(data)
        );
    }

    abrirNuevoUsuarioUcPopup() {
        const comp = this.abrirPopup(NuevoUsuarioUcPopupComponent, 'Guardar', {
            initialState: {
                titulo: "Agregar usuario con permiso a nivel de una UC",
                tipoPerfil: TipoPerfil.Conformidad,
            },
        }) as NuevoUsuarioUcPopupComponent;
        comp.guardarEvento.subscribe((data) =>
            this.guardarPerfilNuevoUsuarioPorUc(data)
        );
    }

    abrirOrganismoPopup(usuario: UsuarioPermisoAgrupado) {
        const comp = this.abrirPopup(OrganismoPopupComponent, undefined, {
            initialState: {
                usuario: usuario,
            }
        }) as OrganismoPopupComponent;

        //Se setea el usuario seleccionado para que el componente organismo filtre los incisos haciendo la intersección
        comp.idUsuarioSeleccionado = usuario.id;
        comp.guardarEvento.subscribe((data) =>
            this.guardarPerfilUsuarioPorUc(data, usuario)
        );
    }

    guardarPerfilNuevoUsuarioPorUc(data: any): void {
        if (this.modalService.getModalsCount() > 0) {
            this.modalService.hide();
        }

        const filtros = {
            idInciso: data.unidadCompra.idInciso,
            idUnidadEjecutora: data.unidadCompra.idUnidadEjecutora,
            idUnidadCompra: data.unidadCompra.idUnidadCompra,
            idUsuario: data.idUsuario,
        };

        this.usuarioOrganismoPerfilService
            .agregarConformidadUC(filtros.idInciso, filtros.idUnidadEjecutora, filtros.idUnidadCompra, filtros.idUsuario)
            .subscribe(() => {
                this.actualizarServ.mensajeCorrecto('El permiso ha sido agregado de forma exitosa.');
                this.buscar();
            });
    }

    guardarPerfilNuevoUsuarioParaTodasUc(data: any): void {
        if (this.modalService.getModalsCount() > 0) {
            this.modalService.hide();
        }
        setTimeout(() => {
            this.actualizarServ.confirmar('¿Está seguro que desea agregar el permiso a nivel de todas las UC que tiene el usuario en SICE?',
                () => {
                    this.usuarioOrganismoPerfilService.agregarConformidadTodasUc(data.idUsuario)
                        .subscribe(() => {
                            this.actualizarServ.mensajeCorrecto('El permiso ha sido agregado de forma exitosa.');
                            this.buscar();
                        });
                }
            );
        }, 100);
    }

    guardarPerfilUsuarioPorUc(data: any, usuario: UsuarioPermisoAgrupado): void {
        const filtros = {
            idInciso: data.idInciso,
            idUnidadEjecutora: data.idUnidadEjecutora,
            idUnidadCompra: data.idUnidadCompra,
        };

        this.usuarioOrganismoPerfilService.agregarConformidadUC(filtros.idInciso, filtros.idUnidadEjecutora, filtros.idUnidadCompra, usuario.id)
            .subscribe(() => {
                this.actualizarServ.mensajeCorrecto('El permiso ha sido agregado de forma exitosa.');
                this.buscar();
            });
    }

    guardarPerfilUsuarioParaTodasUc(usuario: UsuarioPermisoAgrupado): void {
        this.actualizarServ.confirmar('¿Está seguro que desea agregar el permiso a nivel de todas las UC que tiene el usuario en SICE?',
            () => {
                this.usuarioOrganismoPerfilService.agregarConformidadTodasUc(usuario.id).subscribe(() => {
                    this.actualizarServ.mensajeCorrecto('El permiso ha sido agregado de forma exitosa.');
                    // Refrescar para ver los cambios actualizados con tienePermisoTodas
                    this.buscar();
                })
            }, 100);
    }

    abrirBuscadorDeCompra(usuario: { idUsuario: string }): void {
        this.router.navigate(['/administracion/gestion-usuarios/consulta-usuario-conformidad', usuario.idUsuario,]);
    }

    eliminarPerfilUsuarioEspecifico(permiso: any): void {
        const permisoId = permiso.id;
        this.actualizarServ.confirmar('¿Está seguro que desea quitar el permiso?',
            () =>
                this.usuarioOrganismoPerfilService.eliminarPerfil(permisoId)
                    .subscribe(() => {
                        this.actualizarServ.mensajeCorrecto('Se ha quitado el permiso de forma exitosa.');
                        this.buscar();
                    })
        );
    }

    eliminarPerfilTodos(usuarioAgrupado: any): void {
        const permisoId = usuarioAgrupado.permisoTodasUc?.id;
        if (!permisoId) {
            Logger.logError('No se encontró el permiso global para eliminar.');
            return;
        }
        this.actualizarServ.confirmar('¿Está seguro que desea quitar el permiso?',
            () => {
                this.usuarioOrganismoPerfilService.eliminarPerfil(permisoId)
                    .subscribe(() => {
                        this.actualizarServ.mensajeCorrecto('Se ha quitado la asignación del permiso de forma exitosa.');
                        this.buscar();
                    });
            }
        );
    }

    verTodasUCSice(usuarioAgrupado: any): void {
        this.abrirPopup(UnidadesCompraSicePopupComponent, '', {
            initialState: {
                usuario: usuarioAgrupado,
            },
        });
    }

    ejecutarAccion(accion: AccionBoton): void {
        if (accion.url) {
            this.router.navigate(accion.url);
        }
    }

    onFiltroItemsCambio(filtro: FiltroItemCompraDTO): void {
        this.filtroItem = filtro;
    }

    limpiarFiltroItems(): void {
        this.filtroItem = undefined;
        this.actualizarFiltro();
    }

    private agruparPorUsuario(response: PageModel<UsuarioOrganismoPerfilDTO>, mapa: Map<string, UsuarioPermisoAgrupado>) {
        const usuariosConPermisoGlobal = new Set<string>();
        response.content.forEach((p: UsuarioOrganismoPerfilDTO) => {
            const key = p.idUsuario ?? '';
            if (!p.unidadCompra)
                usuariosConPermisoGlobal.add(key);
        });

        response.content.forEach((p: UsuarioOrganismoPerfilDTO) => {
            const key = p.idUsuario ?? '';
            const permisoGlobal = response.content.find((p) => String(p.idUsuario) === key && !p.unidadCompra);

            if (!mapa.has(key)) {
                mapa.set(key, {
                    id: key,
                    nombre: p.nombre,
                    permisos: [],
                    permisoTodasUc: permisoGlobal,
                    tienePermisoTodas: usuariosConPermisoGlobal.has(
                        key
                    ),
                });
            }
            if (p.unidadCompra) {
                mapa.get(key)!.permisos.push(p);
            }
        });
    }
}
