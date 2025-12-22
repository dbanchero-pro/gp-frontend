import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FiltroItemsArticulosComponent } from 'src/app/shared/components/filtro-items-articulos/filtro-items-articulos.component';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { IBusquedaItemDTO } from 'src/app/shared/models/busqueda-item.model';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { TipoCompraDTO } from 'src/app/shared/models/sice/tipo-compra.model';
import { TipoCompraService } from 'src/app/shared/services/sice/tipo-compra.service';
import { dividirNroAnioCompra, getISODate, getISOLocalDate, transformarNroDocumento } from 'src/app/shared/utils/functions';
import { mascaraNroAnioCompra } from 'src/app/shared/utils/masks';
import { AuditoriaUsuarioOrganismoPerfilTipoOperacionEnum } from '../../enums/auditoria-usuario-organismo-perfil-tipo-operacion.enum';
import { IAuditoriaUsuarioOrganismoPerfilDTO } from '../../models/auditoria-usuario-organismo-perfil.model';
import { IFiltroAuditoriaUsuarioOrganismoPerfil } from '../../models/filtro-auditoria-usuario-organismo-perfil.model';
import { AuditoriaUsuarioOrganismoPerfilService } from '../../services/auditoria-usuario-organismo-perfil.service';


@Component({
  selector: 'app-auditoria-usuario-organismo-perfil',
  templateUrl: './auditoria-usuario-organismo-perfil.component.html',
  styleUrls: ['./auditoria-usuario-organismo-perfil.component.scss'],
  standalone: false
})
export class AuditoriaUsuarioOrganismoPerfilComponent extends PaginaBusquedaComponent<IFiltroAuditoriaUsuarioOrganismoPerfil> implements OnInit, AfterViewInit {
  @ViewChild('filtroItems') filtroItemsComponent!: FiltroItemsArticulosComponent;

  tiposOperacion = [
    { id: null, nombre: 'Todos los tipos de operación' },
    { id: AuditoriaUsuarioOrganismoPerfilTipoOperacionEnum.alta, nombre: 'Alta' },
    { id: AuditoriaUsuarioOrganismoPerfilTipoOperacionEnum.baja, nombre: 'Baja' }
  ];
  listaOrden: IColumnaOrden[] = [
    { id: 'fechaOperacion', nombre: 'Fecha operación', },
    { id: 'usuarioOrganismo.unidadCompra.id.unidadEjecutora.id.inciso.id', nombre: 'Inciso' },
    { id: 'usuarioOrganismo.unidadCompra.id.unidadEjecutora.id', nombre: 'Unidad ejecutora' },
    { id: 'usuarioOrganismo.unidadCompra.id.idUnidadCompra', nombre: 'Unidad compra' },
    { id: 'compra.subtipoCompra.id.idTipoCompra.id', nombre: 'Tipo compra', filtro: TipoPerfil.Conformidad },
    { id: 'compra.numCompra', nombre: 'N° compra', filtro: TipoPerfil.Conformidad },
    { id: 'itemCompra.nroItem', nombre: 'N° ítem', filtro: TipoPerfil.Conformidad },
    { id: 'tipoOperacion', nombre: 'Tipo operación' },
    { id: 'usuario', nombre: 'CI usuario realizó el cambio' },
    { id: 'usuarioOrganismo.id.idUsuario', nombre: 'CI usuario gestionado' }
  ];

  perfil!: TipoPerfil;
  TipoPerfil = TipoPerfil;

  tiposCompra: TipoCompraDTO[] = [];
  nroCompra!: number;
  ordenInicial: 'asc' | 'desc' = 'desc';
  columnaOrdenInicial: string = 'fechaOperacion';

