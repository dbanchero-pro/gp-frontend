import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginaBusquedaComponent } from '../../../../../shared/components/pagina-busqueda/pagina-busqueda.component';
import { IColumnaOrden } from '../../../../../shared/models/common/columna-orden.model';
import { FiltroDocumentoRepositorioDTO } from '../../../models/filtro-documento-repositorio.model';
import { DocumentoRepositorioService } from '../../../services/documento-repositorio.service';
import { DocumentoRepositorioDTO } from '../../../models/documento-repositorio.model';
import { PageModel } from '../../../../../shared/models/common/page/page.model';
import { ActualizarService } from '../../../../../shared/services/common/actualizar.service';
import { SnapshotGenericService } from '../../../../../shared/services/common/snapshot-generic.service';
import { SeguridadService } from '../../../../../shared/services/common/seguridad.service';
import { ArchivoService } from '../../../../../shared/services/common/archivo.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AgregarDocumentoRepositorioPopupComponent } from '../agregar-documento-repositorio-popup/agregar-documento-repositorio-popup.component';
import { IFiltroOrganismoDTO } from '../../../../../shared/models/filtros/filtro-organismo.model';
import { AccionBoton } from '../../../../../shared/models/common/accion-boton.model';

@Component({
  selector: 'app-consulta-repositorio-archivos',
  templateUrl: './consulta-repositorio-archivos.component.html',
  styleUrls: ['./consulta-repositorio-archivos.component.scss'],
  standalone: false
})
export class ConsultaRepositorioArchivosComponent
  extends PaginaBusquedaComponent<FiltroDocumentoRepositorioDTO>
  implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly actualizarServ = inject(ActualizarService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly documentoService = inject(DocumentoRepositorioService);
  private readonly snapshotGenericService = inject(SnapshotGenericService);
  protected readonly seguridad = inject(SeguridadService);
  private readonly archivoService = inject(ArchivoService);
  protected override readonly modalService = inject(BsModalService);

  listaOrden: IColumnaOrden[] = [
    { id: 'nombreDocumento', nombre: 'Nombre documento' },
    { id: 'tipoArchivo', nombre: 'Tipo archivo' },
    { id: 'fechaCreacion', nombre: 'Fecha creación' }
  ];

  columnaOrdenInicial = 'fechaCreacion';
  ordenInicial: 'asc' | 'desc' = 'desc';

  documentos: DocumentoRepositorioDTO[] = [];
  tiposArchivo: { id: string; nombre: string }[] = [];

  public static readonly SNAPSHOT_KEY = 'CONSULTA_REPOSITORIO_ARCHIVOS';

  constructor() {
    super();
    this.form = this.fb.nonNullable.group({
      organismo: this.fb.control<IFiltroOrganismoDTO | null>(null),
      nombreDocumento: this.fb.nonNullable.control<string>(''),
      descripcionDocumento: this.fb.nonNullable.control<string>(''),
      tipoArchivo: this.fb.nonNullable.control<string>('')
    });
  }

  override ngOnInit(): void {

    super.ngOnInit();
    this.tiposArchivo = this.documentoService.obtenerTiposArchivo();   
    this.nuevaConsulta();
  }

  onFiltroOrganismo(filtro: IFiltroOrganismoDTO | null): void {
    this.form.patchValue({ organismo: filtro });
  }

  actualizarFiltrosYBuscar(): void {
    this.actualizarFiltro();
    this.buscar();
  }

  private actualizarFiltro(): void {
    const v = this.form.value;
    const organismo = v.organismo;

    this.parametros.filtro = new FiltroDocumentoRepositorioDTO(
      organismo?.idInciso,
      organismo?.idUnidadEjecutora,
      v.nombreDocumento || undefined,
      v.descripcionDocumento || undefined,
      v.tipoArchivo as any || undefined
    );
  }

  buscar(resetearPagina: boolean = false): void {
    if (resetearPagina) {
      this.parametros.pagina = 0;
    }

    this.actualizarFiltro();

    this.documentoService
      .obtenerTodos(
        this.parametros.filtro,
        this.parametros.pagina,
        this.parametros.tamanoPagina,
        this.parametros.sort,
        this.parametros.order
      )
      .subscribe({
        next: (page: PageModel<DocumentoRepositorioDTO>) => {
          this.documentos = page.content || [];
          this.total = page.totalElements || 0;

          this.snapshotGenericService.save(
            ConsultaRepositorioArchivosComponent.SNAPSHOT_KEY,
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
          this.actualizarServ.mensajeError('Error al consultar documentos');
          console.error('Error al consultar documentos:', err);
          this.documentos = [];
          this.total = 0;
        }
      });
  }

  override nuevaConsulta(): void {
    this.form.reset({
      organismo: null,
      nombreDocumento: '',
      descripcionDocumento: '',
      tipoArchivo: ''
    });

    this.parametros = {
      filtro: new FiltroDocumentoRepositorioDTO(),
      pagina: 0,
      tamanoPagina: 10,
      sort: this.columnaOrdenInicial,
      order: this.ordenInicial
    };
    this.documentos = [];
    this.total = -1;

    this.snapshotGenericService.clear(
      ConsultaRepositorioArchivosComponent.SNAPSHOT_KEY
    );
  }

  abrirAgregarDocumento(): void {
    const popup = this.abrirPopup(AgregarDocumentoRepositorioPopupComponent, 'Guardar', {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false
    });

    popup.documentoGuardado.subscribe(() => {
      this.buscar();
    });
  }

  obtenerAcciones(documento: DocumentoRepositorioDTO): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    acciones.push({
      nombre: 'Modificar',
      clase: 'btn btn-success',
      icono: 'fa fa-edit',
      accion: () => this.modificarDocumento(documento)
    });

    acciones.push({
      nombre: 'Descargar',
      clase: 'btn btn-success',
      icono: 'fa fa-download',
      accion: () => this.descargarDocumento(documento)
    });

    acciones.push({
      nombre: 'Eliminar',
      clase: 'btn btn-success',
      icono: 'fa fa-trash',
      accion: () => this.eliminarDocumento(documento)
    });

    return acciones;
  }

  ejecutarAccion(accion: AccionBoton): void {
    if (accion.accion) {
      accion.accion();
    }
  }

  obtenerEtiquetaTipoArchivo(tipoArchivo: string | undefined): string {
    switch (tipoArchivo) {
      case 'LOGO':
        return 'Logo';
      case 'FORMULARIO':
        return 'Formulario';
      case 'OTRO':
        return 'Otro';
      default:
        return '-';
    }
  }

  descargarDocumento(documento: DocumentoRepositorioDTO): void {
    if (!documento.id) {
      this.actualizarServ.mensajeError('No se puede descargar el documento');
      return;
    }

    this.documentoService.descargar(documento.id).subscribe({
      next: (archivo) => {
        if (archivo && archivo.contenido && archivo.nombre) {
          this.archivoService.descargar(archivo);
          this.actualizarServ.mensajeCorrecto('Documento descargado correctamente');
        } else {
          this.actualizarServ.mensajeError('Error al descargar el documento');
        }
      },
      error: (err) => {
        this.actualizarServ.mensajeError('Error al descargar el documento');
        console.error('Error al descargar documento:', err);
      }
    });
  }

  eliminarDocumento(documento: DocumentoRepositorioDTO): void {
    this.actualizarServ.confirmar(
      `¿Está seguro que desea eliminar el documento "${documento.nombreDocumento}"?`,
      () => {
        if (documento.id) {
          this.documentoService.eliminar(documento.id).subscribe({
            next: () => {
              this.actualizarServ.mensajeCorrecto('Documento eliminado correctamente');
              this.buscar();
            },
            error: (err) => {
              this.actualizarServ.mensajeError('Error al eliminar el documento');
              console.error('Error al eliminar documento:', err);
            }
          });
        }
      }
    );
  }

  modificarDocumento(documento: DocumentoRepositorioDTO): void {
    const popup = this.abrirPopup(AgregarDocumentoRepositorioPopupComponent, 'Guardar', {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false,

      initialState: {
        documentoExistente: documento
      }
    });

    popup.documentoGuardado.subscribe(() => {
      this.buscar();
    });
  }
}
