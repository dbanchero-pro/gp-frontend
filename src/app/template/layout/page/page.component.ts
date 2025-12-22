import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { LoggerService } from 'src/app/shared/services/common/logger.service';
import { MenuService } from 'src/app/shared/services/common/menu.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { TipoMensajeEnum } from '../../../shared/enum/tipo-mensaje.enum';
import { ActualizarService } from '../../../shared/services/common/actualizar.service';

@Component({
    selector: 'app-page',
    templateUrl: './page.component.html',
    styleUrls: ['./page.component.scss'],
    standalone: false
})
export class PageComponent implements OnInit {
    tipoUsuario?: TipoUsuario;
    titulo = '';
    subTitulo = '';
    resultMsg: string[] = [''];
    showMsg = false;
    typeMsg: TipoMensajeEnum = TipoMensajeEnum.success;
    estado = '';
    constructor(
        public readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly menu: MenuService,
        private readonly actualizar: ActualizarService,
        private readonly seguridad: SeguridadService,
        private readonly logger: LoggerService
    ) {
        this.actualizar.tipoUsuario$.subscribe((tipoUsuario?: TipoUsuario) => {
            this.tipoUsuario = tipoUsuario;
            this.actualizarTitulo();
            this.actualizarDatos();
            if (this.router.url!== "/" && !this.menu.tienePermisoUrl(this.router.url, this.seguridad.obtenerTipoUsuario())) {
                this.logger.logWarning('No tiene permiso para acceder a esta URL:', this.router.url);
                this.router.navigate(['/inicio']);
            }
        });
        this.actualizarTitulo();
        this.router.events.subscribe((event: any) => {
            if (event instanceof NavigationEnd) {
                this.actualizarTitulo();
            }
        });
    }

    private actualizarTitulo(): void {
        this.actualizar.titulo$.subscribe((data: string[]) => {
            if (data.length > 0) {
                this.titulo = data[0];
            }
        });
        this.actualizar.subTitulo$.subscribe((data: string[]) => {
            if (data.length > 0) {
                this.estado = '';
                this.subTitulo = data[0];
            }
        });
        this.actualizar.estado$.subscribe((data: string) => {
            this.estado = data;
        });
    }

    ngOnInit(): void {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.actualizarDatos();
            }
        });
    }

    private actualizarDatos() {
        window.setTimeout(() => {
            this.titulo = this.menu.obtenerItemMasAbajo(this.router.url, this.tipoUsuario)?.titulo ?? '';
            this.subTitulo = this.menu.obtenerItemMasAbajo(this.router.url, this.tipoUsuario)?.subtitulo ?? '';
        }, 0);
    }
}