  auditorias: IAuditoriaUsuarioOrganismoPerfilDTO[] = [];
  filtroItem?: IBusquedaItemDTO;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly tipoCompraService: TipoCompraService,
    private readonly auditoriaService: AuditoriaUsuarioOrganismoPerfilService
  ) {
    super();

    this.perfil = this.route.snapshot.data['perfil'];
    this.form = this.fb.group(
      {
        filtroBase: [null],
        tipoOperacion: [null],
        tipoCompra: [''],
        rangoFechas: [{ fechaDesde: getISOLocalDate(new Date()), fechaHasta: getISOLocalDate(new Date()) }, { fechaDesde: getISODate(new Date()), fechaHasta: getISODate(new Date()) }],
        usuario: [''],
        nroAnioCompra: ['', Validators.pattern(mascaraNroAnioCompra)],
        nombrePunto: [''],
        organismo: [null],

      });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.obtenerTiposCompra();
  }

  ngAfterViewInit(): void {
    this.actualizarFiltrosYBuscar();
  }

  actualizarFiltrosYBuscar(): void {
    this.actualizarFiltroBase()
    this.actualizarFiltro();
    this.buscar();
  }

  obtenerTiposCompra() {
    this.tipoCompraService.obtenerTiposCompraSinPaginado().subscribe({
      next: (res) => {
        this.tiposCompra = res;
      }
    });
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

      this.auditoriaService.getPageable(parametrosFinales, undefined, this.parametros.filtro).subscribe(res => {
        this.auditorias = res.content;
        this.total = res.page?.totalElements;
      });
    }
  }
  
  private setearFiltrosRecepcion(filtro: IFiltroAuditoriaUsuarioOrganismoPerfil) {
    filtro.nombrePunto = this.form.get('nombrePunto')?.value;
  }

  private setearFiltrosConformidad(filtro: IFiltroAuditoriaUsuarioOrganismoPerfil): void {
    let nroItem: number | undefined;
    let descripcionArticulo: string | undefined;
    nroItem = this.filtroItem && this.filtroItem.tipoBusqueda === 'NROITEM' && this.filtroItem.item
      ? parseInt(this.filtroItem.item.toString(), 10) : undefined;
    descripcionArticulo = this.filtroItem && this.filtroItem.tipoBusqueda === 'ARTICULO'
      ? this.filtroItem.item?.toString() : undefined;
    const { numCompra, anioCompra } = dividirNroAnioCompra(this.form.get('nroAnioCompra')?.value);
    filtro.nroCompra = numCompra;
    filtro.anioCompra = anioCompra;
    filtro.descripcionArticulo = descripcionArticulo;
    filtro.nroItem = nroItem;
    filtro.tipoCompra = this.form.get('tipoCompra')?.value;
  }

  actualizarFiltro(): void {
    const fBase = this.form.get('filtroBase')?.value ?? {};

    const organismo = this.form.get('organismo')?.value;
    const filtroCompleto = {
      ...fBase,
      idInciso: organismo?.idInciso,
      idUE: organismo?.idUnidadEjecutora,
      idUC: organismo?.idUnidadCompra,
      tipoOperacion: this.form.get('tipoOperacion')?.value,
      usuario: transformarNroDocumento(this.form.get('usuario')?.value),
      fechaDesde: this.form.get('rangoFechas')?.value?.fechaDesde,
      fechaHasta: this.form.get('rangoFechas')?.value?.fechaHasta,
      perfil: this.perfil,
    };
    if (this.perfil === TipoPerfil.Conformidad) {
      this.setearFiltrosConformidad(filtroCompleto);
    } else if (this.perfil === TipoPerfil.Recepcion) {
      this.setearFiltrosRecepcion(filtroCompleto);
    }

    this.parametros.filtro = filtroCompleto;
  }

  onFiltroItemsCambio(filtro: IBusquedaItemDTO): void {
    this.filtroItem = filtro;
  }

  override nuevaConsulta(): void {
    this.filtroItemsComponent?.limpiar();
    this.form?.reset({tipoCompra : ''});
    this.form.get('rangoFechas')?.setValue({
      fechaDesde: getISOLocalDate(new Date()),
      fechaHasta: getISOLocalDate(new Date())
    });
    this.parametros.pagina = 0;
    this.auditorias = [];
    this.total = 0;
    this.actualizarFiltrosYBuscar();
  }


  private actualizarFiltroBase(): void {
    this.parametros.filtro = this.form.get('filtroBase')?.value ?? {};
  }
}
