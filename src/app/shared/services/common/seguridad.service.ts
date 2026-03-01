import { Injectable } from '@angular/core';
import { ProveedorDTO } from '../../models/proveedor/proveedor.model';
import { IUnidadCompraDTO } from '../../models/sice/unidad-compra.model';
import { IUsuarioInfoDTO } from '../../models/usuario/usuario-info.model';
import { ActualizarService } from './actualizar.service';
import { AuthRawService } from './auth-raw-service';
import { UtilService } from './util.service';

@Injectable({
    providedIn: 'root',
})
export class SeguridadService {
    public constructor(
        private readonly util: UtilService,
        private readonly actualizar: ActualizarService,
        private readonly authRaw: AuthRawService,
    ) {}

    limpiarContexto() {
        sessionStorage.clear();
    }

    obtenerNombreUsuarioLogueado(): string {
        const nombreUsuario: string | null =
            sessionStorage.getItem('nombreUsuario');
        if (nombreUsuario && nombreUsuario !== null && nombreUsuario !== '') {
            return nombreUsuario;
        } else {
            return '';
        }
    }

    obtenerUsuarioLogueado(): string {
        const usuario: string | null = sessionStorage.getItem('usuario');
        if (usuario && usuario !== null && usuario !== '') {
            return usuario;
        } else {
            return '';
        }
    }

    cargarContexto(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.util.usuarioInfo().subscribe({
                next: (data: IUsuarioInfoDTO) => {
                    this.limpiarContexto();
                    sessionStorage.setItem('nombreUsuario', '' + data.nombre);
                    sessionStorage.setItem('usuario', '' + data.usuario);
                    this.almacenarProveedores(data.proveedores ?? []);
                    this.almacenarUnidadesCompra(data.unidadesCompra ?? []);
                    this.almacenarPermisos(data.permisos ?? []);
                    resolve(true);
                },
                error: (error: any) => {
                    reject(new Error(error));
                },
            });
        });
    }

    public tienePermiso(permiso: string): boolean {
        return (
            this.obtenerPermisos().filter(
                (permisoAux) => permiso === permisoAux,
            ).length > 0
        );
    }

    public tieneAlgunPermiso(permisos: string[]): boolean {
        return (
            permisos.filter((permiso) => this.tienePermiso(permiso)).length > 0
        );
    }

    public almacenarPermisos(permisos: string[]): void {
        sessionStorage.setItem('permisos', permisos.toString());
    }

    almacenarUnidadesCompra(unidadesCompra: IUnidadCompraDTO[]) {
        sessionStorage.setItem(
            'unidadesCompra',
            JSON.stringify(unidadesCompra),
        );
    }
    almacenarProveedores(proveedores: ProveedorDTO[]) {
        sessionStorage.setItem('proveedores', JSON.stringify(proveedores));
    }

    obtenerUnidadesCompra(): IUnidadCompraDTO[] {
        const unidadesCompra: string | null =
            sessionStorage.getItem('unidadesCompra');
        if (
            unidadesCompra &&
            unidadesCompra !== null &&
            unidadesCompra !== ''
        ) {
            return JSON.parse(unidadesCompra);
        } else {
            return [];
        }
    }
    obtenerProveedores(): ProveedorDTO[] {
        const proveedores: string | null =
            sessionStorage.getItem('proveedores');
        if (proveedores && proveedores !== null && proveedores !== '') {
            return JSON.parse(proveedores);
        } else {
            return [];
        }
    }

    usuarioLogueadoEsUsuarioOrganismo(): boolean {
        return this.obtenerUnidadesCompra()
            ? this.obtenerUnidadesCompra().length > 0
            : false;
    }
    usuarioLogueadoEsUsuarioProveedor(): boolean {
        return this.tienePermiso('USUARIO_PROVEEDOR');
    }

    usuarioLogueadoPuedeCambiarPerfil(): boolean {
        return (
            this.usuarioLogueadoEsUsuarioOrganismo() &&
            this.usuarioLogueadoEsUsuarioProveedor()
        );
    }

    public async cargarPermisos(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (
                this.authRaw.isLoggedIn() &&
                (sessionStorage.getItem('permisos') === null ||
                    sessionStorage.getItem('permisos') === undefined ||
                    sessionStorage.getItem('permisos') === '')
            ) {
                this.util.usuarioInfo().subscribe({
                    next: (data: IUsuarioInfoDTO) => {
                        let permisos: string[] = [];
                        if (data.permisos) {
                            permisos = data.permisos;
                            this.almacenarPermisos(permisos);
                        }
                        resolve();
                    },
                    error: (error: any) => {
                        reject(new Error(error));
                    },
                });
            } else {
                resolve();
            }
        });
    }

    public obtenerPermisos(): string[] {
        this.cargarPermisos();
        const permisos: string | null = sessionStorage.getItem('permisos');
        if (permisos && permisos !== null && permisos !== '') {
            return permisos.split(',');
        } else {
            return [];
        }
    }
}
