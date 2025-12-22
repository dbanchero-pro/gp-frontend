import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IPuntoRecepcionDTO } from 'src/app/features/administracion/puntos-recepcion/models/punto-recepcion.model';
import { ZonaDto } from 'src/app/features/administracion/puntos-recepcion/models/zona.model';
import { IOrdenCompraDTO } from 'src/app/features/entregas/models/orden-ompra.model';
import { AccionBoton } from 'src/app/shared/components/boton-accion/boton-accion.component';
import { GrupoColapsableComponent } from 'src/app/shared/components/grupo-colapsable/grupo-colapsable.component';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { EstadoOrdenCompra } from 'src/app/shared/enum/estado-orden-compra.enum';
import { Pais } from 'src/app/shared/enum/pais.enum';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { IPaisDTO } from 'src/app/shared/models/common/pais.model';
import { ProveedorDTO } from 'src/app/shared/models/proveedor/proveedor.model';
import { ITipoDocumentoProveedorDTO } from 'src/app/shared/models/proveedor/tipo-documento-proveedor.model';
import { TipoCompraDTO } from 'src/app/shared/models/sice/tipo-compra.model';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { TipoCompraService } from 'src/app/shared/services/sice/tipo-compra.service';
import { PaisService } from 'src/app/shared/services/usuario/pais.service';
import { TipoDocumentoProveedorService } from 'src/app/shared/services/usuario/tipo-documento-proveedor.service';
import { ZonaService } from 'src/app/shared/services/zona.service';
import { cambiaUC } from 'src/app/shared/utils/functions';
import { Logger } from 'src/app/shared/utils/logger';
import { mascaraNroAnioCompra } from 'src/app/shared/utils/masks';
import { TipoSeguimiento } from '../../../enum/tipo-seguimiento.enum';
import { IFiltroOrdenCompra } from '../../../models/filtros/filtro-seguimiento-entrega.model';
import { PuntoRecepcionPopupComponent } from '../../comun/punto-recepcion-popup/punto-recepcion-popup.component';

@Component({
    selector: 'app-seguimiento-entrega-proveedor-organismo',
    templateUrl: './seguimiento-entrega-proveedor-organismo.component.html',
    styleUrls: ['./seguimiento-entrega-proveedor-organismo.component.scss'],
    standalone: false
})

export class SeguimientoEntregaProveedorOrganismoComponent extends PaginaBusquedaComponent<IFiltroOrdenCompra> implements OnInit, AfterViewInit {
    @ViewChild('grupoCompra') grupoCompra!: GrupoColapsableComponent;
    @ViewChild('grupoOC') grupoOC!: GrupoColapsableComponent;
    @ViewChild('grupoProveedor') grupoProveedor!: GrupoColapsableComponent;


    tiposEstado = [
        { id: null, nombre: 'Todos los estados' },
        { id: EstadoOrdenCompra.Pendiente, nombre: EstadoOrdenCompra.Pendiente },
        { id: EstadoOrdenCompra.Finalizada, nombre: EstadoOrdenCompra.Finalizada }
    ];

    listaOrden: IColumnaOrden[] = [
        { id: 'unidadCompra.id.unidadEjecutora.id.inciso.descInciso', nombre: 'Inciso (orden compra)' },
        { id: 'unidadCompra.id.unidadEjecutora.descUnidadEjecutora', nombre: 'Unidad ejecutora (orden compra)' },
        { id: 'unidadCompra.descUnidadCompra', nombre: 'Unidad compra (orden compra)' },
        { id: 'nroOC', nombre: 'N° OC' },
    ];

    columnaOrdenInicial = 'nroOC';
    ordenInicial: 'asc' | 'desc' = 'desc';

    tipoSeguimiento!: TipoSeguimiento;
    TipoSeguimiento = TipoSeguimiento;
    tiposCompra: TipoCompraDTO[] = [];
    proveedores: ProveedorDTO[] = [];
    departamentos: ZonaDto[] = [];
    tipoUsuario!: TipoUsuario;
    EstadoOrdenCompra = EstadoOrdenCompra;
    nroCompraValido: boolean = true;
    nroOcValido: boolean = true;
    proveedorDeshabilitado: boolean = false;
    paises: IPaisDTO[] = [];
    tiposDocumento: ITipoDocumentoProveedorDTO[] = [];
    entCol: boolean[] = [];

