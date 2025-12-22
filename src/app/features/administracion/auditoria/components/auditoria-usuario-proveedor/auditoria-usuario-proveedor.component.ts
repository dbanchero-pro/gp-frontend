import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { AuditoriaTipoABMEnum } from 'src/app/shared/enum/auditoria-tipo-abm.enum';
import { Pais } from 'src/app/shared/enum/pais.enum';
import { TipoDocumentoUsuario } from 'src/app/shared/enum/tipo-documento-usuario.enum';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { IPaisDTO } from 'src/app/shared/models/common/pais.model';
import { ProveedorDTO } from 'src/app/shared/models/proveedor/proveedor.model';
import { ITipoDocumentoProveedorDTO } from 'src/app/shared/models/proveedor/tipo-documento-proveedor.model';
import { ITipoDocumentoUsuarioDTO } from 'src/app/shared/models/usuario/tipo-documento-usuario.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { PaisService } from 'src/app/shared/services/usuario/pais.service';
import { TipoDocumentoProveedorService } from 'src/app/shared/services/usuario/tipo-documento-proveedor.service';
import { TipoDocumentoUsuarioService } from 'src/app/shared/services/usuario/tipo-documento-usuario.service';
import { getISOLocalDate } from 'src/app/shared/utils/functions';
import { IAuditoriaUsuarioProveedorDTO } from '../../models/auditoria-usuario-proveedor.model';
import { IFiltroAuditoriaUsuarioProveedorDTO } from '../../models/filtro-auditoria-usuario-proveedor.model';
import { AuditoriaUsuarioProveedorService } from '../../services/auditoria-usuario-proveedor.service';

@Component({
  selector: 'app-auditoria-usuario-proveedor',
  templateUrl: './auditoria-usuario-proveedor.component.html',
  styleUrls: ['./auditoria-usuario-proveedor.component.scss'],
  standalone: false,
})
export class AuditoriaUsuarioProveedorComponent extends PaginaBusquedaComponent<IFiltroAuditoriaUsuarioProveedorDTO> implements OnInit, AfterViewInit {

  tiposOperacion = [
    { id: null, nombre: 'Todos los tipos de operación' },
    { id: AuditoriaTipoABMEnum.alta, nombre: 'Alta' },
    { id: AuditoriaTipoABMEnum.baja, nombre: 'Baja' },
    { id: AuditoriaTipoABMEnum.modificacion, nombre: 'Modificación' },
  ];

  paises: IPaisDTO[] = [];
  tiposDocumento: ITipoDocumentoUsuarioDTO[] = [];
  tiposDocumentoProveedor: ITipoDocumentoProveedorDTO[] = [];
  tiposDocumentoGestionado: ITipoDocumentoUsuarioDTO[] = [];
  listaOrden: IColumnaOrden[] = [
    { id: 'fechaOperacion', nombre: 'Fecha operación' },
    { id: 'tipoOperacion', nombre: 'Tipo operación' },
    { id: 'paisDocumentoProveedor,tipoDocumentoProveedor,nroDocumentoProveedor', nombre: 'Proveedor' },
    { id: 'usuario', nombre: 'CI usuario realizó el cambio' },
    { id: 'idUsuario', nombre: 'CI usuario gestionado' },
  ];
  columnaOrdenInicial = 'fechaOperacion';
  ordenInicial: 'asc' | 'desc' = 'desc';

  auditorias: IAuditoriaUsuarioProveedorDTO[] = [];

  proveedores: ProveedorDTO[] = [];
  tipoUsuario!: TipoUsuario;
  TipoUsuario = TipoUsuario;
  Pais = Pais;
  TipoDocumentoUsuario = TipoDocumentoUsuario;
  
  constructor(
    private readonly fb: FormBuilder,
    private readonly auditoriaService: AuditoriaUsuarioProveedorService,
    private readonly paisService: PaisService,
    private readonly tipoDocUsuarioService: TipoDocumentoUsuarioService,
    private readonly tipoDocProveedorService: TipoDocumentoProveedorService,
    private readonly seguridad: SeguridadService,
    private readonly actualizar: ActualizarService
  ) {
    super();
    this.form = this.fb.group({
      tipoOperacion: [null],
      rangoFechas: [{}],
      paisDocUsuario: [''],
      tipoDocUsuario: [''],
      nroDocUsuario: [''],
      paisDocGestionado: [''],
      tipoDocGestionado: [''],
      nroDocGestionado: [''],
      paisDocProveedor: [''],
      tipoDocProveedor: [''],
      nroDocProveedor: [''],
    });
    this.tipoUsuario = this.seguridad.obtenerTipoUsuario();
    if (this.tipoUsuario === TipoUsuario.PROVEEDOR) {
      this.proveedores = this.seguridad.obtenerProveedores();
    }
    this.nuevaConsulta();
    this.actualizar.tipoUsuario$.subscribe((tipoUsuario?: TipoUsuario) => {
      this.tipoUsuario = tipoUsuario ?? this.seguridad.obtenerTipoUsuario();
      if (this.tipoUsuario === TipoUsuario.PROVEEDOR) {
        this.proveedores = this.seguridad.obtenerProveedores();
      } else {
        this.proveedores = [];
      }

      this.nuevaConsulta();
      this.form.get('paisDocProveedor')?.setValue('');
      this.form.get('tipoDocProveedor')?.setValue('');
      this.form.get('nroDocProveedor')?.setValue('');
    }
    );
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.cargarPaises();
    this.cargarTiposDocumentoProveedor();
  }

