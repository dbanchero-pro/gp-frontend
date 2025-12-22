import { Location } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { IColumnaOrden } from '../../../../../../shared/models/common/columna-orden.model';
import { OpcionesSiNo } from '../../../../../../shared/models/common/sino.model';
import { SeguridadService } from '../../../../../../shared/services/common/seguridad.service';
import { ZonaService } from '../../../../../../shared/services/zona.service';
import { IFiltroPuntoRecepcionDTO } from '../../../models/filtro-punto-recepcion.model';
import { IPuntoRecepcionDTO } from '../../../models/punto-recepcion.model';
import { ZonaDto } from '../../../models/zona.model';
import { PuntosRecepcionService } from '../../../services/puntosRecepcion.service';

@Component({
    selector: 'app-gestion-puntos-recepcion',
    templateUrl: './gestion-puntos-recepcion.component.html',
    styleUrl: './gestion-puntos-recepcion.component.scss',
    standalone: false,
})
export class GestionPuntosRecepcionComponent
    extends PaginaBusquedaComponent<IPuntoRecepcionDTO>
    implements OnInit, AfterViewInit {
    sino = OpcionesSiNo;
    opcionesZona: ZonaDto[] = [];

    listaOrden: IColumnaOrden[] = [
        { id: 'unidadCompra.id.unidadEjecutora.id.inciso.descInciso', nombre: 'Inciso' },
        { id: 'unidadCompra.id.unidadEjecutora.descUnidadEjecutora', nombre: 'Unidad ejecutora' },
        { id: 'unidadCompra.descUnidadCompra', nombre: 'Unidad compra' },
        { id: 'nombre', nombre: 'Nombre' },
        { id: 'direccion', nombre: 'Dirección' },
        { id: 'telefonos', nombre: 'Teléfonos' },
        { id: 'correosElectronicos', nombre: 'Correos' },
        { id: 'horarios', nombre: 'Horarios' },
    ];
    columnaOrdenInicial =
        'unidadCompra.id.unidadEjecutora.id.inciso.descInciso';
    ordenInicial: 'asc' | 'desc' = 'asc';
    puntosRecepcion: IPuntoRecepcionDTO[] = [];

    public static readonly SNAPSHOT_KEY = 'GESTION_PUNTOS_RECEPCION';

    constructor(
        private readonly puntosRecepcionService: PuntosRecepcionService,
        private readonly zonaService: ZonaService,
        private readonly snapshotGenericService: SnapshotGenericService,
        private readonly route: ActivatedRoute,
        private readonly location: Location,
        protected readonly seguridad: SeguridadService,
        private readonly fb: FormBuilder,
        private readonly router: Router
    ) {
        super();
        this.form = this.fb.group({
            idInciso: new FormControl(''),
            idUnidadEjecutora: new FormControl(''),
            idUnidadCompra: new FormControl(''),
            idZona: new FormControl(''),
            inhabilitados: new FormControl(false),
            organismo: new FormControl(null),
        });
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.cargarDepartamentos();
    }

    ngAfterViewInit(): void {
        const paramVolver = this.route.snapshot.queryParamMap.get('volver');
        // Se esta volviendo de otra página y se tiene que mantener la consulta
        if (paramVolver === '1') {
            setTimeout(() => {
                this.buscarVolver();
            }, 100);
        } else {
            setTimeout(() => {
                this.actualizarFiltrosYBuscar();
            }, 100);
        }
    }

    private buscarVolver() {
        const snap = this.snapshotGenericService.load<any>(GestionPuntosRecepcionComponent.SNAPSHOT_KEY);

        if (snap) {
            this.parametros = snap;
            this.form.patchValue(snap.filtro);
            this.form.get('organismo')?.setValue({
                idInciso: snap.filtro.idInciso,
                idUnidadEjecutora: snap.filtro.idUnidadEjecutora,
                idUnidadCompra: snap.filtro.idUnidadCompra,
            });
            this.parametros.pagina = snap.pagina;
            this.parametros.tamanoPagina = snap.tamanoPagina;
            this.actualizarFiltro();
            this.buscar();
        }

        const currentUrl = this.location.path().split('?')[0];
        this.location.replaceState(currentUrl);
    }

    private guardarFiltro(): void {

        this.parametros.pagina = this.parametros.pagina ?? 0;

        this.snapshotGenericService.save(
            GestionPuntosRecepcionComponent.SNAPSHOT_KEY,
            this.parametros
        );
    }

    cambiarFiltro(filtroBase: Partial<IPuntoRecepcionDTO> | null) {
        this.form.get('idInciso')?.setValue(filtroBase?.idInciso);
        this.form.get('idUnidadEjecutora')?.setValue(filtroBase?.idUnidadEjecutora);
        this.form.get('idUnidadCompra')?.setValue(filtroBase?.idUnidadCompra);
    }

    actualizarFiltrosYBuscar(): void {
        this.actualizarFiltro();
        this.buscar(true);
    }


    buscar(resetearPagina: boolean = false): void {
        this.form.markAllAsTouched();

        const esValido = this.form.valid;
        if (!esValido) return;
        if (resetearPagina) {
            this.parametros.pagina = 0;
        }
        
        this.guardarFiltro();

        const { _, tamanoPagina, sort, order, filtro } = this.parametros;

        this.puntosRecepcionService.obtenerPuntosRecepcion({
            page: this.parametros.pagina,
            size: tamanoPagina,
            sort: sort,
            order: order,
            ...filtro,
        }).subscribe((res: any) => {
                this.puntosRecepcion = res.content.map((p: any) => ({
                    ...p,
                    idUnidadCompra: p.unidadCompra?.idUnidadCompra ?? null,
                    descUnidadCompra: p.unidadCompra?.descUnidadCompra ?? null,
                    idUnidadEjecutora: p.unidadCompra?.idUnidadEjecutora ?? null,
                    descUnidadEjecutora: p.unidadCompra?.descUnidadEjecutora ?? null,
                    idInciso: p.unidadCompra?.idInciso ?? null,
                    descInciso: p.unidadCompra?.descInciso ?? null,
                }));
                this.total = res.page.totalElements;
            });
    }

    private actualizarFiltro(): void {
        const organismo = this.form.get('organismo')?.value;
        const v = this.form.value;

        this.parametros.filtro = {
            idInciso: organismo?.idInciso,
            idUnidadEjecutora: organismo?.idUnidadEjecutora,
            idUnidadCompra: organismo?.idUnidadCompra,
            idZona: v.idZona,
            inhabilitados: !!v.inhabilitados,
        };
        const idInciso = this.form.get('idInciso')?.value;
        const idUnidadEjecutora = this.form.get('idUnidadEjecutora')?.value;
        const idUnidadCompra = this.form.get('idUnidadCompra')?.value;
        const idZona = this.form.get('idZona')?.value;
        const inhabilitados = this.form.get('inhabilitados')?.value;
        const filtroCompleto: Partial<IFiltroPuntoRecepcionDTO> = {
            idInciso: idInciso,
            idUnidadEjecutora: idUnidadEjecutora,
            idUnidadCompra: idUnidadCompra,
            idZona: idZona,
            inhabilitados: inhabilitados,
        };

        this.parametros.filtro = filtroCompleto;
    }

    filtrandoPorEvento() {
        this.form.markAllAsTouched();
        this.buscar();
    }

    override nuevaConsulta() {
        this.form?.reset({ idZona: '', inhabilitados: false, organismo: null });
        this.form.markAllAsTouched();

        this.parametros.filtro = {};
        this.parametros.pagina = 1;
        this.parametros.order = 'asc';
        this.parametros.sort ='unidadCompra.id.unidadEjecutora.id.inciso.descInciso';
        this.puntosRecepcion = [];
        this.total = -1;
        this.parametros.pagina = 0;

        //Se limpia los filtros guardados
        this.snapshotGenericService.clear(
            GestionPuntosRecepcionComponent.SNAPSHOT_KEY
        );

        this.actualizarFiltrosYBuscar();
    }

    cargarDepartamentos() {
        this.zonaService.obtenerZonas().subscribe((respuesta: any) => {
            this.opcionesZona = respuesta;
        });
    }

    public agregar(): void {
        this.router.navigate(['/administracion/puntos-recepcion/agregar']);
    }

    public modificar(id: number): void {
        this.router.navigate(['/administracion/puntos-recepcion/modificar', id]);
    }

    public responsables(id: number): void {
        this.router.navigate(['/administracion/puntos-recepcion/responsables', id]);
    }

    override descargarExcel() {
        this.actualizarFiltro();
        const { _, _tamanoPagina, _sort, _order, filtro } = this.parametros;
        this.puntosRecepcionService.exportarExcelPuntosRecepcion(filtro);
    }
}
