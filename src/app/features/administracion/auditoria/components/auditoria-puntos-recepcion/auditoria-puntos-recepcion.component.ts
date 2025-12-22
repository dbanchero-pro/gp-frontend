import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { getISODate, getISOLocalDate, transformarNroDocumento } from 'src/app/shared/utils/functions';
import { AuditoriaPuntoRecepcionTipoOperacionEnum } from '../../enums/auditoria-compra-tipo-operacion.enum';
import { IAuditoriaPuntoRecepcionDTO } from '../../models/auditoria-punto-recepcion.model';
import { IFiltroAuditoriaPuntoRecepcionDTO } from '../../models/filtro-auditoria-punto-recepcion.model';
import { AuditoriaPuntoRecepcionService } from '../../services/auditoria-punto-recepcion.service';

@Component({
    selector: 'app-auditoria-puntos-recepcion',
    templateUrl: './auditoria-puntos-recepcion.component.html',
    styleUrls: ['./auditoria-puntos-recepcion.component.scss'],
    standalone: false,
})
export class AuditoriaPuntosRecepcionComponent extends PaginaBusquedaComponent<IFiltroAuditoriaPuntoRecepcionDTO> implements OnInit, AfterViewInit {

    tiposOperacion = [
        { id: null, nombre: 'Todas los tipos de operación' },
        { id: AuditoriaPuntoRecepcionTipoOperacionEnum.alta, nombre: 'Alta' },
        {
            id: AuditoriaPuntoRecepcionTipoOperacionEnum.inhabilitacion,
            nombre: 'Inhabilitación',
        },
        {
            id: AuditoriaPuntoRecepcionTipoOperacionEnum.habilitacion,
            nombre: 'Habilitación',
        },
        {
            id: AuditoriaPuntoRecepcionTipoOperacionEnum.modificacion,
            nombre: 'Modificación',
        },

    ];
    listaOrden: IColumnaOrden[] = [
        { id: 'fechaOperacion', nombre: 'Fecha operación' },
        { id: 'unidadCompra.id.unidadEjecutora.id.inciso.id', nombre: 'Inciso' },
        { id: 'unidadCompra.id.unidadEjecutora.id', nombre: 'Unidad ejecutora' },
        { id: 'unidadCompra.id.unidadCompra.id', nombre: 'Unidad compra' },
        { id: 'nombre', nombre: 'Nombre punto' },
        { id: 'tipoOperacion', nombre: 'Tipo operación' },
        { id: 'usuario', nombre: 'CI usuario realizó el cambio' },
    ];
    columnaOrdenInicial: string = 'fechaOperacion';
    ordenInicial: 'asc' | 'desc' = 'desc';

    auditorias: IAuditoriaPuntoRecepcionDTO[] = [];

    constructor(
        private readonly fb: FormBuilder,
        private readonly auditoriaService: AuditoriaPuntoRecepcionService) {
        super();
        this.form = this.fb.group(
            {
                filtroBase: [null],
                tipoOperacion: [null],
                rangoFechas: [{ fechaDesde: getISOLocalDate(new Date()), fechaHasta: getISOLocalDate(new Date()) }, { fechaDesde: getISODate(new Date()), fechaHasta: getISODate(new Date()) }],
                nombre: [''],
                usuario: [''],
                organismo: []
            });
    }


    override ngOnInit(): void {
        super.ngOnInit();
    }

    ngAfterViewInit(): void {
        this.actualizarFiltrosYBuscar();
    }
    actualizarFiltrosYBuscar(): void {
        this.actualizarFiltroBase()
        this.actualizarFiltro();
        this.buscar();
    }

    actualizarFiltro() {
        const fBase = this.form.get('filtroBase')?.value ?? {};
        const organismo = this.form.get('organismo')?.value;
        const usuario = this.form.get('usuario')?.value;
        const nombre = this.form.get('nombre')?.value;

        const filtroCompleto = {
            ...fBase,
            idInciso: organismo?.idInciso,
            idUE: organismo?.idUnidadEjecutora,
            idUC: organismo?.idUnidadCompra,
            fechaDesde: this.form.get('rangoFechas')?.value?.fechaDesde,
            fechaHasta: this.form.get('rangoFechas')?.value?.fechaHasta,
            usuario: transformarNroDocumento(usuario),
            tipoOperacion: this.form.get('tipoOperacion')?.value,
            nombre: nombre
        }
        this.parametros.filtro = filtroCompleto;
    }


    onFiltroOrganismo(filtro: any): void {
        this.form.get('filtroBase')?.setValue(filtro);
    }

    buscar(): void {
        this.form.markAllAsTouched();

        const esValido = this.form.valid;
        if (esValido) {

            this.parametros.pagina = this.parametros.pagina ?? 0;
            const parametrosFinales: any = {
                pageNumber: this.parametros.pagina,
                pageSize: this.parametros.tamanoPagina,
                sort: this.parametros.sort,
                order: this.parametros.order,

            };

            this.auditoriaService.getPageable(parametrosFinales, undefined, this.parametros.filtro).subscribe(
                (res) => {
                    this.auditorias = res.content;
                    this.total = res.page?.totalElements;

                })

        }
    }
    override nuevaConsulta(): void {
        this.form?.reset();
        this.form.get('rangoFechas')?.setValue({
            fechaDesde: getISOLocalDate(new Date()),
            fechaHasta: getISOLocalDate(new Date())
        });
        this.parametros.pagina = 0;
        this.auditorias = [];
        this.total = -1;
        this.actualizarFiltrosYBuscar();
    }

    private actualizarFiltroBase(): void {
        this.parametros.filtro = this.form.get('filtroBase')?.value ?? {};
    }
}
