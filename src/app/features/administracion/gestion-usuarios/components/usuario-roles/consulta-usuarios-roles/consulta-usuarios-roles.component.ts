import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { OrganismoPopupComponent } from 'src/app/shared/components/organismo-popup/organismo-popup.component';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { TipoCompraDTO } from 'src/app/shared/models/sice/tipo-compra.model';
import { UsuarioOrganismoPerfilDTO } from 'src/app/shared/models/usuario/usuario-organismo-perfil.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { TipoCompraService } from 'src/app/shared/services/sice/tipo-compra.service';
import { UsuarioRolesService } from 'src/app/shared/services/usuario/usuario-roles.service';
import { dividirNroAnioCompra } from 'src/app/shared/utils/functions';
import { Logger } from 'src/app/shared/utils/logger';
import { mascaraNroAnioCompra } from 'src/app/shared/utils/masks';
import { IConsultaUsuarioOrganismoPerfilFiltroDTO } from '../../../models/consulta-usuario-organismo-perfil-filtro.model';
import { UsuarioPermisoAgrupado } from '../../../models/usuario-permiso-agrupado.model';
import { NuevoUsuarioPopupComponent } from '../../usuario-organismo/nuevo-usuario-popup/nuevo-usuario-popup.component';
import { NuevoUsuarioUcPopupComponent } from '../../usuario-organismo/nuevo-usuario-uc-popup/nuevo-usuario-uc-popup.component';
import { UnidadesCompraSicePopupComponent } from '../../usuario-organismo/unidades-compra-sice-popup/unidades-compra-sice-popup.component';

