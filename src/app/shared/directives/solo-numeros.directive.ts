import { Directive, HostListener } from '@angular/core';

@Directive({
    selector: '[soloNumeros]',
    standalone: false
})
export class SoloNumerosDirective {
    @HostListener('keypress', ['$event'])
    onKeyPress(event: KeyboardEvent) {
        if (event.key < "0" || event.key > "9") {
            event.preventDefault();
        }
    }
}