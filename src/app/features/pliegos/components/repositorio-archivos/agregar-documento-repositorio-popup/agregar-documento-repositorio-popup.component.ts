import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PopupBaseComponent } from '../../../../../shared/components/popup-base/popup-base.component';
import { DocumentoRepositorioService } from '../../../services/documento-repositorio.service';
import { DocumentoRepositorioDTO } from '../../../models/documento-repositorio.model';
import { TipoArchivoRepositorio } from '../../../enum/tipo-archivo-repositorio.enum';
import { ArchivoDTO } from '../../../../../shared/models/common/archivo.model';
import { IFiltroOrganismoDTO } from '../../../../../shared/models/filtros/filtro-organismo.model';
import { ActualizarService } from '../../../../../shared/services/common/actualizar.service';

@Component({
  selector: 'app-agregar-documento-repositorio-popup',
  templateUrl: './agregar-documento-repositorio-popup.component.html',
  styleUrls: ['./agregar-documento-repositorio-popup.component.scss'],
  standalone: false
})
export class AgregarDocumentoRepositorioPopupComponent extends PopupBaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly documentoService = inject(DocumentoRepositorioService);
  protected readonly actualizarServ = inject(ActualizarService);

  @Output() documentoGuardado = new EventEmitter<DocumentoRepositorioDTO>();

  documentoExistente?: DocumentoRepositorioDTO;
  esModificacion = false;
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

  override ngOnInit(): void {
    super.ngOnInit();

    if (this.documentoExistente) {
      this.esModificacion = true;
      this.titulo = 'Modificar archivo';
    }

    this.inicializarFormulario();
    this.cargarDatosDocumento();
  }

  private inicializarFormulario(): void {
    const archivoValidators = this.esModificacion ? [] : [Validators.required];

    this.form = this.fb.nonNullable.group({
      organismo: this.fb.control<IFiltroOrganismoDTO | null>(null, Validators.required),
      nombreDocumento: this.fb.nonNullable.control<string>('', [Validators.required, Validators.maxLength(200)]),
      descripcionDocumento: this.fb.nonNullable.control<string>('', Validators.maxLength(500)),
      tipoArchivo: this.fb.nonNullable.control<string>('', Validators.required),
      archivo: this.fb.control<File | null>(null, archivoValidators)
    });
  }

  private cargarDatosDocumento(): void {
    if (!this.documentoExistente) {
      return;
    }

    this.form.patchValue({
      organismo: {
        idInciso: this.documentoExistente.idInciso,
        idUnidadEjecutora: this.documentoExistente.idUnidadEjecutora
      },
      nombreDocumento: this.documentoExistente.nombreDocumento || '',
      descripcionDocumento: this.documentoExistente.descripcionDocumento || '',
      tipoArchivo: this.documentoExistente.tipoArchivo
    });

    if (this.documentoExistente.archivo) {
      this.nombreArchivoMostrar = this.documentoExistente.archivo.nombre || 'Archivo actual';
    }
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
        this.mostrarError(
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
        this.mostrarError(
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
      this.mostrarError('Por favor complete todos los campos requeridos');
      return;
    }

    const organismo = this.form.value.organismo;
    if (!organismo || !organismo.idInciso || !organismo.idUnidadEjecutora) {
      this.mostrarError('Debe seleccionar un Inciso y una Unidad Ejecutora');
      return;
    }

    if (!this.esModificacion && !this.archivoSeleccionado) {
      this.mostrarError('Debe seleccionar un archivo');
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
        this.mostrarError('Error al leer el archivo');
      };

      reader.readAsDataURL(this.archivoSeleccionado);
    } else {
      this.procesarGuardado(organismo, undefined);
    }
  }

  private procesarGuardado(organismo: IFiltroOrganismoDTO, archivo?: ArchivoDTO): void {
    const documento = new DocumentoRepositorioDTO(
      this.documentoExistente?.id,
      organismo.idInciso!,
      this.documentoExistente?.nombreInciso || '',
      organismo.idUnidadEjecutora!,
      this.documentoExistente?.nombreUnidadEjecutora || '',
      this.form.value.nombreDocumento || '',
      this.form.value.descripcionDocumento || '',
      this.form.value.tipoArchivo as TipoArchivoRepositorio,
      archivo || this.documentoExistente?.archivo,
      this.documentoExistente?.fechaCreacion || new Date(),
      new Date()
    );

    try {
      const operacion = this.esModificacion
        ? this.documentoService.actualizar(documento)
        : this.documentoService.crear(documento);

      operacion.subscribe({
        next: (documentoGuardado) => {
          const mensaje = this.esModificacion
            ? 'Documento modificado correctamente'
            : 'Documento agregado correctamente';
          this.actualizarServ.mensajeCorrecto(mensaje);
          this.documentoGuardado.emit(documentoGuardado);
          this.cerrarPopup();
        },
        error: (err) => {
          this.mostrarError(err, 'Error al guardar el documento');
        }
      });
    } catch (error: any) {
      this.mostrarError(error, 'Error al guardar el documento');
    }
  }

  onDatosCargados(): void {
    // Este método se ejecuta cuando el filtro-organismo termina de cargar los datos
  }

  cancelar(): void {
    this.cancelarConConfirmacion();
  }
}
