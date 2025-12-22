import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'idUsuario',
    standalone: false
})
export class IdUsuarioPipe implements PipeTransform {
    transform(value: string | undefined): string {
        if (!value || value.length === 0) {
            return '';
        }

        return value.toUpperCase();
    }
}
