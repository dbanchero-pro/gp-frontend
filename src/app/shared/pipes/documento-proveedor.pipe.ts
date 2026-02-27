import { Pipe, PipeTransform } from '@angular/core';
import { ProveedorDTO } from 'src/app/shared/models/proveedor/proveedor.model';

@Pipe({ name: 'documentoProveedor', pure: true })
export class DocumentoProveedorPipe implements PipeTransform {
    transform(proveedor: ProveedorDTO | undefined): string {
        if (!proveedor) return '';
        const tipo = proveedor.tipoDocumento ?? '';
        const nro = proveedor.nroDocumento ?? '';
        const pais = proveedor.paisDocumento?.descripcion ?? '';
        return `${tipo} ${nro} ${pais}`.trim();
    }
}
