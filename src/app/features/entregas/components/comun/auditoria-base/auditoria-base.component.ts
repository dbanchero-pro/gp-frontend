import { Directive, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { IOrdenCompraDTO } from 'src/app/features/entregas/models/orden-ompra.model';
import { FiltroItemsArticulosComponent } from 'src/app/shared/components/filtro-items-articulos/filtro-items-articulos.component';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { TipoBusqueda } from 'src/app/shared/enum/tipo-busqueda-item.enum';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { IBusquedaItemDTO } from 'src/app/shared/models/busqueda-item.model';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { PageableModel } from 'src/app/shared/models/common/page/pageable.model';
import { TipoCompraDTO } from 'src/app/shared/models/sice/tipo-compra.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { getISODate, getISOLocalDate } from 'src/app/shared/utils/functions';
import { mascaraNroAnioCompra } from 'src/app/shared/utils/masks';
import { IEntregableDTO } from '../../../models/entregable.model';

@Directive()
export abstract class AuditoriaBaseComponent<TDto,TFiltro> extends PaginaBusquedaComponent<TFiltro> implements OnInit {
    @ViewChild('filtroItems') filtroItemsComponent!: FiltroItemsArticulosComponent;

    perfil!: TipoPerfil;
    TipoPerfil = TipoPerfil;
    tipoUsuario!: TipoUsuario;
    tiposCompra: TipoCompraDTO[] = [];
    nroOC!: number;
    idIncisoCompra!: number;
    idUECompra!: number;
    idUCCompra!: number;
    anioCompra!: number;
    nroCompra!: number;
    nroItem?: string | number;
    descArticulo?: string | number;

    auditorias: TDto[] = [];
    ordenCompra?: IOrdenCompraDTO;
    filtroItem?: IBusquedaItemDTO;
    itemOrdenCompra?: ItemOrdenCompraDTO;

    nroCompraValido: boolean = true;
    TipoUsuario = TipoUsuario;
    constructor(
        protected readonly fb: FormBuilder,
        protected readonly route: ActivatedRoute,
        protected readonly ordenCompraService: OrdenCompraService,
        protected readonly seguridad: SeguridadService,
        protected readonly actualizar: ActualizarService
    ) {
        super();

        this.perfil = this.route.snapshot.data['perfil'];
        this.form = this.fb.group(
            {
                filtroBase: [null],
                tipoOperacion: [null],
                rangoFechas: [{ fechaDesde: getISOLocalDate(new Date()), fechaHasta: getISOLocalDate(new Date()) }, { fechaDesde: getISODate(new Date()), fechaHasta: getISODate(new Date()) }],
                nroOC: ['', Validators.required],
                nroAnioCompra: ['', [Validators.required, Validators.pattern(mascaraNroAnioCompra)]],
                organismoCompra: [null],
                idEntidad: [null]

            });
        this.form.controls["rangoFechas"].markAsTouched();
        this.tipoUsuario = this.seguridad.obtenerTipoUsuario();

        this.actualizar.tipoUsuario$.subscribe((tipoUsuario?: TipoUsuario) => {
            this.tipoUsuario = tipoUsuario ?? this.seguridad.obtenerTipoUsuario();

            this.nuevaConsulta();
        }
        );
    }

    override ngOnInit(): void {
        super.ngOnInit();
        // Mock de auditorias
        this.auditorias = [];
        this.total = -1;
    }

    onFiltroOrganismo(filtro: any): void {
        this.form.get('filtroBase')?.setValue(filtro);
    }

    protected obtenerOrdenCompra(): Promise<void> {
        return new Promise((resolve, _reject) => {
            this.ordenCompraService.obtenerPorNroOC(this.idIncisoCompra, this.idUECompra,
                this.idUCCompra, this.anioCompra, this.nroCompra, this.nroOC).subscribe((ordenCompra: IOrdenCompraDTO) => {
                    this.ordenCompra = ordenCompra;
                    resolve();
                });
        });
    }

    onFiltroItemsCambio(filtro: IBusquedaItemDTO): void {
        this.filtroItem = filtro;
    }


    override nuevaConsulta(): void {
        this.filtroItemsComponent?.limpiar();
        this.form.get('organismoCompra')?.setValue(null);
        this.form.get('nroAnioCompra')?.setValue('');
        this.form.get('tipoOperacion')?.setValue(null);
        this.form.get('nroOC')?.setValue('');
        this.form.get('idEntidad')?.setValue('');
        this.form.get('rangoFechas')?.setValue({
            fechaDesde: getISOLocalDate(new Date()),
            fechaHasta: getISOLocalDate(new Date())
        });
        this.form.markAsUntouched();
        this.parametros.pagina = 0;
        this.auditorias = [];
        this.total = -1;
        this.ordenCompra = undefined;
    }
    campoEsVacio(control: any): boolean {
        return control.touched && (control.value === null || control.value === '');
    }

    private actualizarFiltroBase(): void {
        this.parametros.filtro = this.form.get('filtroBase')?.value ?? {};
    }

    obtenerTextoEntregable(entregable?: IEntregableDTO): string {
        if (!entregable) {
            return '';
        } else {
            return `${entregable.codEntregable} - ${entregable.descEntregable}`
        }

    }

    validarEnteroPositivo(event: Event) {
        const input = event.target as HTMLInputElement;
        let valor = input.value;

        valor = valor.replace(/\D/g, '');
        valor = valor.replace(/^0+/, '');

        if (valor.endsWith('.') || valor.endsWith(',')) {
            valor = valor.slice(0, -1);
        }
        if (valor.length > 6) {
            valor = valor.slice(0, 6);
        }

        input.value = valor;
    }

    validarNroAnioCompra() {
        this.nroCompraValido = !this.form.get('nroAnioCompra')?.invalid;
        return false;
    }
    actualizarFiltrosYBuscarInterno(funcion: ((pageable: PageableModel, filtro: Partial<TFiltro>) => Observable<PageModel<TDto>>)): void {
        this.form.markAllAsTouched();
        if (this.form.valid) {

            this.parametros.pagina ??= 0;

            this.nroOC = this.form.get('nroOC')?.value;
            this.idIncisoCompra = this.form.get('organismoCompra')?.value?.idInciso;
            this.idUECompra = this.form.get('organismoCompra')?.value?.idUnidadEjecutora;
            this.idUCCompra = this.form.get('organismoCompra')?.value?.idUnidadCompra;
            this.anioCompra = this.form.get('nroAnioCompra')?.value.split('/')[1];
            this.nroCompra = this.form.get('nroAnioCompra')?.value.split('/')[0];
            this.descArticulo = this.filtroItem?.tipoBusqueda == TipoBusqueda.ARTICULO ? this.filtroItem?.item: undefined;
            this.nroItem = this.filtroItem?.tipoBusqueda == TipoBusqueda.NROITEM ? this.filtroItem?.item: undefined;

            this.obtenerOrdenCompra().then(() => {
                this.actualizarFiltro();
                this.buscarInterno(funcion);
            });
        }
    }

    buscarInterno(funcion: ((pageable: PageableModel, filtro: Partial<TFiltro>) => Observable<PageModel<TDto>>)): void {
        this.parametros.pagina ??= 0;

        const parametrosFinales: any = {
            pageNumber: this.parametros.pagina,
            pageSize: this.parametros.tamanoPagina,
            sort: this.parametros.sort,
            order: this.parametros.order,
        };
        funcion(parametrosFinales, this.parametros.filtro).subscribe((result: PageModel<TDto>) => {
                    this.auditorias = result.content;
                    this.total = result.page.totalElements;
                });
    }

    
    actualizarFiltro(): void {
        const fBase = this.form.get('filtroBase')?.value ?? {};
        const organismoCompra = this.form.get('organismoCompra')?.value;
        const filtroCompleto = {
            ...fBase,
            idIncisoCompra: organismoCompra?.idInciso,
            idUECompra: organismoCompra?.idUnidadEjecutora,
            idUCCompra: organismoCompra?.idUnidadCompra,
            anioCompra: this.form.get('nroAnioCompra')?.value.split('/')[1],
            numCompra: this.form.get('nroAnioCompra')?.value.split('/')[0],
            tipoOperacion: this.form.get('tipoOperacion')?.value,
            fechaDesde: this.form.get('rangoFechas')?.value?.fechaDesde,
            fechaHasta: this.form.get('rangoFechas')?.value?.fechaHasta,
            nroOC: this.form.get('nroOC')?.value,
            idEntidad: this.form.get('idEntidad')?.value,
            tipoUsuario: this.tipoUsuario,
            descArticulo: this.descArticulo,
            nroItem: this.nroItem

        };

        this.parametros.filtro = filtroCompleto;
    }

}
