import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { IFiltroOrganismoDTO } from 'src/app/shared/models/filtros/filtro-organismo.model';
import { DocumentoRepositorioDTO } from 'src/app/shared/models/pliego/documento-repositorio.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { FiltroDocumentoRepositorioDTO } from '../../../models/filtros/filtro-documento-repositorio.model';
import { DocumentoRepositorioService } from '../../../services/documento-repositorio.service';

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

  listaOrden: IColumnaOrden[] = [
    { id: 'nombreDocumento', nombre: 'Nombre documento' },
    { id: 'tipoArchivo', nombre: 'Tipo archivo' },
  ];

  columnaOrdenInicial = 'nombreDocumento';
  ordenInicial: 'asc' | 'desc' = 'desc';

  documentos: DocumentoRepositorioDTO[] = [];
  tiposArchivo: { id: string; nombre: string }[] = [];

  public static readonly SNAPSHOT_KEY = 'CONSULTA_REPOSITORIO_ARCHIVOS';

  constructor() {
    super();
    this.form = this.fb.nonNullable.group({
      organismo: this.fb.control<IFiltroOrganismoDTO | null>(null),
      nombreDocumento: this.fb.nonNullable.control<string>(''),
      tipoArchivo: this.fb.nonNullable.control<string>('')
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.tiposArchivo = this.documentoService.obtenerTiposArchivo();

    const snapshot = this.snapshotGenericService.load<any>(
      ConsultaRepositorioArchivosComponent.SNAPSHOT_KEY
    );

    if (snapshot) {
      this.restaurarSnapshot(snapshot);
    } else {
      this.nuevaConsulta();
    }
  }

  onFiltroOrganismo(filtro: IFiltroOrganismoDTO | null): void {
    this.form.patchValue({ organismo: filtro });
  }

  private restaurarSnapshot(snapshot: any): void {
    this.parametros = snapshot;

    const filtro = snapshot.filtro;
    const organismoFiltro: IFiltroOrganismoDTO | null =
      filtro?.idInciso || filtro?.idUnidadEjecutora
        ? {
            idInciso: filtro.idInciso,
            idUnidadEjecutora: filtro.idUnidadEjecutora
          }
        : null;

    this.form.patchValue({
      organismo: organismoFiltro,
      nombreDocumento: filtro?.nombreDocumento || '',
      tipoArchivo: filtro?.tipoArchivo || ''
    });

    this.buscar();
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
    this.router.navigate(['agregar'], { relativeTo: this.route });
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
    if (documento.id) {
      this.router.navigate(['modificar', documento.id], { relativeTo: this.route });
    }
  }
}
