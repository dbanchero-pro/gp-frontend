import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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
import { FiltroRepositorioArchivosComponent } from '../filtro-repositorio-archivos/filtro-repositorio-archivos.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AgregarDocumentoRepositorioPopupComponent } from '../agregar-documento-repositorio-popup/agregar-documento-repositorio-popup.component';

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

  @ViewChild(FiltroRepositorioArchivosComponent) filtroComponent!: FiltroRepositorioArchivosComponent;

  listaOrden: IColumnaOrden[] = [
    { id: 'nombreDocumento', nombre: 'Nombre documento' },
    { id: 'tipoArchivo', nombre: 'Tipo archivo' },
    { id: 'fechaCreacion', nombre: 'Fecha creación' }
  ];

  columnaOrdenInicial = 'fechaCreacion';
  ordenInicial: 'asc' | 'desc' = 'desc';

  documentos: DocumentoRepositorioDTO[] = [];

  public static readonly SNAPSHOT_KEY = 'CONSULTA_REPOSITORIO_ARCHIVOS';

  constructor() {
    super();
    this.form = this.fb.group({});
  }

  override ngOnInit(): void {
    super.ngOnInit();

    const paramVolver = this.route.snapshot.queryParamMap.get('volver');

    if (paramVolver === '1') {
      this.buscarVolver();

      const currentUrl = this.router.url.split('?')[0];
      this.router.navigateByUrl(currentUrl, { replaceUrl: true });
    } else {
      this.nuevaConsulta();
    }
  }

  private buscarVolver(): void {
    const snap = this.snapshotGenericService.load<any>(
      ConsultaRepositorioArchivosComponent.SNAPSHOT_KEY
    );
    if (snap) {
      this.parametros.pagina = snap.pagina ?? 0;
      this.parametros.tamanoPagina = snap.tamanoPagina ?? 10;
      this.parametros.sort = snap.sort ?? this.columnaOrdenInicial;
      this.parametros.order = snap.order ?? this.ordenInicial;
      this.parametros.filtro = snap.filtro ?? {};

      setTimeout(() => {
        this.buscar();
      }, 200);
    } else {
      this.nuevaConsulta();
    }
  }

  actualizarFiltrosYBuscar(): void {
    this.parametros.pagina = 0;
    this.buscar();
  }

  buscar(): void {
    const filtro = this.filtroComponent?.obtenerFiltro() || new FiltroDocumentoRepositorioDTO();
    this.parametros.filtro = filtro;

    this.documentoService
      .obtenerTodos(
        filtro,
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
    this.parametros = {
      filtro: new FiltroDocumentoRepositorioDTO(),
      pagina: 0,
      tamanoPagina: 10,
      sort: this.columnaOrdenInicial,
      order: this.ordenInicial
    };
    this.documentos = [];
    this.total = 0;

    this.snapshotGenericService.clear(
      ConsultaRepositorioArchivosComponent.SNAPSHOT_KEY
    );
  }

  override descargarExcel(): void {
    this.actualizarServ.mensajeInformacion(
      'La funcionalidad de exportar a Excel estará disponible próximamente'
    );
  }

  abrirAgregarDocumento(): void {
    const initialState = {};

    const modalRef = this.modalService.show(AgregarDocumentoRepositorioPopupComponent, {
      initialState,
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.content?.documentoGuardado.subscribe(() => {
      this.buscar();
    });
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
    this.actualizarServ.mensajeInformacion(
      'La funcionalidad de modificar documento estará disponible próximamente'
    );
  }
}
