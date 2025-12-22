import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnInit,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take } from 'rxjs';
import { IPuntoRecepcionDTO } from 'src/app/features/administracion/puntos-recepcion/models/punto-recepcion.model';
import { ZonaDto } from 'src/app/features/administracion/puntos-recepcion/models/zona.model';
import { PuntosRecepcionService } from 'src/app/features/administracion/puntos-recepcion/services/puntosRecepcion.service';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { IBusquedaItemDTO } from 'src/app/shared/models/busqueda-item.model';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { ItemCompraDto } from 'src/app/shared/models/item-compra.model';
import { UsuarioDTO } from 'src/app/shared/models/usuario/usuario.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { UsuarioOrganismoPerfilService } from 'src/app/shared/services/usuario/usuario-perfil.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { ZonaService } from 'src/app/shared/services/zona.service';
import { Logger } from 'src/app/shared/utils/logger';
import { IConsultaUsuarioOrganismoPerfilFiltroDTO } from '../../../models/consulta-usuario-organismo-perfil-filtro.model';
import { ConsultaUsuariosRecepcionComponent } from '../consulta-usuarios-recepcion/consulta-usuarios-recepcion.component';

@Component({
    selector: 'app-consulta-usuarios-recepcion-punto',
    templateUrl: './consulta-usuarios-recepcion-punto.component.html',
    standalone: false,
})
export class ConsultaUsuariosRecepcionPuntoComponent
    extends PaginaBusquedaComponent<IConsultaUsuarioOrganismoPerfilFiltroDTO>
    implements OnInit, AfterViewInit {
    private readonly usuarioCargado$ = new Subject<boolean>();

    listaOrden: IColumnaOrden[] = [
        {
            id: 'unidadCompra.id.unidadEjecutora.id.inciso.descInciso',
            nombre: 'Inciso',
        },
        {
            id: 'unidadCompra.id.unidadEjecutora.descUnidadEjecutora',
            nombre: 'Unidad ejecutora',
        },
        {
            id: 'unidadCompra.descUnidadCompra',
            nombre: 'Unidad de compra',
        },
        {
            id: 'nombre',
            nombre: 'Nombre',
        },
    ];

    columnaOrdenInicial = 'nombre';
    ordenInicial: 'asc' | 'desc' = 'asc';

    permisos: any = {};
    usuario!: UsuarioDTO;
    idUsuarioSeleccionado: string | undefined;
    idUsuario!: string;
    opcionesZona: ZonaDto[] = [];

    puntosRecepcion: IPuntoRecepcionDTO[] = [];
    items: ItemCompraDto[] = [];

    constructor(
        private readonly fb: FormBuilder,
        private readonly actualizarServ: ActualizarService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly usuarioService: UsuarioService,
        private readonly usuarioOrganismoPerfilService: UsuarioOrganismoPerfilService,
        private readonly zonaService: ZonaService,
        private readonly puntoRecepcionService: PuntosRecepcionService,
        private readonly snapshotService: SnapshotGenericService,
        private readonly cdr: ChangeDetectorRef) {
        super();

        this.form = this.fb.group({
            idZona: [''],
            nombrePuntoRecepcion: ['', [Validators.minLength(3)]],
            organismo: [''],
        });
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.obtenerDepartamentos();
        this.route.paramMap.subscribe((params) => {
            this.idUsuario = params.get('idUsuario') ?? '';
            if (this.idUsuario) {
                this.idUsuarioSeleccionado = this.idUsuario;
                this.obtenerUsuario(this.idUsuario);
            }
        });
    }

    ngAfterViewInit(): void {
        this.usuarioCargado$.pipe(take(1)).subscribe(() => {
            this.actualizarFiltroBase();
            this.actualizarFiltro();
            this.buscarInicial();
        });
    }

    actualizarFiltrosYBuscar(): void {
        this.actualizarFiltroBase();
        this.actualizarFiltro();
        this.buscar(true);
    }

    onFiltroOrganismo(filtro: any): void {
        this.form.get('filtroBase')?.setValue(filtro);
    }

    onFiltroItemsCambio(filtroItem: IBusquedaItemDTO): void {
        if (filtroItem.tipoBusqueda === 'NROITEM' && filtroItem.item) {
            this.parametros.filtro.nroItem = Number(filtroItem.item);
        } else {
            this.parametros.filtro.nroItem = undefined;
        }
    }

    private buscarInicial() {
        const organismo = this.form.get('organismo');
        const snap = this.snapshotService.load<any>(
            ConsultaUsuariosRecepcionComponent.SNAPSHOT_KEY
        );
        if (snap) {
            this.form.patchValue(snap.filtro);
            organismo?.setValue({
                idInciso: snap.filtro.idInciso,
                idUnidadEjecutora: snap.filtro.idUnidadEjecutora,
                idUnidadCompra: snap.filtro.idUnidadCompra,
            });
        } this.cdr.detectChanges();

        this.actualizarFiltrosYBuscar();
    }

    buscar(resetearPagina: boolean = false): void {
        this.form.markAllAsTouched();

        // Verificar específicamente El nombrePuntoRecepcion
        const nombrePuntoControl = this.form.get('nombrePuntoRecepcion');
        const nombreConError = nombrePuntoControl?.value && nombrePuntoControl.errors?.['minlength'];
        const esValido = this.form.valid && !nombreConError;

        if (esValido) {
            if (resetearPagina) {
                this.parametros.pagina = 0;
            }

            const parametrosFinales = this.construirFiltroCompleto();

            this.puntoRecepcionService.obtenerPuntosRecepcionSinPermisoUsuario(parametrosFinales, this.idUsuario)
                .subscribe((res: any) => {
                    this.puntosRecepcion = res.content.map((punto: any) => {
                        const unidadCompra = punto.unidadCompra;
                        const idUnidadCompra = unidadCompra ? unidadCompra.idUnidadCompra : null;
                        const descUnidadCompra = unidadCompra ? unidadCompra.descUnidadCompra : null;
                        const idUnidadEjecutora = unidadCompra ? unidadCompra.idUnidadEjecutora : null;
                        const descUnidadEjecutora = unidadCompra ? unidadCompra.descUnidadEjecutora : null;
                        const idInciso = unidadCompra ? unidadCompra.idInciso : null;
                        const descInciso = unidadCompra ? unidadCompra.descInciso : null;

                        return {
                            ...punto,
                            idUnidadCompra,
                            descUnidadCompra,
                            idUnidadEjecutora,
                            descUnidadEjecutora,
                            idInciso,
                            descInciso,
                        };
                    });
                    this.total = res.page?.totalElements;
                });
        }
    }

    obtenerDepartamentos() {
        this.zonaService.obtenerZonas().subscribe((respuesta: any) => {
            this.opcionesZona = respuesta;
        });
    }

    actualizarFiltro() {
        const fBase = this.form.get('filtroBase')?.value ?? {};
        const { tipoCompra, nroAnioCompra } = this.form.value;

        const organismo = this.form.get('organismo')?.value;
        const formValores = this.form.value;
        const nombrePuntoControl = this.form.get('nombrePuntoRecepcion');

        // Solo incluir nombrePuntoRecepcion si es válido o está vacío
        const nombrePuntoValido = !nombrePuntoControl?.value || !nombrePuntoControl.errors?.['minlength'];
        const nombrePuntoRecepcion = nombrePuntoValido ? formValores.nombrePuntoRecepcion : '';

        const filtroCompleto = {
            ...fBase,
            tipoCompra: tipoCompra ?? undefined,
            nroAnioCompra: nroAnioCompra ?? undefined,
            idInciso: organismo?.idInciso ?? undefined,
            idUnidadEjecutora: organismo?.idUnidadEjecutora ?? undefined,
            idUnidadCompra: organismo?.idUnidadCompra ?? undefined,
            idZona: formValores.idZona ?? '',
            nombrePuntoRecepcion: nombrePuntoRecepcion,
            inhabilitados: false,
        };
        
        this.parametros.filtro = filtroCompleto;
    }

    override nuevaConsulta(): void {
        this.form?.reset({
            idZona: '',
            nombrePuntoRecepcion: '',
            organismo: null
        });
        this.parametros.pagina = 0;
        this.puntosRecepcion = [];
        this.total = -1;
        this.actualizarFiltrosYBuscar();
    }

    private actualizarFiltroBase(): void {
        const fBase = this.form.get('filtroBase')?.value ?? {};
        const tipoCompra = this.form.get('tipoCompra')?.value;
        const nroAnioCompra = this.form.get('nroAnioCompra')?.value;

        this.parametros.filtro = {
            ...fBase,
            tipoCompra: tipoCompra ?? undefined,
            nroAnioCompra: nroAnioCompra ?? undefined,
            nroItem: this.parametros.filtro?.nroItem, // conservar si ya vino cargado de onFiltroItemsCambio
        };
    }

    volver() {
        this.router.navigate(['/administracion/gestion-usuarios/consulta-usuario-recepcion'], {
            queryParams: { volver: '1' },
        });
    }

    obtenerAccionesItem(puntoRecepcion: IPuntoRecepcionDTO): AccionBoton[] {
        const acciones: AccionBoton[] = [
            {
                nombre: 'Agregar',
                ariaLabel: "Agregar punto de recepción id " + puntoRecepcion.id + " al usuario id " + this.usuario.id,
                clase: 'btn btn-success btn-ancho-fijo-one',
                icono: 'fa fa-plus-circle',
                permisos: ['GC_GESTION_RECEP.ALTA'],
                accion: () => this.agregarPermisoParaPunto(puntoRecepcion),
            },
        ];

        return acciones;
    }

    obtenerUsuario(idCompuesto: string): void {
        this.usuarioService
            .obtenerUsuarioPorId(idCompuesto)
            .subscribe((res: UsuarioDTO) => {
                this.usuario = {
                    id: res.id,
                    nombre: res.nombre,
                    nroDocumento: res.nroDocumento,
                    pais: res.pais,
                    tipoDocumento: res.tipoDocumento,
                };

                this.usuarioCargado$.next(true);
            });
    }

    agregarPermisoParaPunto(puntoRecepcion: IPuntoRecepcionDTO): void {
        this.actualizarServ.confirmar(
            '¿Está seguro que desea asignar el punto de recepción al usuario?',
            () => {
                if (puntoRecepcion.id != null) {
                    this.usuarioOrganismoPerfilService
                        .agregarResponsablePuntoRecepcion(
                            puntoRecepcion.id,
                            this.usuario.id
                        )
                        .subscribe(() => {
                            this.actualizarServ.mensajeCorrecto(
                                'El permiso ha sido agregado de forma exitosa.'
                            );
                            this.buscar();
                        });
                } else {
                    Logger.logError('El id del punto de recepción es nulo.');
                }
            }
        );
    }

    construirFiltroCompleto(): any {
        return {
            page: this.parametros.pagina,
            size: this.parametros.tamanoPagina,
            sort: this.parametros.sort,
            order: this.parametros.order,
            idInciso: this.parametros.filtro.idInciso,
            idUnidadEjecutora: this.parametros.filtro.idUnidadEjecutora,
            idUnidadCompra: this.parametros.filtro.idUnidadCompra,
            idZona: this.parametros.filtro.idZona,
            nombrePuntoRecepcion: this.parametros.filtro.nombrePuntoRecepcion,
            inhabilitados: this.parametros.filtro.inhabilitados,
        };
    }

    puntoInhabilitado(punto: IPuntoRecepcionDTO): boolean {
        return punto.fechaBaja !== undefined && punto.fechaBaja < new Date();
    }
}
