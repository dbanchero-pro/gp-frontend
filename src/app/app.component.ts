import { Component, OnInit } from "@angular/core";
import { ActualizarService } from "./shared/services/common/actualizar.service";
import { AuthRawService } from "./shared/services/common/auth-raw-service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
    title = "gp-frontend";
    public mostrarCargando: boolean = false;
    public cargado: boolean = false;

    constructor(
        private readonly authRaw: AuthRawService,
        private readonly actualizar: ActualizarService
    ) {
        this.mostrarCargando = true;

        this.actualizar.cargando$.subscribe(data => {
            window.setTimeout(() => this.cargado = data, 150);
        });
    }

    ngOnInit() {
        const yaLogueado = this.authRaw.isLoggedIn();
        this.mostrarCargando = !yaLogueado;

        if (!yaLogueado) {
            this.authRaw.login({ redirectUri: window.location.origin + window.location.pathname });
        } else {
            this.mostrarCargando = false;
        }
    }
}