    ordenesCompra: IOrdenCompraDTO[] = [];

    // Variables para colapsables de filtros
    colCompra: boolean = true;
    colOC: boolean = true;
    colProveedor: boolean = true;
    Pais = Pais;

    static readonly SNAPSHOT_KEY = 'seguimiento-entregas-filtros';

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly tipoCompraService: TipoCompraService,
        private readonly zonaService: ZonaService,
        protected readonly seguridadService: SeguridadService,
        private readonly tipoDocumentoService: TipoDocumentoProveedorService,
        private readonly paisService: PaisService,
        private readonly ordenCompraService: OrdenCompraService,
        private readonly snapshotGenericService: SnapshotGenericService,
        protected readonly seguridad: SeguridadService
    ) {
        super();

        this.tipoSeguimiento = this.route.snapshot.data['tipoSeguimiento'];
        this.form = this.fb.group(
            {
                filtroBase: [null],
                estado: [EstadoOrdenCompra.Pendiente],
                tipoCompra: [null],
                proveedor: [null],
                idZona: [null],
                nroDocumento: [''],
                tipoDoc: [null],
                paisDoc: [null],
                nroOC: ['', Validators.pattern('^[0-9]+$')],
                nroAnioCompra: ['', Validators.pattern(mascaraNroAnioCompra)],
                organismoCompra: [null],
                organismoOc: [null],
                soloOCAjustesPendientes: [false]

            });
    }

    override ngOnInit(): void {
        super.ngOnInit();
        
        const paramVolver = this.route.snapshot.queryParamMap.get('volver');
        if (paramVolver === '1') {
            this.restaurarFiltro();
            const currentUrl = this.router.url.split('?')[0];
            this.router.navigateByUrl(currentUrl, { replaceUrl: true });
        } else {
            this.nuevaConsulta();
        }
        this.obtenerDepartamentos();
        if (this.tipoSeguimiento === TipoSeguimiento.Proveedor) {
            this.obtenerProveedores();
            this.colOC = false;
        } else {
            this.cargarPaises();
            this.cargarTiposDocumentoProveedor();
            this.obtenerTiposCompra();
            this.colCompra = false;
        }

        this.tipoUsuario = this.seguridadService.obtenerTipoUsuario();
    }

    fechaEntregaParaProveedor(ordenCompra: IOrdenCompraDTO): boolean {
        if (ordenCompra.proximoAVencerse && this.tipoUsuario === TipoUsuario.PROVEEDOR) {
            return true;
        }
        return false;
    }

    ngAfterViewInit(): void {
        this.actualizarFiltrosYBuscar();
    }

    obtenerTiposCompra() {
        this.tipoCompraService.obtenerTiposCompraSinPaginado().subscribe({
            next: (res) => {
                this.tiposCompra = res;
            }
        });
    }

    obtenerDepartamentos() {
        this.zonaService.obtenerZonas().subscribe({
            next: (respuesta: ZonaDto[]) => {
                this.departamentos = respuesta;
            }
        });
    }

    obtenerProveedores() {
        if (this.seguridadService.usuarioLogueadoEsUsuarioProveedor()) {
            this.proveedores = this.seguridadService.obtenerProveedores();

            this.validarCantidadProveedores();
        }
    }

    validarCantidadProveedores() {
        if (this.proveedores.length === 1) {
            const proveedorUnico = this.proveedores[0];
            this.form.get('proveedor')?.setValue(proveedorUnico.id);
            this.form.get('proveedor')?.disable();
            this.proveedorDeshabilitado = true;
        } else {
            this.form.get('proveedor')?.enable();
            this.proveedorDeshabilitado = false;
        }
    }

    onFiltroOrganismo(filtro: any): void {
        this.form.get('filtroBase')?.setValue(filtro);
    }
    actualizarFiltrosYBuscar(): void {
        this.actualizarFiltroBase();
        this.actualizarFiltro();
        this.buscar();
    }

    buscar(): void {
        this.form.markAllAsTouched();
        const esValido = this.form.valid;
        if (esValido) {
            this.parametros.pagina ??= 0;
            this.guardarFiltro();

            Logger.logInfo('Parametros de búsqueda: ', this.parametros);

            const params = {
                filtro: this.parametros.filtro,
                pagina: this.parametros.pagina ?? 0,
                tamanoPagina: this.parametros.tamanoPagina ?? 10,
                sort: this.parametros.sort ?? this.columnaOrdenInicial,
                order: this.parametros.order ?? this.ordenInicial
            };

            const esProveedor = this.tipoSeguimiento === TipoSeguimiento.Proveedor;
            const obs = esProveedor
                ? this.ordenCompraService.buscarProveedor(params)
                : this.ordenCompraService.buscarOrganismo(params);

            obs.subscribe({
                next: (res: PageModel<IOrdenCompraDTO>) => {
                    Logger.logInfo('Respuesta búsqueda:', res);
                    this.ordenesCompra = res.content;
                    this.total = res.page?.totalElements ?? this.ordenesCompra.length;
                },
                error: (err: any) => {
                    Logger.logInfo('Error en búsqueda:', err);
                    this.ordenesCompra = [];
                    this.total = 0;
                }
            });
        }
    }

    private setearFiltrosProveedor(filtro: IFiltroOrdenCompra) {
        filtro.estadoOrdenCompra = this.form.get('estado')?.value;
        const proveedorId = this.form.get('proveedor')?.value;
        const proveedorObj = this.proveedores.find(p => p.id === proveedorId);
        if (proveedorObj) {
            filtro.proveedor = {
                paisDocumento: proveedorObj.paisDocumento,
                tipoDocumento: proveedorObj.tipoDocumento,
                nroDocumento: proveedorObj.nroDocumento,
                id: proveedorObj.id,
                nombre: proveedorObj.nombre
            };
        } else {
            filtro.proveedor = undefined;
        }
        filtro.idZona = this.form.get('idZona')?.value;
        filtro.nroOC = this.form.get('nroOC')?.value;

        const organismoOc = this.form.get('organismoOc')?.value;
        filtro.idIncisoOc = organismoOc?.idInciso;
        filtro.idUnidadEjecutoraOc = organismoOc?.idUnidadEjecutora;
        filtro.idUnidadCompraOc = organismoOc?.idUnidadCompra;
    }

    private setearFiltrosOrganismo(filtro: IFiltroOrdenCompra): void {
        const organismoOc = this.form.get('organismoOc')?.value;
        const organismoCompra = this.form.get('organismoCompra')?.value;

        const nroAnioCompraValue = this.form.get('nroAnioCompra')?.value;
        if (nroAnioCompraValue) {
            const [numCompra, anioCompra] = nroAnioCompraValue.split('/');
            filtro.numCompra = numCompra ? parseInt(numCompra, 10) : undefined;
            filtro.anioCompra = anioCompra ? parseInt(anioCompra, 10) : undefined;
        }

        filtro.tipoCompra = this.form.get('tipoCompra')?.value;
        filtro.nroOC = this.form.get('nroOC')?.value;

        filtro.idZona = this.form.get('idZona')?.value;

        filtro.idIncisoOc = organismoOc?.idInciso;
        filtro.idUnidadEjecutoraOc = organismoOc?.idUnidadEjecutora;
        filtro.idUnidadCompraOc = organismoOc?.idUnidadCompra;

        filtro.idInciso = organismoCompra?.idInciso;
        filtro.idUnidadEjecutora = organismoCompra?.idUnidadEjecutora;
        filtro.idUnidadCompra = organismoCompra?.idUnidadCompra;

        filtro.idTipoDocumento = this.form.get('tipoDoc')?.value;
        filtro.idPais = this.form.get('paisDoc')?.value;
        filtro.nroDocumento = this.form.get('nroDocumento')?.value;
    }

    actualizarFiltro(): void {
        
        const filtroCompleto: Partial<IFiltroOrdenCompra> = {
            estadoOrdenCompra: this.form.get('estado')?.value,
            soloOCAjustesPendientes: this.form.get('soloOCAjustesPendientes')?.value
        };

        if (this.tipoSeguimiento === TipoSeguimiento.Proveedor) {
            this.setearFiltrosProveedor(filtroCompleto as IFiltroOrdenCompra);
        } else if (this.tipoSeguimiento === TipoSeguimiento.Organismo) {
            this.setearFiltrosOrganismo(filtroCompleto as IFiltroOrdenCompra);
        }

        this.parametros.filtro = filtroCompleto;
    }

    override nuevaConsulta(): void {
        this.form?.reset({ estado: EstadoOrdenCompra.Pendiente });
        this.resetearEstadosDeFormControls();
        this.nroCompraValido = true;
        this.nroOcValido = true;
        this.validarCantidadProveedores();
        this.parametros.pagina = 0;
        this.ordenesCompra = [];
        this.parametros.filtro = {};
        this.parametros.order = this.ordenInicial;
        this.parametros.sort = this.columnaOrdenInicial;
        this.total = -1;
        this.buscar();
    }

    private actualizarFiltroBase(): void {
        this.parametros.filtro = this.form.get('filtroBase')?.value ?? {};
    }

    validarNroAnioCompra(): void {
        const control = this.form.get('nroAnioCompra');
        this.nroCompraValido = !control?.invalid;

        // Si el campo está vacío, restablecemos el estado
        if (control?.value === '' || control?.value === null) {
            control.markAsPristine();
            control.markAsUntouched();
            this.nroCompraValido = true;
        }
    }

    validarNroOc(): void {
        const control = this.form.get('nroOC');
        this.nroOcValido = !control?.invalid;

        // Si el campo está vacío, restablecemos el estado
        if (control?.value === '' || control?.value === null) {
            control.markAsPristine();
            control.markAsUntouched();
            this.nroOcValido = true;
        }
    }

    verItems(ordenCompra: IOrdenCompraDTO): void {
        this.router.navigate(['ordenes', ordenCompra.idOC, 'items'], { relativeTo: this.route });
    }

    verAjustes(ordenCompra: IOrdenCompraDTO): void {
        this.router.navigate(['/ajustes', ordenCompra.idOC], { queryParams: { volver: '1' } });
    }

    private guardarFiltro(): void {
        this.snapshotGenericService.save(
            SeguimientoEntregaProveedorOrganismoComponent.SNAPSHOT_KEY,
            {
                filtro: this.form.getRawValue(),
                pagina: this.parametros.pagina,
                tamanoPagina: this.parametros.tamanoPagina,
                sort: this.parametros.sort,
                order: this.parametros.order,

                estadoDesplegables: {
                    colCompra: this.grupoCompra?.colapsado,
                    colOC: this.grupoOC?.colapsado,
                    colProveedor: this.grupoProveedor?.colapsado
                }
            }
        );
    }

    private restaurarFiltro(): void {
        const snap = this.snapshotGenericService.load<any>(
            SeguimientoEntregaProveedorOrganismoComponent.SNAPSHOT_KEY
        );
        if (snap) {
            this.form.patchValue(snap.filtro);
            this.parametros.pagina = snap.pagina ?? 0;
            this.parametros.tamanoPagina = snap.tamanoPagina ?? 10;
            this.parametros.sort = snap.sort ?? this.columnaOrdenInicial;
            this.parametros.order = snap.order ?? this.ordenInicial;

            if (snap.estadoDesplegables) {
                this.colCompra = snap.estadoDesplegables.colCompra ?? true;
                this.colOC = snap.estadoDesplegables.colOC ?? true;
                this.colProveedor = snap.estadoDesplegables.colProveedor ?? true;
            }
        }
    }

    cambioTipoDoc(): void {
        setTimeout(() => {
            const ctrl = this.form.get('nroDocumento');
            if (ctrl) {
                ctrl.setValue(ctrl.value);
            }
        });
    }

    cargarPaises(): void {
        this.paisService.obtenerTodos().subscribe((paises) => {
            this.paises = paises;
        });
    }

    cargarTiposDocumentoProveedor() {
        this.tipoDocumentoService.obtenerTiposDocumentoProveedor(0, 1000, 'descripcion,asc')
            .subscribe(resp => this.tiposDocumento = resp.content);
    }

    abrirPopupPuntoRecepcion(puntoRecepcion: IPuntoRecepcionDTO): void {
        const textoInhabilitado = puntoRecepcion?.fechaBaja && puntoRecepcion?.fechaBaja != null ? '(inhabilitado)' : '';

        const modalConfig = {
            initialState: {
                puntoRecepcion,
                titulo: 'Detalle del punto de recepción ' + textoInhabilitado
            },
            class: 'modal-dialog-centered modal-xl'
        };

        this.abrirPopup(PuntoRecepcionPopupComponent, 'Detalle del punto de recepción', modalConfig);
    }

    override descargarExcel(): void {

        this.actualizarFiltro();
        this.guardarFiltro();

        Logger.logInfo('Parametros de búsqueda: ', this.parametros);

        const params = {
            filtro: this.parametros.filtro,
            sort: this.parametros.sort ?? this.columnaOrdenInicial,
            order: this.parametros.order ?? this.ordenInicial
        };

        if (this.tipoUsuario === TipoUsuario.PROVEEDOR) {
            this.ordenCompraService.exportarExcelProveedor(
                params
            );
        } else {
            this.ordenCompraService.exportarExcelOrganismo(
                params
            );
        }
    }

    
    abrirCoordenadas(puntoRecepcion: IPuntoRecepcionDTO) {
        window.open('https://www.google.com/maps/search/?api=1&query=' + puntoRecepcion.latitud + ',' + puntoRecepcion.longitud, '_blank');
    }

    cambiaUC(ordenCompra: IOrdenCompraDTO): boolean {
        return cambiaUC(ordenCompra);
    }

    private resetearEstadosDeFormControls(): void {
        Object.keys(this.form.controls).forEach(key => {
            const control = this.form.get(key);
            if (control) {
                control.markAsUntouched();
                control.markAsPristine();
                control.updateValueAndValidity();
            }
        });
    }

    protected obtenerAcciones(oc: IOrdenCompraDTO): AccionBoton[] {
        const acciones: AccionBoton[] = [];
        acciones.push({
            nombre: 'Ver ítems',
            ariaLabel: "Ver ítems de OC id " + oc.idOC,
            clase: 'btn-success btn-ancho-fijo',
            icono: 'fa fa-list-ul',
            permisos: this.tipoUsuario == TipoUsuario.PROVEEDOR ? [] :
                ['GC_GESTION_ENTR.CONSULTA',
                    'GC_GESTION_ENTR.ALTA',
                    'GC_GESTION_ENTR.MODIFICACION',
                    'GC_GESTION_ENTR.BAJA',
                    'GC_GESTION_ENTR.IMPRESION',
                    'GC_GESTION_RECEP.CONSULTA',
                    'GC_GESTION_RECEP.ALTA',
                    'GC_GESTION_RECEP.MODIFICACION',
                    'GC_GESTION_RECEP.BAJA',
                    'GC_GESTION_RECEP.IMPRESION',
                    'GC_GESTION_CONF.CONSULTA',
                    'GC_GESTION_CONF.ALTA',
                    'GC_GESTION_CONF.MODIFICACION',
                    'GC_GESTION_CONF.BAJA',
                    'GC_GESTION_CONF.IMPRESION'],
            accion: () => this.verItems(oc)
        });

        acciones.push({
            nombre: 'Ver ajustes',
            ariaLabel: "Ver ajustes de OC id " + oc.idOC,
            clase: 'btn-success btn-ancho-fijo',
            icono: 'fa fa-cog',
            permisos: this.tipoUsuario == TipoUsuario.PROVEEDOR ? [] :
                ['GC_AJUSTES_ORDE.ALTA',
                    'GC_AJUSTES_ORDE.MODIFICACION',
                    'GC_AJUSTES_ORDE.BAJA',
                    'GC_AJUSTES_ORDE.CONSULTA',
                    'GC_AJUSTES_ORDE.APROBACION',
                    'GC_AJUSTES_ORDE.IMPRESION'],
            accion: () => this.verAjustes(oc)
        });

        return acciones;
    }

}

