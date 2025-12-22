import { Pipe, PipeTransform } from '@angular/core';
import { ProveedorDTO } from '../models/proveedor/proveedor.model';

@Pipe({
    name: 'idProveedor',
    standalone: false
})
export class IdProveedorPipe implements PipeTransform {
    transform(value: ProveedorDTO | undefined): string {
        if (!value) {
            return '';
        }

        return (value.paisDocumento.id + "-" + value.tipoDocumento + "-" + value.nroDocumento).toUpperCase();
    }
}
