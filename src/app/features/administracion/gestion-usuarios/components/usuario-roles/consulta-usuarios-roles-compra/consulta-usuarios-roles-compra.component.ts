import { Location } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnInit,
} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take } from 'rxjs';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { CompraDTO } from 'src/app/shared/models/compra.model';
import { TipoCompraDTO } from 'src/app/shared/models/sice/tipo-compra.model';
import { UsuarioDTO } from 'src/app/shared/models/usuario/usuario.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { CompraSiceService } from 'src/app/shared/services/compra-sice.service';
import { TipoCompraService } from 'src/app/shared/services/sice/tipo-compra.service';
import { UsuarioRolesService } from 'src/app/shared/services/usuario/usuario-roles.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { Logger } from 'src/app/shared/utils/logger';
import { mascaraNroAnioCompra } from 'src/app/shared/utils/masks';
import { IConsultaUsuarioOrganismoPerfilFiltroDTO } from '../../../models/consulta-usuario-organismo-perfil-filtro.model';
import { ConsultaUsuariosRolesComponent } from '../consulta-usuarios-roles/consulta-usuarios-roles.component';

@Component({
    selector: 'app-consulta-usuarios-roles-compra',
    templateUrl: './consulta-usuarios-roles-compra.component.html',
    styleUrls: ['./consulta-usuarios-roles-compra.component.scss'],

    standalone: false,
})
export class ConsultaUsuariosRolesCompraComponent
    extends PaginaBusquedaComponent<IConsultaUsuarioOrganismoPerfilFiltroDTO>
    implements OnInit, AfterViewInit {
    public static readonly SNAPSHOT_KEY = 'CONSULTA_USUARIO_ROLES_COMPRA';
    private readonly usuarioCargado$ = new Subject<boolean>();

    tiposCompra: TipoCompraDTO[] = [];
    listaOrden: IColumnaOrden[] = [
        { id: 'numCompra', nombre: 'N° Compra' },
        { id: 'tipoCompra', nombre: 'Tipo Compra' },
    ];
    columnaOrdenInicial = 'numCompra';
    ordenInicial: 'asc' | 'desc' = 'desc';

    permisos: any = {};
    nroCompra!: number;
    usuario!: UsuarioDTO;
    idUsuarioSeleccionado: string | undefined;
    compras: CompraDTO[] = [];
    nroCompraValido = true;

    constructor(
        private readonly fb: FormBuilder,
        private readonly actualizarServ: ActualizarService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly location: Location,
        private readonly snapshotService: SnapshotGenericService,
        private readonly usuarioService: UsuarioService,
        private readonly compraSiceService: CompraSiceService,
        private readonly tipoCompraService: TipoCompraService,
        private readonly usuarioRolesService: UsuarioRolesService,
        private readonly cdr: ChangeDetectorRef
    ) {
        super();
        this.form = this.fb.group({
            idTipoCompra: [''],
            nroAnioCompra: [
                '',
                Validators.pattern(mascaraNroAnioCompra),
            ],
            organismo: [null],
        });

        this.form.addValidators(this.validarFormularioCompleto.bind(this));

        this.form.updateValueAndValidity();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.route.paramMap.subscribe((params) => {
            const idCompuesto = params.has('idUsuario')
                ? params.get('idUsuario')
                : undefined;
            if (idCompuesto) {
                this.idUsuarioSeleccionado = idCompuesto;
                this.obtenerUsuario(idCompuesto);
            }
        });
        this.cargarTiposCompra();
    }

    ngAfterViewInit(): void {
        const paramVolver = this.route.snapshot.queryParamMap.get('volver');

        if (paramVolver === '1') {
            this.buscarVolver();
        } else {
            this.usuarioCargado$.pipe(take(1)).subscribe(() => {
                this.buscarInicial();
            });
        }
    }

    actualizarFiltrosYBuscar(): void {
        this.actualizarFiltro();
        this.buscar(true);
    }

    private buscarInicial() {
        const snap = this.snapshotService.load<any>(
            ConsultaUsuariosRolesComponent.SNAPSHOT_KEY
        );
        if (snap) {
            this.form.patchValue(snap.filtro);
            this.form.get('organismo')?.setValue({
                idInciso: snap.filtro.idInciso,
                idUnidadEjecutora: snap.filtro.idUnidadEjecutora,
                idUnidadCompra: snap.filtro.idUnidadCompra,
            });

            this.cdr.detectChanges();
            this.actualizarFiltro();
            this.buscar(false, snap, true);
        }
    }

    private buscarVolver() {
        const snap = this.snapshotService.load<any>(
            ConsultaUsuariosRolesCompraComponent.SNAPSHOT_KEY
        );

        if (snap) {
            this.parametros = snap;
            this.parametros.pagina = snap.pagina;
            this.parametros.tamanoPagina = snap.tamanoPagina;
            this.parametros.sort = snap.sort;
            this.parametros.order = snap.order;

            if (snap.usuario) {
                this.usuario = snap.usuario;
            }

            this.form.valueChanges.pipe(take(1)).subscribe(() => {
            });

            const formValues = {
                idTipoCompra: snap.filtro.idTipoCompra ?? '',
                nroAnioCompra: snap.filtro.nroAnioCompra ?? '',
                organismo: {
                    idInciso: snap.filtro.idInciso,
                    idUnidadEjecutora: snap.filtro.idUnidadEjecutora,
                    idUnidadCompra: snap.filtro.idUnidadCompra,
                },
            };

            this.form.patchValue(formValues, { emitEvent: false });

            this.cdr.detectChanges();

            setTimeout(() => {
                this.buscar();
            }, 100);
        }

        const soloPath = this.location.path().split('?')[0];
        this.location.replaceState(soloPath);
    }

    validarNroAnioCompra() {
        this.nroCompraValido = !this.form.get('nroAnioCompra')?.invalid;
    }

    private guardarFiltro(): void {

        this.parametros.pagina = this.parametros.pagina ?? 0;
        this.parametros.tamanoPagina = this.parametros.tamanoPagina ?? 10;
        this.parametros.sort = this.parametros.sort ?? this.columnaOrdenInicial;
        this.parametros.order = this.parametros.order ?? this.ordenInicial;

        this.snapshotService.save(
            ConsultaUsuariosRolesCompraComponent.SNAPSHOT_KEY,
            this.parametros
        );
    }

    cambiarFiltro(filtro: any): void {
        this.form.get('idInciso')?.setValue(filtro?.idInciso);
        this.form.get('idUnidadEjecutora')?.setValue(filtro?.idUnidadEjecutora);
        this.form.get('idUnidadCompra')?.setValue(filtro?.idUnidadCompra);
    }

    buscar(resetearPagina: boolean = false, snap?: any, esBusquedaInicial: boolean = false): void {
        if ((esBusquedaInicial && snap?.filtro?.idInciso
            && snap?.filtro?.idUnidadEjecutora && snap?.filtro?.idUnidadCompra)
            || !esBusquedaInicial) {
            this.form.markAllAsTouched();
        }

        const esValido = this.form.valid;

        if (!esValido) return;

        if (resetearPagina) {
            this.parametros.pagina = 0;
        }
        this.guardarFiltro();

        const { pagina, tamanoPagina, sort, order, filtro } = this.parametros;

        this.compraSiceService.obtenerCompras({
            page: pagina,
            size: tamanoPagina,
            sort: sort,
            order: order,
            filtro: filtro,
        }).subscribe((res) => {
                this.compras = res.content;
                this.total = res.page?.totalElements;
            });
    }

    private dividirNroAnioCompra(nroAnioCompraStr: string): {
        numCompra?: number;
        anioCompra?: number;
    } {
        if (nroAnioCompraStr?.includes('/')) {
            const [numCompraStr, anioCompraStr] = nroAnioCompraStr
                .split('/')
                .map((s: string) => s.trim());
            const numCompra = Number(numCompraStr);
            const anioCompra = Number(anioCompraStr);
            if (!isNaN(numCompra) && !isNaN(anioCompra)) {
                return { numCompra, anioCompra };
            }
        }

        return {};
    }

    private actualizarFiltro(): void {
        const organismo = this.form.get('organismo')?.value;
        const { numCompra, anioCompra } = this.dividirNroAnioCompra(
            this.form.get('nroAnioCompra')?.value
        );

        this.parametros.filtro = {
            idTipoCompra: this.form.get('idTipoCompra')?.value,
            idInciso: organismo?.idInciso,
            idUnidadEjecutora: organismo?.idUnidadEjecutora,
            idUnidadCompra: organismo?.idUnidadCompra,
            numCompra: numCompra,
            anioCompra: anioCompra,
            idUsuario: this.usuario?.id,
        };

        const filtroCompleto = {
            idTipoCompra: this.form.get('idTipoCompra')?.value,
            nroAnioCompra: this.form.get('nroAnioCompra')?.value,
            organismo: organismo,
            idInciso: organismo?.idInciso,
            idUnidadEjecutora: organismo?.idUnidadEjecutora,
            idUnidadCompra: organismo?.idUnidadCompra,
            numCompra: numCompra,
            anioCompra: anioCompra,
            idUsuario: this.usuario?.id,
        };

        this.parametros.filtro = filtroCompleto;

        this.parametros.usuario = this.usuario;

    }

    override nuevaConsulta(): void {
        this.form?.reset({ idTipoCompra: '', organismo: null });

        this.parametros.filtro = {};
        this.parametros.pagina = 0;
        this.parametros.order = this.ordenInicial;
        this.parametros.sort = this.columnaOrdenInicial;

        this.compras = [];
        this.total = -1;

        this.snapshotService.clear(
            ConsultaUsuariosRolesCompraComponent.SNAPSHOT_KEY
        );
    }

    volver() {
        this.guardarFiltro();
        this.router.navigate(
            ['/administracion/gestion-usuarios/consulta-usuario-roles'],
            { queryParams: { volver: '1' } }
        );
    }

    obtenerAcciones(compra: CompraDTO): AccionBoton[] {
        const acciones: AccionBoton[] = [
            {
                nombre: 'Asignar',
                ariaLabel: "Asginar roles a toda la compra usuario id " + this.usuario?.id,
                clase: 'btn btn-success ',
                icono: 'fa fa-shopping-cart',
                permisos: ['GC_GESTION_USU.ALTA'],
                accion: this.agregarPermisoPorCompra.bind(this, compra),
            }
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

    cargarTiposCompra() {
        this.tipoCompraService.obtenerTiposCompraSinPaginado().subscribe({
            next: (res) => { this.tiposCompra = res; },
            error: (err) => { Logger.logError('Error cargando tipos de compra:', err); },
        });
    }

    agregarPermisoPorCompra(compra: CompraDTO): void {
        this.actualizarServ.confirmar('¿Está seguro que desea agregar el rol?',
            () => {
                const idCompra = compra?.idCompra;
                const idUsuario = this.usuario?.id;
                if (idCompra && idUsuario) {
                    this.usuarioRolesService.agregarRolPorCompra(idCompra, idUsuario)
                        .subscribe(() => {
                            this.actualizarServ.mensajeCorrecto('El rol ha sido agregado de forma exitosa.')
                            this.buscar();
                        }
                        );
                }
            }
        );
    }

    validarFormularioCompleto(control: AbstractControl): ValidationErrors | null {
        const idUnidadCompra = this.form.get('organismo')?.value?.idUnidadCompra ?? null;
        if (idUnidadCompra == null || (idUnidadCompra && !/^\d+$/.test(idUnidadCompra))) {
            return { unidadCompraInvalido: true };
        }

        return null;
    }
}
