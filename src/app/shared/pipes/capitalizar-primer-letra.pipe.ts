import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    
    standalone: true,
name: 'capitalizarPrimerLetra'
})
export class CapitalizarPrimerLetraPipe implements PipeTransform {
    transform(value: string | undefined): string {
        if (!value || value.length === 0) {
            return '';
        }

        const stringLower = value.toLowerCase();

        const firstLetter = stringLower.charAt(0).toUpperCase();
        const remainingLetters = stringLower.slice(1);

        return firstLetter + remainingLetters;
    }
}
