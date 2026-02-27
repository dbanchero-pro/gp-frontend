import { Component, Input } from "@angular/core";


@Component({
    selector: "app-registro-usuario",
    templateUrl: "./registro-usuario.component.html",
})

export class RegistroUsuario {

    @Input() usuario: any = {};
    @Input() correo: boolean = false;
    @Input() documento: boolean = false;
    @Input() accionEliminar!: () => void;

    constructor() { }

    ejecutarAccionEliminar() {
        if (this.accionEliminar) {
            this.accionEliminar();
        }
    }

    formatearDocumento(doc: string): string {
        if (!doc) return '';

        const partes = doc.toUpperCase().split('-');

        if (partes.length < 3) return doc.toUpperCase();

        const pais = partes[0];
        const tipo = partes[1];
        const numero = partes[2];

        return `${pais} ${tipo} ${numero}`;
    }

}



