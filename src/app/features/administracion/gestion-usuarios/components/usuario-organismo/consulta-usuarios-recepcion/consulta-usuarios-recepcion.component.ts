import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ZonaDto } from 'src/app/features/administracion/puntos-recepcion/models/zona.model';
import { OrganismoPopupComponent } from 'src/app/shared/components/organismo-popup/organismo-popup.component';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { UsuarioOrganismoPerfilDTO } from 'src/app/shared/models/usuario/usuario-organismo-perfil.model';
import { UsuarioOrganismoDTO } from 'src/app/shared/models/usuario/usuario-organismo.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { UsuarioOrganismoPerfilService } from 'src/app/shared/services/usuario/usuario-perfil.service';
import { ZonaService } from 'src/app/shared/services/zona.service';
import { Logger } from 'src/app/shared/utils/logger';
import { IConsultaUsuarioOrganismoPerfilFiltroDTO } from '../../../models/consulta-usuario-organismo-perfil-filtro.model';
import { UsuarioPermisoAgrupado } from '../../../models/usuario-permiso-agrupado.model';
import { NuevoUsuarioPopupComponent } from '../nuevo-usuario-popup/nuevo-usuario-popup.component';
import { NuevoUsuarioUcPopupComponent } from '../nuevo-usuario-uc-popup/nuevo-usuario-uc-popup.component';
import { UnidadesCompraSicePopupComponent } from '../unidades-compra-sice-popup/unidades-compra-sice-popup.component';

