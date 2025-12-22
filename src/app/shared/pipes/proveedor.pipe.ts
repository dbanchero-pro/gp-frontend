import { Pipe, PipeTransform } from '@angular/core';
import { ProveedorDTO } from 'src/app/shared/models/proveedor/proveedor.model';

@Pipe({ name: 'proveedor', standalone: false, pure: true })
export class ProveedorPipe implements PipeTransform {

  transform(proveedor: ProveedorDTO | undefined): string {
    if (!proveedor) return '';

    const nombre = proveedor.nombre ?? '';
    const pais = proveedor.paisDocumento?.descripcion ?? '';
    const tipoDoc = proveedor.tipoDocumento ?? '';
    const nroDoc = proveedor.nroDocumento ?? '';

    return `${nombre} (${tipoDoc} ${nroDoc} ${pais})`;
  }

}
