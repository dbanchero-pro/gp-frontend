import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'idUsuario'
})
export class IdUsuarioPipe implements PipeTransform {
    transform(value: string | undefined): string {
        if (!value || value.length === 0) {
            return '';
        }

        return value.toUpperCase();
    }
}
