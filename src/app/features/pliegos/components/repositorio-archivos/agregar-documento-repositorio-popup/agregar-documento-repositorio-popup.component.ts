import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FormularioBaseComponent } from '../../../../../shared/components/base/formulario-base.component';
import { DocumentoRepositorioService } from '../../../services/documento-repositorio.service';
import { DocumentoRepositorioDTO } from '../../../models/documento-repositorio.model';
import { TipoArchivoRepositorio } from '../../../enum/tipo-archivo-repositorio.enum';
import { ArchivoDTO } from '../../../../../shared/models/common/archivo.model';
import { IFiltroOrganismoDTO } from '../../../../../shared/models/filtros/filtro-organismo.model';
import { CanComponentDeactivate } from '../../../../../shared/utils/can-component-deactivate';
import { formularioTocado } from '../../../../../shared/utils/functions';

@Component({
  selector: 'app-agregar-documento-repositorio-popup',
  templateUrl: './agregar-documento-repositorio-popup.component.html',
  styleUrls: ['./agregar-documento-repositorio-popup.component.scss'],
  standalone: false
})
export class AgregarDocumentoRepositorioPopupComponent extends FormularioBaseComponent implements OnInit, CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly documentoService = inject(DocumentoRepositorioService);

  idDocumento!: number;
  modoIngreso = false;
  titulo = 'Agregar archivo';

  override form!: FormGroup<{
    organismo: FormControl<IFiltroOrganismoDTO | null>;
    nombreDocumento: FormControl<string>;
    descripcionDocumento: FormControl<string>;
    tipoArchivo: FormControl<string>;
    archivo: FormControl<File | null>;
  }>;

  tiposArchivo: { id: string; nombre: string }[] = [
    { id: TipoArchivoRepositorio.LOGO, nombre: 'Logo' },
    { id: TipoArchivoRepositorio.FORMULARIO, nombre: 'Formulario' },
    { id: TipoArchivoRepositorio.OTRO, nombre: 'Otro' }
  ];

  archivoSeleccionado: File | null = null;
  nombreArchivoMostrar: string = '';

  readonly MAX_FILE_SIZE_KB = 100;
  readonly MAX_FILE_SIZE_BYTES = this.MAX_FILE_SIZE_KB * 1024;

  constructor() {
    super();
    this.activatedRoute.params.subscribe(params => {
      this.idDocumento = +params['idDocumento'];
      this.modoIngreso = !this.idDocumento;
    });
  }

  ngOnInit(): void {
    if (!this.modoIngreso) {
      this.titulo = 'Modificar archivo';
    }

    this.inicializarFormulario();
    this.cargarDatosDocumento();
  }

  private inicializarFormulario(): void {
    const archivoValidators = this.modoIngreso ? [Validators.required] : [];

    this.form = this.fb.nonNullable.group({
      organismo: this.fb.control<IFiltroOrganismoDTO | null>(null, Validators.required),
      nombreDocumento: this.fb.nonNullable.control<string>('', [Validators.required, Validators.maxLength(200)]),
      descripcionDocumento: this.fb.nonNullable.control<string>('', Validators.maxLength(500)),
      tipoArchivo: this.fb.nonNullable.control<string>('', Validators.required),
      archivo: this.fb.control<File | null>(null, archivoValidators)
    });
  }

  private cargarDatosDocumento(): void {
    if (this.modoIngreso) {
      return;
    }

    this.documentoService.obtenerPorId(this.idDocumento).subscribe({
      next: (documento: DocumentoRepositorioDTO | undefined) => {
        if (!documento) {
          this.actualizarService.mensajeError('Documento no encontrado');
          this.volver();
          return;
        }

        this.form.patchValue({
          organismo: {
            idInciso: documento.idInciso,
            idUnidadEjecutora: documento.idUnidadEjecutora
          },
          nombreDocumento: documento.nombreDocumento || '',
          descripcionDocumento: documento.descripcionDocumento || '',
          tipoArchivo: documento.tipoArchivo
        });

        if (documento.archivo) {
          this.nombreArchivoMostrar = documento.archivo.nombre || 'Archivo actual';
        }

        setTimeout(() => {
          this.form.markAsPristine();
        }, 500);
      },
      error: (err) => {
        this.actualizarService.mensajeError('Error al cargar el documento');
        console.error('Error al cargar documento:', err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validar tipo de archivo
      const tiposPermitidos = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!tiposPermitidos.includes(file.type)) {
        this.actualizarService.mensajeError(
          'Tipo de archivo no permitido. Solo se permiten archivos PDF, Word y Excel.'
        );
        input.value = '';
        this.archivoSeleccionado = null;
        this.nombreArchivoMostrar = '';
        this.form.get('archivo')?.setValue(null);
        return;
      }

      // Validar tamaño
      if (file.size > this.MAX_FILE_SIZE_BYTES) {
        this.actualizarService.mensajeError(
          `El archivo excede el tamaño máximo permitido de ${this.MAX_FILE_SIZE_KB} KB.`
        );
        input.value = '';
        this.archivoSeleccionado = null;
        this.nombreArchivoMostrar = '';
        this.form.get('archivo')?.setValue(null);
        return;
      }

      this.archivoSeleccionado = file;
      this.nombreArchivoMostrar = file.name;
      this.form.get('archivo')?.setValue(file);
    }
  }

  onFiltroOrganismo(filtro: IFiltroOrganismoDTO | null): void {
    this.form.patchValue({ organismo: filtro });
  }

  guardar(): void {
    this.form.markAllAsTouched();

    if (!this.form.valid) {
      this.actualizarService.mensajeError('Por favor complete todos los campos requeridos');
      return;
    }

    const organismo = this.form.value.organismo;
    if (!organismo || !organismo.idInciso || !organismo.idUnidadEjecutora) {
      this.actualizarService.mensajeError('Debe seleccionar un Inciso y una Unidad Ejecutora');
      return;
    }

    if (this.modoIngreso && !this.archivoSeleccionado) {
      this.actualizarService.mensajeError('Debe seleccionar un archivo');
      return;
    }

    if (this.archivoSeleccionado) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Content = reader.result as string;
        const base64Data = base64Content.split(',')[1];

        const archivo = new ArchivoDTO(
          undefined,
          this.archivoSeleccionado!.name,
          this.archivoSeleccionado!.type,
          base64Data,
          false,
          false,
          new Date()
        );

        this.procesarGuardado(organismo, archivo);
      };

      reader.onerror = () => {
        this.actualizarService.mensajeError('Error al leer el archivo');
      };

      reader.readAsDataURL(this.archivoSeleccionado);
    } else {
      this.procesarGuardado(organismo, undefined);
    }
  }

  private procesarGuardado(organismo: IFiltroOrganismoDTO, archivo?: ArchivoDTO): void {
    if (this.modoIngreso) {
      const documento = new DocumentoRepositorioDTO(
        undefined,
        organismo.idInciso!,
        '',
        organismo.idUnidadEjecutora!,
        '',
        this.form.value.nombreDocumento || '',
        this.form.value.descripcionDocumento || '',
        this.form.value.tipoArchivo as TipoArchivoRepositorio,
        archivo,
        new Date(),
        new Date()
      );

      try {
        this.documentoService.crear(documento).subscribe({
          next: () => {
            this.form.markAsPristine();
            this.volver();
            window.setTimeout(() => {
              this.actualizarService.mensajeCorrecto('Documento agregado correctamente');
            }, 1000);
          },
          error: (err) => {
            this.actualizarService.mensajeError(err.message || 'Error al guardar el documento');
            console.error('Error al guardar el documento:', err);
          }
        });
      } catch (error: any) {
        this.actualizarService.mensajeError(error.message || 'Error al guardar el documento');
        console.error('Error al guardar el documento:', error);
      }
    } else {
      this.documentoService.obtenerPorId(this.idDocumento).subscribe({
        next: (documentoActual: DocumentoRepositorioDTO | undefined) => {
          const documento = new DocumentoRepositorioDTO(
            this.idDocumento,
            organismo.idInciso!,
            documentoActual?.nombreInciso || '',
            organismo.idUnidadEjecutora!,
            documentoActual?.nombreUnidadEjecutora || '',
            this.form.value.nombreDocumento || '',
            this.form.value.descripcionDocumento || '',
            this.form.value.tipoArchivo as TipoArchivoRepositorio,
            archivo || documentoActual?.archivo,
            documentoActual?.fechaCreacion || new Date(),
            new Date()
          );

          try {
            this.documentoService.actualizar(documento).subscribe({
              next: () => {
                this.form.markAsPristine();
                this.volver();
                window.setTimeout(() => {
                  this.actualizarService.mensajeCorrecto('Documento modificado correctamente');
                }, 1000);
              },
              error: (err) => {
                this.actualizarService.mensajeError(err.message || 'Error al guardar el documento');
                console.error('Error al guardar el documento:', err);
              }
            });
          } catch (error: any) {
            this.actualizarService.mensajeError(error.message || 'Error al guardar el documento');
            console.error('Error al guardar el documento:', error);
          }
        },
        error: (err) => {
          this.actualizarService.mensajeError('Error al cargar el documento actual');
          console.error('Error al obtener documento actual:', err);
        }
      });
    }
  }

  onDatosCargados(): void {
    // Este método se ejecuta cuando el filtro-organismo termina de cargar los datos
  }

  volver(): void {
    this.router.navigate(['/pliegos/repositorio-archivos'], { queryParams: { volver: 1 } });
  }

  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    return !formularioTocado(this.form);
  }
}