@Component({
    selector: 'app-consulta-usuarios-recepcion',
    templateUrl: './consulta-usuarios-recepcion.component.html',
    styleUrls: ['./consulta-usuarios-recepcion.component.scss'],
    standalone: false,
})
export class ConsultaUsuariosRecepcionComponent
    extends PaginaBusquedaComponent<IConsultaUsuarioOrganismoPerfilFiltroDTO>
    implements OnInit {
    public static readonly SNAPSHOT_KEY = 'CONSULTA_USUARIO_RECEPCION';

    listaOrden: IColumnaOrden[] = [
        { id: 'usuarioOrganismo.usuario.nroDocumento', nombre: 'Cédula de identidad' },
        { id: 'usuarioOrganismo.usuario.nombre', nombre: 'Nombre' },
        { id: 'usuarioOrganismo.unidadCompra.id.unidadEjecutora.id.inciso.descInciso', nombre: 'Inciso' },
        { id: 'usuarioOrganismo.unidadCompra.id.unidadEjecutora.descUnidadEjecutora', nombre: 'Unidad ejecutora' },
        { id: 'usuarioOrganismo.unidadCompra.descUnidadCompra', nombre: 'Unidad compra' },
        { id: 'puntoRecepcion.nombre', nombre: 'Punto de recepción' },
    ];
    columnaOrdenInicial = 'usuarioOrganismo.usuario.nroDocumento';

    ordenInicial: 'asc' | 'desc' = 'asc';

    usuariosAgrupados: UsuarioPermisoAgrupado[] = [];
    usuario!: UsuarioOrganismoDTO;
    opcionesDepartamento: ZonaDto[] = [];

    nombrePuntoRecepcionValido = true;

    readonly MODO_FILTROS = 'filtros';
    readonly MODO_TODOS_PUNTOS = 'todosPuntos';
    constructor(
        private readonly fb: FormBuilder,
        private readonly actualizarServ: ActualizarService,
        protected readonly seguridad: SeguridadService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly usuarioOrganismoPerfilService: UsuarioOrganismoPerfilService,
        private readonly zonaSrv: ZonaService,
        private readonly snapshotService: SnapshotGenericService
    ) {
        super(); this.form = this.fb.group({
            modoBusqueda: [this.MODO_FILTROS],
            nroDocumento: ['', Validators.minLength(7)],
            filtroBase: [null],
            idZona: [''],
            nombrePuntoRecepcion: ['', [Validators.minLength(3)]],
            organismo: [null],
        });

        this.form.get('modoBusqueda')!.valueChanges.subscribe((m) => this.toggleCamposPorModo(m));

    }

    validarNombrePuntoRecepcion(): void {
        this.nombrePuntoRecepcionValido = !this.form.get('nombrePuntoRecepcion')?.errors?.['minlength'];
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.obtenerDepartamentos();
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
        const snap = this.snapshotService.load<any>(ConsultaUsuariosRecepcionComponent.SNAPSHOT_KEY);
        if (snap) {
            this.parametros = snap;
            this.form.patchValue(snap.filtro);
            if (
                snap.filtro.idInciso ||
                snap.filtro.idUnidadEjecutora ||
                snap.filtro.idUnidadCompra
            ) {
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

    private actualizarFiltro(): void {
        const organismo = this.form.get('organismo')?.value;
        const modoBusqueda = this.form.get('modoBusqueda')?.value;
        const valores = this.form.value;
        const nombrePuntoRecepcion = this.form.get('nombrePuntoRecepcion');

        // Verificar si El cumple con la validación de mínimo 3 caracteres
        const nombrePuntoRecepcionValido =
            !nombrePuntoRecepcion?.value ||
            !nombrePuntoRecepcion.errors?.['minlength'];

        let filtro: IConsultaUsuarioOrganismoPerfilFiltroDTO = {
            permisoTodas: modoBusqueda === this.MODO_TODOS_PUNTOS,
            idInciso: organismo?.idInciso,
            idUnidadEjecutora: organismo?.idUnidadEjecutora,
            idUnidadCompra: organismo?.idUnidadCompra,
            idZona: valores.idZona ?? undefined,
            nombrePuntoRecepcion: nombrePuntoRecepcionValido ? valores.nombrePuntoRecepcion : undefined,
            nroDocumento: valores.nroDocumento ?? undefined,
            tipoPerfil: TipoPerfil.Recepcion,
        };

        if (modoBusqueda === this.MODO_TODOS_PUNTOS) {
            filtro = {
                permisoTodas: true,
                tipoPerfil: TipoPerfil.Recepcion,
                nroDocumento: valores.nroDocumento ?? undefined,
            };
        }

        this.parametros.filtro = filtro;
    }

    private toggleCamposPorModo(modo: string): void {
        const deshabilitar = modo === this.MODO_TODOS_PUNTOS;
        ['filtroBase', 'idZona', 'nombrePuntoRecepcion', 'organismo'].forEach(
            (ctrl) =>
                deshabilitar
                    ? this.form.get(ctrl)!.disable({ emitEvent: false })
                    : this.form.get(ctrl)!.enable({ emitEvent: false }));
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
                nombre: 'Agregar por punto',
                ariaLabel: "Agregar por punto usuario id " + usuario.id,
                clase: 'btn btn-success',
                icono: 'fa fa-plus',
                permisos: ['GC_GESTION_USU.ALTA'],
                url: ['/administracion/gestion-usuarios/consulta-usuario-recepcion', usuario.id],
            }];

            if (!usuario.tienePermisoTodas) {
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
                        accion: this.guardarPerfilUsuarioTodasUc.bind(this, usuario),
                    }
                );
            }

            if (acciones.length === 1) {
                acciones[0].clase += ' btn-una-accion-recepcion';
            }
        }

        return acciones;
    }

    actualizarFiltrosYBuscar(): void {
        this.actualizarFiltro();
        this.buscar(true);
    }


    buscar(resetearPagina: boolean = false): void {
        this.form.markAllAsTouched();

        const modo = this.form.get('modoBusqueda')?.value;

        // Verifica la validez del formulario
        let esValido = modo === this.MODO_TODOS_PUNTOS ? true : this.form.valid;

        // Verificación específica para El nombrePuntoRecepcion cuando tiene contenido
        if (modo === this.MODO_FILTROS && !this.nombrePuntoRecepcionValido) {
            esValido = false;
        }

        if (!esValido) return;

        if (resetearPagina) {
            this.parametros.pagina = 0;
        }

        this.guardarFiltro();

        const { pagina, tamanoPagina, sort, order, filtro } = this.parametros;
        filtro.tipoPerfil = TipoPerfil.Recepcion;
        const sortParam = `${sort},${order}`;

        this.usuarioOrganismoPerfilService.obtenerTodos(filtro, pagina, tamanoPagina, sortParam).pipe(
            map((response) => {
                const mapa = new Map<string, UsuarioPermisoAgrupado>();

                this.agruparPorUsuario(response, mapa);

                mapa.forEach(u => { u.acciones = this.obtenerAcciones(u, modo); });

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

    abrirBuscadorDePuntos(usuario: { idUsuario: string }): void {
        this.router.navigate(['/administracion/gestion-usuarios/consulta-usuario-recepcion', usuario.idUsuario,]);
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

    abrirAgregarPermisoPorPunto(): void {
        const comp = this.abrirPopup(NuevoUsuarioPopupComponent, 'Buscar punto de recepción',
            {
                initialState: {
                    titulo: "Agregar usuario con permiso a nivel del punto de recepción",
                    tipoPerfil: TipoPerfil.Recepcion,
                },
            }
        ) as NuevoUsuarioPopupComponent;
        comp.guardarEvento.subscribe((data) => this.abrirBuscadorDePuntos(data));
    }

    abrirNuevoUsuarioUcPopup(): void {
        const comp = this.abrirPopup(NuevoUsuarioUcPopupComponent, undefined, {
            initialState: {
                titulo: "Agregar usuario con permiso a nivel de una UC",
                tipoPerfil: TipoPerfil.Recepcion,
            },
        }) as NuevoUsuarioUcPopupComponent;
        comp.guardarEvento.subscribe((data) =>
            this.guardarPerfilNuevoUsuarioPorUc(data)
        );
    }

    abrirAgregarUsuarioTodasLasUc(): void {
        const comp = this.abrirPopup(NuevoUsuarioPopupComponent, 'Guardar', {
            initialState: {
                titulo: "Agregar usuario con permiso a nivel de todas las UC definidas en SICE para ese usuario",
                tipoPerfil: TipoPerfil.Recepcion,
            },
        }) as NuevoUsuarioPopupComponent;
        comp.guardarEvento.subscribe((data) =>
            this.guardarPerfilNuevoUsuarioParaTodasUc(data));
    }

    guardarPerfilUsuarioPorUc(data: any, usuario: UsuarioPermisoAgrupado): void {
        const idInciso = data.idInciso;
        const idUnidadEjecutora = data.idUnidadEjecutora;
        const idUnidadCompra = data.idUnidadCompra;

        if (idInciso !== undefined && idUnidadEjecutora !== undefined && idUnidadCompra !== undefined) {
            this.usuarioOrganismoPerfilService
                .agregarResponsableRecepcionUC(idInciso, idUnidadEjecutora, idUnidadCompra, usuario.id)
                .subscribe(() => {
                    this.actualizarServ.mensajeCorrecto(
                        'El permiso ha sido agregado de forma exitosa.'
                    );
                    this.buscar();
                });
        } else {
            Logger.logError('Uno o más identificadores son indefinidos.');
        }
    }

    guardarPerfilUsuarioTodasUc(usuario: UsuarioPermisoAgrupado): void {
        this.actualizarServ.confirmar('¿Está seguro que desea agregar el permiso a nivel de todas las UC que tiene el usuario en SICE?', () => {
            this.usuarioOrganismoPerfilService.agregarResponsableRecepcionUCTodas(usuario.id).subscribe(() => {
                this.actualizarServ.mensajeCorrecto('El permiso ha sido agregado de forma exitosa.');
                // Actualizar el estado localmente para evitar una nueva consulta
                usuario.tienePermisoTodas = true;
                this.buscar();
            });
        });
    }
    guardarPerfilNuevoUsuarioParaTodasUc(data: any): void {
        this.actualizarServ.confirmar('¿Está seguro que desea agregar el permiso a nivel de todas las UC que tiene el usuario en SICE?', () => {
            this.usuarioOrganismoPerfilService.agregarResponsableRecepcionUCTodas(data.idUsuario).subscribe(() => {
                this.actualizarServ.mensajeCorrecto('El permiso ha sido agregado de forma exitosa.');
                // Refrescar para ver los cambios actualizados con tienePermisoTodas
                this.buscar();
            });
        });
    }

    guardarPerfilNuevoUsuarioPorUc(data: any): void {
        if (this.modalService.getModalsCount() > 0) {
            this.modalService.hide();
        }
        const idInciso = data.unidadCompra.idInciso;
        const idUnidadEjecutora = data.unidadCompra.idUnidadEjecutora;
        const idUnidadCompra = data.unidadCompra.idUnidadCompra;

        if (idInciso !== undefined && idUnidadEjecutora !== undefined && idUnidadCompra !== undefined) {
            this.usuarioOrganismoPerfilService.agregarResponsableRecepcionUC(idInciso, idUnidadEjecutora, idUnidadCompra, data.idUsuario)
                .subscribe(() => {
                    this.actualizarServ.mensajeCorrecto('El permiso ha sido agregado de forma exitosa.');
                    this.buscar();
                });
        } else {
            Logger.logError('Uno o más identificadores son indefinidos.');
        }
    }

    eliminarPerfilUsuarioEspecifico(permiso: any): void {
        const permisoId = permiso.id;
        this.actualizarServ.confirmar('¿Está seguro que desea quitar el permiso?', () => {
            this.usuarioOrganismoPerfilService.eliminarPerfil(permisoId).subscribe(() => {
                this.actualizarServ.mensajeCorrecto('Se ha quitado la asignación del permiso de forma exitosa.');
                this.buscar();
            });
        });
    }

    eliminarPerfilTodos(usuarioAgrupado: any): void {
        const permisoId = usuarioAgrupado.permisoTodasUc?.id;
        if (!permisoId) {
            Logger.logError('No se encontró el permiso global para eliminar.');
            return;
        }
        this.actualizarServ.confirmar('¿Está seguro que desea quitar el permiso?', () => {
            this.usuarioOrganismoPerfilService.eliminarPerfil(permisoId)
                .subscribe(() => {
                    this.actualizarServ.mensajeCorrecto('Se ha quitado la asignación del permiso de forma exitosa.');
                    this.buscar();
                });
        });
    }

    verTodasUCSice(usuarioAgrupado: any): void {
        this.abrirPopup(UnidadesCompraSicePopupComponent, '', {
            initialState: {
                usuario: usuarioAgrupado,
            },
        });
    }
    obtenerDepartamentos(): void {
        this.zonaSrv.obtenerZonas().subscribe((zonas: any[]) => {
            this.opcionesDepartamento = zonas;
        });
    }

    ejecutarAccion(accion: AccionBoton): void {
        if (accion.url) {
            this.router.navigate(accion.url);
        }
    }

    override descargarExcel(): void {
        this.actualizarFiltro();
        const { _pagina, _tamanoPagina, _sort, _order, filtro } = this.parametros;
        this.usuarioOrganismoPerfilService.exportarUsuariosPerfil(filtro);
    }

    onFiltroOrganismo(filtro: any): void {
        this.form.get('filtroBase')?.setValue(filtro);
    }
    
    override nuevaConsulta(): void {
        this.form?.reset({
            modoBusqueda: this.MODO_FILTROS,
            idZona: '',
            nombrePuntoRecepcion: '',
            organismo: null,
        });
        this.parametros.filtro = {};
        this.parametros.pagina = 0;
        this.parametros.order = this.ordenInicial;
        this.parametros.sort = this.columnaOrdenInicial;

        this.usuariosAgrupados = [];
        this.total = -1;

        this.snapshotService.clear(ConsultaUsuariosRecepcionComponent.SNAPSHOT_KEY);
        this.actualizarFiltrosYBuscar();
    }

    private guardarFiltro(): void {
        this.snapshotService.save(ConsultaUsuariosRecepcionComponent.SNAPSHOT_KEY, this.parametros);
    }
}
