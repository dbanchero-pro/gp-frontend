import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CampoDTO } from '../../models/campo.model';
import { FiltroCampoDTO } from '../../models/filtro-campo.model';
import { CampoService } from '../../services/campo.service';
import { ActualizarService } from '../../../../../shared/services/common/actualizar.service';
import { SeguridadService } from '../../../../../shared/services/common/seguridad.service';
import { SnapshotGenericService } from '../../../../../shared/services/common/snapshot-generic.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AgregarModificarCampoPopupComponent } from '../agregar-modificar-campo-popup/agregar-modificar-campo-popup.component';
import { AccionBoton } from '../../../../../shared/models/common/accion-boton.model';
import { TipoFuenteCampo } from '../../enum/tipo-fuente-campo.enum';
import { TipoDatoCampo } from '../../enum/tipo-dato-campo.enum';
import { IReglaDTO } from '../../models/regla.model';
import { OperadorHelperService } from '../../services/operador-helper.service';
import { TipoRegla } from '../../enum/tipo-regla.enum';
import { PaginaBusquedaComponent } from '../../../../../shared/components/pagina-busqueda/pagina-busqueda.component';
import { IColumnaOrden } from '../../../../../shared/models/common/columna-orden.model';
import { PageModel } from '../../../../../shared/models/common/page/page.model';

