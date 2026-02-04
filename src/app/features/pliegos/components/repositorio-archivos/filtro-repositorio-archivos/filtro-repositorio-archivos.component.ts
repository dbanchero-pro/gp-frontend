import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FiltroDocumentoRepositorioDTO } from '../../../models/filtro-documento-repositorio.model';
import { DocumentoRepositorioService } from '../../../services/documento-repositorio.service';
import { IFiltroOrganismoDTO } from '../../../../../shared/models/filtros/filtro-organismo.model';

@Component({
  selector: 'app-filtro-repositorio-archivos',
  templateUrl: './filtro-repositorio-archivos.component.html',
  styleUrls: ['./filtro-repositorio-archivos.component.scss'],
  standalone: false
})
export class FiltroRepositorioArchivosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly documentoService = inject(DocumentoRepositorioService);

  @Input() filtro: FiltroDocumentoRepositorioDTO | null = null;
  @Output() evFilter = new EventEmitter<void>();
  @Output() evCollapse = new EventEmitter<void>();
  @Output() evNuevaConsulta = new EventEmitter<void>();
  @Output() evDescargarExcel = new EventEmitter<void>();

  protected form!: FormGroup<{
    organismo: FormControl<IFiltroOrganismoDTO | null>;
    nombreDocumento: FormControl<string>;
    tipoArchivo: FormControl<string>;
  }>;

  protected tiposArchivo: { id: string; nombre: string }[] = [];

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      organismo: this.fb.control<IFiltroOrganismoDTO | null>(null),
      nombreDocumento: this.fb.nonNullable.control<string>(''),
      tipoArchivo: this.fb.nonNullable.control<string>('')
    });

    this.tiposArchivo = this.documentoService.obtenerTiposArchivo();

    if (this.filtro) {
      this.form.patchValue({
        organismo: {
          idInciso: this.filtro.idInciso,
          idUnidadEjecutora: this.filtro.idUnidadEjecutora
        },
        nombreDocumento: this.filtro.nombreDocumento || '',
        tipoArchivo: this.filtro.tipoArchivo || ''
      });
    }
  }

  onFiltroOrganismo(filtro: IFiltroOrganismoDTO | null): void {
    this.form.patchValue({ organismo: filtro });
  }

  obtenerFiltro(): FiltroDocumentoRepositorioDTO {
    const organismo = this.form.value.organismo;
    return new FiltroDocumentoRepositorioDTO(
      organismo?.idInciso,
      organismo?.idUnidadEjecutora,
      this.form.value.nombreDocumento || undefined,
      this.form.value.tipoArchivo as any || undefined
    );
  }

  buscar(): void {
    this.evFilter.emit();
  }

  nuevaConsulta(): void {
    this.form.reset({
      organismo: null,
      nombreDocumento: '',
      tipoArchivo: ''
    });
    this.evNuevaConsulta.emit();
  }

  descargarExcel(): void {
    this.evDescargarExcel.emit();
  }
}
