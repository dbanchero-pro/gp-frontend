import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertDialogComponent } from './shared/components/alert-dialog/alert-dialog.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { ActualizarService } from './shared/services/common/actualizar.service';
import { AuthRawService } from './shared/services/common/auth-raw-service';
import { PageComponent } from './template/layout/page/page.component';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    PageComponent,
    AlertDialogComponent,
    ConfirmDialogComponent,
    RouterOutlet,
  ],
})
export class AppComponent implements OnInit {
    title = 'gp-frontend';
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

