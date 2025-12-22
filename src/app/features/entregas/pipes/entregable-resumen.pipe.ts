import { Pipe, PipeTransform } from '@angular/core';
import { IEntregableDTO } from '../models/entregable.model';

@Pipe({ name: 'entregableResumen', pure: true, standalone: false })
export class EntregableResumenPipe implements PipeTransform {
  transform(entregable: IEntregableDTO | undefined | null): string {
    if (!entregable) return '';
    return `${entregable.codEntregable ?? ''} - ${entregable.descEntregable ?? ''}`.trim();
  }
}