@Component({
  selector: 'app-consulta-campos-reglas',
  templateUrl: './consulta-campos-reglas.component.html',
  styleUrls: ['./consulta-campos-reglas.component.scss'],
  standalone: false
})
export class ConsultaCamposReglasComponent extends PaginaBusquedaComponent<FiltroCampoDTO> implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly actualizarServ = inject(ActualizarService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly campoService = inject(CampoService);
  private readonly operadorHelper = inject(OperadorHelperService);
  private readonly snapshotGenericService = inject(SnapshotGenericService);
  protected readonly seguridad = inject(SeguridadService);
  protected override readonly modalService = inject(BsModalService);

  listaOrden: IColumnaOrden[] = [
    { id: 'etiqueta', nombre: 'Etiqueta' },
    { id: 'fuente', nombre: 'Fuente' },
  ];

  columnaOrdenInicial = 'etiqueta';
  ordenInicial: 'asc' | 'desc' = 'asc';

  campos: CampoDTO[] = [];
  tiposFuente: { id: string; nombre: string }[] = [];

  public static readonly SNAPSHOT_KEY = 'CONSULTA_CAMPOS_REGLAS';

  constructor() {
    super();
    this.form = this.fb.nonNullable.group({
      etiqueta: this.fb.nonNullable.control<string>(''),
      descripcion: this.fb.nonNullable.control<string>(''),
      fuente: this.fb.nonNullable.control<string>('')
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.tiposFuente = this.campoService.obtenerTiposFuente();
    this.nuevaConsulta();
  }

  actualizarFiltrosYBuscar(): void {
    this.actualizarFiltro();
    this.buscar();
  }

  private actualizarFiltro(): void {
    const v = this.form.value;
    this.parametros.filtro = new FiltroCampoDTO(
      v.etiqueta || undefined,
      v.descripcion || undefined,
      (v.fuente as TipoFuenteCampo) || undefined
    );
  }

  buscar(resetearPagina: boolean = false): void {
    if (resetearPagina) {
      this.parametros.pagina = 0;
    }

    this.actualizarFiltro();

    this.campoService
      .obtenerTodosPaginado(
        this.parametros.filtro,
        this.parametros.pagina,
        this.parametros.tamanoPagina,
        this.parametros.sort,
        this.parametros.order
      )
      .subscribe({
        next: (page: PageModel<CampoDTO>) => {
          this.campos = page.content || [];
          this.total = page.totalElements || 0;

          this.snapshotGenericService.save(
            ConsultaCamposReglasComponent.SNAPSHOT_KEY,
            {
              filtro: this.parametros.filtro,
              pagina: this.parametros.pagina,
              tamanoPagina: this.parametros.tamanoPagina,
              sort: this.parametros.sort,
              order: this.parametros.order
            }
          );
        },
        error: (err) => {
          this.actualizarServ.mensajeError('Error al consultar campos');
          console.error('Error al consultar campos:', err);
          this.campos = [];
          this.total = 0;
        }
      });
  }

  override nuevaConsulta(): void {
    this.form.reset({
      etiqueta: '',
      descripcion: '',
      fuente: ''
    });

    this.parametros = {
      filtro: new FiltroCampoDTO(),
      pagina: 0,
      tamanoPagina: 10,
      sort: this.columnaOrdenInicial,
      order: this.ordenInicial
    };
    this.campos = [];
    this.total = -1;

    this.snapshotGenericService.clear(
      ConsultaCamposReglasComponent.SNAPSHOT_KEY
    );
  }

  abrirAgregarCampo(): void {
    const modalRef = this.modalService.show(AgregarModificarCampoPopupComponent, {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false
    });

    const popup = modalRef.content as AgregarModificarCampoPopupComponent;
    if (popup.campoGuardado) {
      popup.campoGuardado.subscribe(() => {
        this.buscar();
      });
    }
  }

  obtenerAcciones(campo: CampoDTO): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    if (this.campoService.puedeModificar(campo)) {
      acciones.push({
        nombre: 'Modificar',
        clase: 'btn btn-success',
        icono: 'fa fa-edit',
        accion: () => this.modificarCampo(campo)
      });
    }

    if (this.campoService.puedeEliminar(campo)) {
      acciones.push({
        nombre: 'Eliminar',
        clase: 'btn btn-success',
        icono: 'fa fa-trash',
        accion: () => this.eliminarCampo(campo)
      });
    }

    return acciones;
  }

  ejecutarAccion(accion: AccionBoton): void {
    if (accion.accion) {
      accion.accion();
    }
  }

  modificarCampo(campo: CampoDTO): void {
    const modalRef = this.modalService.show(AgregarModificarCampoPopupComponent, {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false,
      initialState: {
        campoExistente: campo
      }
    });

    const popup = modalRef.content as AgregarModificarCampoPopupComponent;
    if (popup.campoGuardado) {
      popup.campoGuardado.subscribe(() => {
        this.buscar();
      });
    }
  }

  eliminarCampo(campo: CampoDTO): void {
    this.actualizarServ.confirmar(
      `¿Está seguro que desea eliminar el campo "${campo.etiqueta}"?`,
      () => {
        if (campo.id) {
          this.campoService.eliminar(campo.id, false).subscribe({
            next: () => {
              this.actualizarServ.mensajeCorrecto('Campo eliminado correctamente');
              this.buscar();
            },
            error: (err) => {
              this.actualizarServ.mensajeError(err.message || 'Error al eliminar el campo');
              console.error('Error al eliminar campo:', err);
            }
          });
        }
      }
    );
  }

  obtenerEtiquetaFuente(fuente: TipoFuenteCampo | undefined): string {
    switch (fuente) {
      case TipoFuenteCampo.SICE_EDITABLE:
        return 'SICE (editable)';
      case TipoFuenteCampo.SICE_NO_EDITABLE:
        return 'SICE (no editable)';
      case TipoFuenteCampo.USUARIO:
        return 'Usuario';
      default:
        return '-';
    }
  }

  obtenerEtiquetaTipoDato(tipoDato: TipoDatoCampo | undefined): string {
    switch (tipoDato) {
      case TipoDatoCampo.NUMERO:
        return 'Número';
      case TipoDatoCampo.TEXTO:
        return 'Texto';
      case TipoDatoCampo.BOOLEANO:
        return 'Booleano';
      case TipoDatoCampo.FECHA:
        return 'Fecha';
      case TipoDatoCampo.HORA:
        return 'Hora';
      case TipoDatoCampo.CORREO_ELECTRONICO:
        return 'Correo electrónico';
      case TipoDatoCampo.LISTA_VALORES_TEXTO:
        return 'Lista de valores (texto)';
      default:
        return '-';
    }
  }

  obtenerEtiquetaTipoRegla(tipoRegla: TipoRegla | undefined): string {
    switch (tipoRegla) {
      case TipoRegla.VALOR:
        return 'Valor';
      case TipoRegla.CAMPO:
        return 'Campo';
      default:
        return '-';
    }
  }

  obtenerNombreOperador(regla: IReglaDTO): string {
    return regla.operador ? this.operadorHelper.obtenerNombreOperador(regla.operador) : '-';
  }

  tieneReglas(campo: CampoDTO): boolean {
    return !!(campo.reglas && campo.reglas.length > 0);
  }
}
