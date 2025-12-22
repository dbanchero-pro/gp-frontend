import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, from } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { CambiarPerfilComponent } from 'src/app/shared/components/cambiar-perfil/cambiar-perfil.component';
import { TipoBusqueda } from 'src/app/shared/enum/tipo-busqueda-item.enum';
import { IMenuItem } from 'src/app/shared/models/common/menu-item.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { UtilService } from 'src/app/shared/services/common/util.service';

import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ProveedorDTO } from 'src/app/shared/models/proveedor/proveedor.model';
import { UnidadCompraDTO } from 'src/app/shared/models/sice/unidad-compra.model';
import { AuthRawService } from 'src/app/shared/services/common/auth-raw-service';
import { MenuService } from '../../../shared/services/common/menu.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    standalone: false
})
export class MenuComponent implements OnInit {
    tipoUsuario?: TipoUsuario;
    menuItems$?: Observable<Array<IMenuItem>>;
    public nombre: string = '';
    itemsUC: UnidadCompraDTO[] = [];
    itemsP: ProveedorDTO[] = [];
    tipo: TipoBusqueda = TipoBusqueda.NINGUNO;
    openDialogUcProveedor = false;
    mostrarCambiarPerfil: boolean = false;

    @ViewChild('buttonMenu') buttonMenu: any;

    innerWidth!: number;
    isMobile!: boolean;  // true si < 992px


    constructor(
        readonly menu: MenuService,
        readonly util: UtilService,
        readonly actualizar: ActualizarService,
        readonly seguridad: SeguridadService,
        readonly authRaw: AuthRawService,
        public dialog: MatDialog
    ) {
        this.actualizar.tipoUsuario$.subscribe((tipoUsuario?: TipoUsuario) => {
            this.tipoUsuario = tipoUsuario;
            this.menuItems$ = this.obtenerMenu(this.seguridad.obtenerPermisos(), this.tipoUsuario);
        });
     }


    ngOnInit(): void {
        // Valor inicial al arrancar la app
        this.innerWidth = window.innerWidth;
        this.checkMobile();
        this.nombre = this.seguridad.obtenerNombreUsuarioLogueado();
        this.itemsUC = this.seguridad.obtenerUnidadesCompra();
        this.actualizar.cambiarTipoUsuario(this.seguridad.obtenerTipoUsuario());
        this.mostrarCambiarPerfil = this.verificarMostrarCambiarPerfil();
        this.menuItems$ = this.obtenerMenu(this.seguridad.obtenerPermisos(), this.tipoUsuario);

    }

    obtenerProveedoresUsuarioLogueado(): ProveedorDTO[] {
        return this.itemsP;
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: UIEvent) {
        this.innerWidth = (event.target as Window).innerWidth;
        this.checkMobile();
    }

    private checkMobile() {
        this.isMobile = this.innerWidth < 992;
        if (!this.isMobile) {
            if (this.buttonMenu?.nativeElement.getAttribute('aria-expanded') === 'true') {
                this.buttonMenu?.nativeElement.click();
            }

        }
    }

    private verificarMostrarCambiarPerfil(): boolean {
        return this.seguridad.usuarioLogueadoPuedeCambiarPerfil();
    }

    public obtenerMenu(permisos: string[], tipoUsuario?: TipoUsuario): Observable<IMenuItem[]> {
        const items: IMenuItem[] = this.menu.obtenerMenu(permisos, tipoUsuario).filter(item => item.visible === undefined || item.visible === true);
        items.forEach(item => {
            if (item.items) {
                item.items = item.items.filter(subItem => subItem.visible === undefined || subItem.visible === true);
            }
        });
        if (!items || items.length === 0) {
            this.actualizar.mensajeError( 'El usuario no tiene permisos' );
        }
        return from<IMenuItem[][]>([items]);
    }

    public cerrarSesion(): void {
        this.authRaw.logout(window.location.origin + AppConfig.settings.urlBaseFrontEnd)
            .then(() => {
               this.authRaw.clearToken();
            });
    }


    cambiarPerfil(): void {
        const dialogRef = this.dialog.open(CambiarPerfilComponent, {
            disableClose: true,
            data: {
                itemsUC: this.itemsUC,
                itemsP: this.itemsP,
                tipo: this.tipo,
                open: this.openDialogUcProveedor
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.openDialogUcProveedor = true;
            }
        });
    }

    toggleSubmenu(event: MouseEvent, menu: any, item: any, esClick: boolean = false) {
        this.menuItems$?.forEach((menu2: any) => {
            if (!this.isMobile) {
                menu.items.forEach((it: any) => {
                    if (item !== it) {
                        it._open = false;
                    };
                })
            }
        });
        if (esClick || !this.isMobile) {
            item._open = !item._open;
        }
    }

    toggleMenu(event: MouseEvent, menu: any) {
        this.menuItems$?.forEach((menu2: any) => {
            if (menu2 !== menu) {
                menu.items.forEach((it: any) => it._open = false);
            }
        });
    }

}