@Component({
    selector: 'app-consulta-usuarios-roles',
    templateUrl: './consulta-usuarios-roles.component.html',
    styleUrls: ['./consulta-usuarios-roles.component.scss'],
    standalone: false,
})
export class ConsultaUsuariosRolesComponent
    extends PaginaBusquedaComponent<IConsultaUsuarioOrganismoPerfilFiltroDTO>
    implements OnInit {
    listaOrden: IColumnaOrden[] = [
        { id: 'usuarioOrganismo.usuario.nroDocumento', nombre: 'Cédula de identidad' },
        { id: 'usuarioOrganismo.usuario.nombre', nombre: 'Nombre' },
        { id: 'usuarioOrganismo.unidadCompra.id.unidadEjecutora.id.inciso.descInciso', nombre: 'Inciso' },
        { id: 'usuarioOrganismo.unidadCompra.id.unidadEjecutora.descUnidadEjecutora', nombre: 'Unidad ejecutora' },
        { id: 'usuarioOrganismo.unidadCompra.descUnidadCompra', nombre: 'Unidad compra' },
        { id: 'compra.numCompra', nombre: 'N° compra' },
        { id: 'compra.anioCompra', nombre: 'Año compra' },
        { id: 'itemCompra.nroItem', nombre: 'N° ítem' },
    ];

    columnaOrdenInicial = 'usuarioOrganismo.usuario.nroDocumento';
    ordenInicial: 'asc' | 'desc' = 'asc';
    permisos: any = {};
    nroCompra!: number;
    usuariosAgrupados: UsuarioPermisoAgrupado[] = [];

    tiposCompra: TipoCompraDTO[] = [];
    nroCompraValido = true;

    readonly MODO_FILTROS = 'filtros';
    readonly MODO_TODAS_UC = 'todasUc';

    modo: string = this.MODO_FILTROS;

    public static readonly SNAPSHOT_KEY = 'CONSULTA_USUARIO_ROLES';

    constructor(
        private readonly fb: FormBuilder,
        private readonly actualizarServ: ActualizarService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly usuarioRolesService: UsuarioRolesService,
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
            rol: [''],
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
            ConsultaUsuariosRolesComponent.SNAPSHOT_KEY
        );
        if (snap) {
            this.form.patchValue({
                modoBusqueda: snap.filtro.modoBusqueda ?? this.MODO_FILTROS,
                nroDocumento: snap.filtro.nroDocumento ?? '',
                idTipoCompra: snap.filtro.idTipoCompra ?? '',
                nroAnioCompra: snap.filtro.nroAnioCompra ?? '',
                rol: snap.filtro.rol ?? '',
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
            'rol',
            'organismo',
        ];

        controlesAfectados.forEach((c) =>
            deshabilitar
                ? this.form.get(c)!.disable({ emitEvent: false })
                : this.form.get(c)!.enable({ emitEvent: false })
        );
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
        const sortParam = `${sort},${order}`;

        this.usuarioRolesService.obtenerTodos(filtro, pagina, tamanoPagina, sortParam)
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

        this.parametros.filtro = {
            permisoTodas: this.modo === this.MODO_TODAS_UC,
            idTipoCompra: v.idTipoCompra,
            idInciso: organismo?.idInciso,
            idUnidadEjecutora: organismo?.idUnidadEjecutora,
            idUnidadCompra: organismo?.idUnidadCompra,
            nroCompra: numCompra,
            anioCompra: anioCompra,
            rol: v.rol,
            nroDocumento: v.nroDocumento,
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
                rol: undefined,
            });
        }
    }

    private guardarFiltro(): void {
        this.snapshotGenericService.save(
            ConsultaUsuariosRolesComponent.SNAPSHOT_KEY,
            this.parametros
        );
    }

    override nuevaConsulta(): void {
        this.form?.reset({ modoBusqueda: this.MODO_FILTROS, idTipoCompra: '', rol: '' });
        this.parametros.pagina = 0;
        this.parametros.sort = this.columnaOrdenInicial;
        this.parametros.order = this.ordenInicial;
        this.parametros.filtro = {};
        this.total = -1;
        this.usuariosAgrupados = [];
        this.snapshotGenericService.clear(
            ConsultaUsuariosRolesComponent.SNAPSHOT_KEY
        );

        this.actualizarFiltrosYBuscar();
    }

    override descargarExcel(): void {
        const { _pagina, _tamanoPagina, _sort, _order, filtro } = this.parametros;
        this.usuarioRolesService.exportarUsuariosRol(filtro);
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
                accion: this.eliminarRolTodos.bind(this, usuario),
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
                url: ['/administracion/gestion-usuarios/consulta-usuario-roles', usuario.id],
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
                    accion: this.guardarRolUsuarioParaTodasUc.bind(this, usuario),
                }
            );

            if (acciones.length === 1) {
                acciones[0].clase += ' btn-una-accion-roles';
            }
        }

        return acciones;
    }

    obtenerAccionesPermiso(permiso: any): AccionBoton[] {
        return [{
            nombre: 'Eliminar',
            ariaLabel: "Eliminar rol",
            clase: 'btn btn-danger',
            icono: 'fa fa-trash',
            permisos: ['GC_GESTION_USU.BAJA'],
            accion: this.eliminarRolUsuarioEspecifico.bind(this, permiso),
        }];
    }

    abrirAgregarPermisoPorCompra() {
        const comp = this.abrirPopup(NuevoUsuarioPopupComponent, 'Buscar compra',
            {
                initialState: {
                    titulo: "Agregar usuario con rol a nivel de la compra",
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
                titulo: "Agregar usuario con rol a nivel de todas las UC definidas en SICE para ese usuario",
            },
        }) as NuevoUsuarioPopupComponent;
        comp.guardarEvento.subscribe((data) =>
            this.guardarRolNuevoUsuarioParaTodasUc(data)
        );
    }

    abrirNuevoUsuarioUcPopup() {
        const comp = this.abrirPopup(NuevoUsuarioUcPopupComponent, 'Guardar', {
            initialState: {
                titulo: "Agregar usuario con rol a nivel de una UC",
            },
        }) as NuevoUsuarioUcPopupComponent;
        comp.guardarEvento.subscribe((data) =>
            this.guardarRolNuevoUsuarioPorUc(data)
        );
    }

    abrirOrganismoPopup(usuario: UsuarioPermisoAgrupado) {
        const comp = this.abrirPopup(OrganismoPopupComponent, undefined, {
            initialState: {
                usuario: usuario,
            }
        }) as OrganismoPopupComponent;

        comp.idUsuarioSeleccionado = usuario.id;
        comp.guardarEvento.subscribe((data) =>
            this.guardarRolUsuarioPorUc(data, usuario)
        );
    }

    guardarRolNuevoUsuarioPorUc(data: any): void {
        if (this.modalService.getModalsCount() > 0) {
            this.modalService.hide();
        }

        const filtros = {
            idInciso: data.unidadCompra.idInciso,
            idUnidadEjecutora: data.unidadCompra.idUnidadEjecutora,
            idUnidadCompra: data.unidadCompra.idUnidadCompra,
            idUsuario: data.idUsuario,
        };

        this.usuarioRolesService
            .agregarRolUC(filtros.idInciso, filtros.idUnidadEjecutora, filtros.idUnidadCompra, filtros.idUsuario)
            .subscribe(() => {
                this.actualizarServ.mensajeCorrecto('El rol ha sido agregado de forma exitosa.');
                this.buscar();
            });
    }

    guardarRolNuevoUsuarioParaTodasUc(data: any): void {
        if (this.modalService.getModalsCount() > 0) {
            this.modalService.hide();
        }
        setTimeout(() => {
            this.actualizarServ.confirmar('¿Está seguro que desea agregar el rol a nivel de todas las UC que tiene el usuario en SICE?',
                () => {
                    this.usuarioRolesService.agregarRolTodasUc(data.idUsuario)
                        .subscribe(() => {
                            this.actualizarServ.mensajeCorrecto('El rol ha sido agregado de forma exitosa.');
                            this.buscar();
                        });
                }
            );
        }, 100);
    }

    guardarRolUsuarioPorUc(data: any, usuario: UsuarioPermisoAgrupado): void {
        const filtros = {
            idInciso: data.idInciso,
            idUnidadEjecutora: data.idUnidadEjecutora,
            idUnidadCompra: data.idUnidadCompra,
        };

        this.usuarioRolesService.agregarRolUC(filtros.idInciso, filtros.idUnidadEjecutora, filtros.idUnidadCompra, usuario.id)
            .subscribe(() => {
                this.actualizarServ.mensajeCorrecto('El rol ha sido agregado de forma exitosa.');
                this.buscar();
            });
    }

    guardarRolUsuarioParaTodasUc(usuario: UsuarioPermisoAgrupado): void {
        this.actualizarServ.confirmar('¿Está seguro que desea agregar el rol a nivel de todas las UC que tiene el usuario en SICE?',
            () => {
                this.usuarioRolesService.agregarRolTodasUc(usuario.id).subscribe(() => {
                    this.actualizarServ.mensajeCorrecto('El rol ha sido agregado de forma exitosa.');
                    this.buscar();
                })
            }, 100);
    }

    abrirBuscadorDeCompra(usuario: { idUsuario: string }): void {
        this.router.navigate(['/administracion/gestion-usuarios/consulta-usuario-roles', usuario.idUsuario]);
    }

    eliminarRolUsuarioEspecifico(permiso: any): void {
        const permisoId = permiso.id;
        this.actualizarServ.confirmar('¿Está seguro que desea quitar el rol?',
            () =>
                this.usuarioRolesService.eliminarRol(permisoId)
                    .subscribe(() => {
                        this.actualizarServ.mensajeCorrecto('Se ha quitado el rol de forma exitosa.');
                        this.buscar();
                    })
        );
    }

    eliminarRolTodos(usuarioAgrupado: any): void {
        const permisoId = usuarioAgrupado.permisoTodasUc?.id;
        if (!permisoId) {
            Logger.logError('No se encontró el permiso global para eliminar.');
            return;
        }
        this.actualizarServ.confirmar('¿Está seguro que desea quitar el rol?',
            () => {
                this.usuarioRolesService.eliminarRol(permisoId)
                    .subscribe(() => {
                        this.actualizarServ.mensajeCorrecto('Se ha quitado la asignación del rol de forma exitosa.');
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
                    tienePermisoTodas: usuariosConPermisoGlobal.has(key),
                });
            }
            if (p.unidadCompra) {
                mapa.get(key)!.permisos.push(p);
            }
        });
    }
}