  ngAfterViewInit(): void {
    this.actualizarFiltrosYBuscar();
  }

  actualizarFiltrosYBuscar(): void {
    this.actualizarFiltro();
    this.buscar();
  }


  cargarPaises() {
    this.paisService.obtenerTodos().subscribe(res => this.paises = res);
  }

  cargarTiposDocumento() {
    const pais = this.form.get('paisDocUsuario')?.value;
    this.cambioTipoDoc('nroDocUsuario');
    if (!pais) { this.tiposDocumento = []; return; }
    this.tipoDocUsuarioService.obtenerTiposDocumentoUsuario(0, 1000, 'id.idTipoDocumento,asc', pais)
      .subscribe(resp => {
        this.tiposDocumento = resp.content;
      });
  }

  cargarTiposDocumentoProveedor() {
    this.tipoDocProveedorService.obtenerTiposDocumentoProveedor(0, 1000, 'descripcion,asc')
      .subscribe(resp => this.tiposDocumentoProveedor = resp.content);
  }

  cargarTiposDocumentoGestionado() {
    
    this.cambioTipoDoc('nroDocGestionado');
    const pais = this.form.get('paisDocGestionado')?.value;
    if (!pais) { this.tiposDocumentoGestionado = []; return; }
    this.tipoDocUsuarioService.obtenerTiposDocumentoUsuario(0, 1000, 'id.idTipoDocumento,asc', pais)
      .subscribe(resp => {
        this.tiposDocumentoGestionado = resp.content;
      });
  }

  buscar(): void {
    this.form.markAllAsTouched();
    if (this.form.valid) {
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

  actualizarFiltro(): void {
    this.parametros.filtro = {
      tipoOperacion: this.form.get('tipoOperacion')?.value,
      fechaDesde: this.form.get('rangoFechas')?.value?.fechaDesde,
      fechaHasta: this.form.get('rangoFechas')?.value?.fechaHasta,
      paisDocumentoUsuario: this.form.get('paisDocUsuario')?.value,
      tipoDocumentoUsuario: this.form.get('tipoDocUsuario')?.value,
      nroDocumentoUsuario: this.form.get('nroDocUsuario')?.value,
      paisDocumentoGestionado: this.form.get('paisDocGestionado')?.value,
      tipoDocumentoGestionado: this.form.get('tipoDocGestionado')?.value,
      nroDocumentoGestionado: this.form.get('nroDocGestionado')?.value,
      paisDocumentoProveedor: this.form.get('paisDocProveedor')?.value,
      tipoDocumentoProveedor: this.form.get('tipoDocProveedor')?.value,
      nroDocumentoProveedor: this.form.get('nroDocProveedor')?.value,
      tipoUsuario: this.tipoUsuario,
    };
  }

  override nuevaConsulta(): void {
    this.form.reset();
    this.form.get('rangoFechas')?.setValue({
      fechaDesde: getISOLocalDate(new Date()),
      fechaHasta: getISOLocalDate(new Date())
    });
    this.form.get('tipoOperacion')?.setValue(null);
    this.form.get('paisDocUsuario')?.setValue('');
    this.form.get('tipoDocUsuario')?.setValue('');
    this.form.get('nroDocUsuario')?.setValue('');
    this.form.get('paisDocGestionado')?.setValue('');
    this.form.get('tipoDocGestionado')?.setValue('');
    this.form.get('nroDocGestionado')?.setValue('');
    this.form.get('paisDocProveedor')?.setValue('');
    this.form.get('tipoDocProveedor')?.setValue('');
    this.form.get('nroDocProveedor')?.setValue('');
    this.parametros.pagina = 0;
    this.auditorias = [];
    this.total = 0;
    this.actualizarFiltrosYBuscar();
  }

  cambioTipoDoc(nroDocumento: string) {
    setTimeout(() => {
      const ctrl = this.form.get(nroDocumento);
      if (ctrl) {
        ctrl.setValue(ctrl.value);
      }
    });
  }
}
