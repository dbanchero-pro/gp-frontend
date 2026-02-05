import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { TipoUsuario } from '../../enum/tipo-usuario.enum';
import { IMenuItem } from '../../models/common/menu-item.model';
import { SeguridadService } from './seguridad.service';

export interface SubItem {
    nombre: string;
    url: string | null;
}

@Injectable({
    providedIn: 'root',
})
export class MenuService {
    constructor(private readonly router: Router, private readonly seguridad: SeguridadService) { }

    public obtenerMenu(permisos: string[], tipoUsuario?: TipoUsuario, ignorarPermisos: boolean = false): IMenuItem[] {
        const items: IMenuItem[] = this.obtenerMenuItems(tipoUsuario);
        return this.filtrarMenu(items, permisos, tipoUsuario === TipoUsuario.PROVEEDOR || ignorarPermisos);
    }

    public filtrarMenu(items: IMenuItem[], permisos: string[], ignorarPermisos: boolean = false): IMenuItem[] {
        const retorno: IMenuItem[] = [];
        items.forEach((item) => {
            if (item.items) {
                const subItems: IMenuItem[] = this.filtrarMenu(
                    item.items,
                    permisos,
                    ignorarPermisos
                );
                if (subItems.length !== 0) {
                    item.items = subItems;
                    retorno.push(item);
                }
            } else if (
                item.permisos === undefined ||
                item.permisos.length === 0 || ignorarPermisos
            ) {
                retorno.push(item);
            } else if (
                ignorarPermisos ||
                item.permisos.filter(
                    (permisoItem) =>
                        permisos.filter(
                            (permiso) => permiso === permisoItem
                        ).length > 0
                ).length > 0
            ) {
                retorno.push(item);
            }
        });
        return retorno;
    }

    private obtenerMenuItems(tipoUsuario?: TipoUsuario): IMenuItem[] {
        return this.filtrarPorTipoUsuario([
            this.menuAdministracion(tipoUsuario),
          //  this.menuEntregas(tipoUsuario),
        ], tipoUsuario);
    }

    private menuEntregas(tipoUsuario?: TipoUsuario): IMenuItem {
        return {
            nombre: 'Gestión',
            visible: true,
            tipoUsuario: TipoUsuario.AMBOS,
            items: [
                {
                    nombre: 'Seguimiento y ajustes',
                    titulo: 'Seguimiento Entregas y Ajustes Órdenes Compra',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar órdenes de compra y gestionar las entregas o solicitar ajustes',
                    visible: true,
                    tipoUsuario: TipoUsuario.PROVEEDOR,
                    permisos: [],
                    url: '/entregas/seguimiento-proveedor',
                },
                {
                    nombre: 'Seguimiento y ajustes',
                    titulo: 'Seguimiento Entregas y Ajustes Órdenes Compra',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar órdenes de compra y gestionar las entregas o los ajustes',
                    visible: true,
                    tipoUsuario: TipoUsuario.ORGANISMO,
                    permisos: [
                        'GC_GESTION_RECEP.CONSULTA',
                        'GC_GESTION_RECEP.ALTA',
                        'GC_GESTION_RECEP.MODIFICACION',
                        'GC_GESTION_RECEP.BAJA',
                        'GC_GESTION_RECEP.IMPRESION',
                        'GC_GESTION_CONF.CONSULTA',
                        'GC_GESTION_CONF.ALTA',
                        'GC_GESTION_CONF.MODIFICACION',
                        'GC_GESTION_CONF.BAJA',
                        'GC_GESTION_CONF.IMPRESION',
                        'GC_GESTION_ENTR.CONSULTA',
                        'GC_GESTION_ENTR.ALTA',
                        'GC_GESTION_ENTR.MODIFICACION',
                        'GC_GESTION_ENTR.BAJA',
                        'GC_GESTION_ENTR.IMPRESION',
                    ],
                    url: '/entregas/seguimiento-organismo',
                },
                {
                    nombre: 'Ver auditoría entregas',
                    titulo: 'Auditoría Entregas',
                    subtitulo: 'Consulta las operaciones realizadas a las entregas de un ítem de una orden de compra',
                    visible: true,
                    tipoUsuario: TipoUsuario.AMBOS,
                    permisos: [
                        'GC_GESTION_RECEP.CONSULTA',
                        'GC_GESTION_RECEP.ALTA',
                        'GC_GESTION_RECEP.MODIFICACION',
                        'GC_GESTION_RECEP.BAJA',
                        'GC_GESTION_RECEP.IMPRESION',
                        'GC_GESTION_CONF.CONSULTA',
                        'GC_GESTION_CONF.ALTA',
                        'GC_GESTION_CONF.MODIFICACION',
                        'GC_GESTION_CONF.BAJA',
                        'GC_GESTION_CONF.IMPRESION',
                        'GC_GESTION_ENTR.CONSULTA',
                        'GC_GESTION_ENTR.ALTA',
                        'GC_GESTION_ENTR.MODIFICACION',
                        'GC_GESTION_ENTR.BAJA',
                        'GC_GESTION_ENTR.IMPRESION',
                    ],
                    url: '/entregas/auditoria-entregas',
                },
                {
                    nombre: 'Ver auditoría ajustes',
                    titulo: 'Auditoría Ajustes',
                    subtitulo: 'Consulta las operaciones realizadas a los ajustes de un ítem o de una orden de compra',
                    visible: true,
                    tipoUsuario: TipoUsuario.AMBOS,
                    permisos: ['GC_AJUSTES_ORDE.ALTA', 'GC_AJUSTES_ORDE.BAJA', 'GC_AJUSTES_ORDE.MODIFICACION'
                        , 'GC_AJUSTES_ORDE.CONSULTA', 'GC_AJUSTES_ORDE.IMPRESION', 'GC_AJUSTES_ORDE.APROBACION'],
                    url: '/ajustes/auditoria-ajustes',
                },
                {
                    nombre: 'Ajustes Órdenes Compra',
                    titulo: 'Ajustes Órdenes Compra',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar',
                    visible: false,
                    tipoUsuario: TipoUsuario.AMBOS,
                    permisos: ['GC_AJUSTES_ORDE.ALTA', 'GC_AJUSTES_ORDE.BAJA', 'GC_AJUSTES_ORDE.MODIFICACION'
                        , 'GC_AJUSTES_ORDE.CONSULTA', 'GC_AJUSTES_ORDE.IMPRESION', 'GC_AJUSTES_ORDE.APROBACION'],
                    url: '/ajustes',
                }
            ]
        };
    }

    private menuAdministracion(tipoUsuario?: TipoUsuario): IMenuItem {
        return {
            nombre: 'Administración',
            visible: true,
            tipoUsuario: TipoUsuario.AMBOS,
            items: [
             //   this.menuConformidad(),
                this.menuRoles(),
                this.menuPliegos(),
               // this.menuRecepcion(),
                //this.menuSeguimientoProveedores(),
                //this.menuPuntosRecepcion(),
            ],
        };
    }

    private menuPuntosRecepcion(): IMenuItem {
        return {
            nombre: 'Puntos Recepción',
            visible: true,
            tipoUsuario: TipoUsuario.ORGANISMO,
            items: [
                {
                    nombre: 'Gestión',
                    titulo: "Gestión Puntos Recepción",
                    subtitulo: "Ingresa las opciones de búsqueda y presiona buscar para filtrar los puntos de recepción",
                    visible: true,
                    permisos: [
                        'GC_GESTION_PUNTOS.ALTA',
                        'GC_GESTION_PUNTOS.BAJA',
                        'GC_GESTION_PUNTOS.MODIFICACION',
                        'GC_GESTION_PUNTOS.CONSULTA',
                        'GC_GESTION_PUNTOS.IMPRESION',
                    ],
                    url: '/administracion/puntos-recepcion',
                    items: [
                        {
                            nombre: 'Agregar Punto Recepción',
                            titulo: "Gestión Puntos Recepción",
                            subtitulo: "Completa el formulario con los datos del nuevo punto de recepción y presiona guardar",
                            visible: false,
                            permisos: [
                                'GC_GESTION_PUNTOS.ALTA',
                            ],
                            url: '/administracion/puntos-recepcion/agregar',
                        },
                        {
                            nombre: 'Modificar Punto Recepción',
                            titulo: "Gestión Puntos Recepción",
                            subtitulo: "Modifica la información del punto de recepción y presiona guardar",
                            visible: false,
                            permisos: [
                                'GC_GESTION_PUNTOS.MODIFICACION',
                            ],
                            url: '/administracion/puntos-recepcion/modificar',
                        },
                        {
                            nombre: 'Responsables Punto',
                            titulo: "Gestión Puntos Recepción",
                            subtitulo: "Se visualizan los funcionarios asginados al punto o unidad de compra del punto en la gestión de usuarios",
                            visible: false,
                            permisos: [
                                'GC_GESTION_PUNTOS.ALTA',
                                'GC_GESTION_PUNTOS.BAJA',
                                'GC_GESTION_PUNTOS.MODIFICACION',
                                'GC_GESTION_PUNTOS.CONSULTA',
                                'GC_GESTION_PUNTOS.IMPRESION',
                            ],
                            url: '/administracion/puntos-recepcion/responsables',
                        }
                    ],
                },
                {
                    nombre: 'Ver auditoría',
                    titulo: "Auditoría Funcional Puntos Recepción",
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar para filtrar las operaciones realizadas',
                    visible: true,
                    permisos: [
                        'GC_GESTION_PUNTOS.CONSULTA'
                    ],
                    url: '/administracion/auditoria/puntos-recepcion',
                },
            ],
        };
    }

    private menuSeguimientoProveedores(): IMenuItem {
        return {
            nombre: 'Seguimiento proveedores',
            visible: true,
            tipoUsuario: TipoUsuario.AMBOS,
            items: [
                {
                    nombre: 'Gestión usuarios',
                    titulo: 'Gestión Usuarios Proveedor',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar para filtrar los usuarios',
                    visible: true,
                    tipoUsuario: TipoUsuario.AMBOS,
                    permisos: [
                        'GC_GESTION_USU_P.CONSULTA',
                        'GC_GESTION_USU_P.IMPRESION',
                    ],
                    url: '/administracion/gestion-usuarios/consulta-usuario-proveedor',
                },
                {
                    nombre: 'Configurar plazo',
                    titulo: 'Configuración Plazo Visualización Fecha Entrega Propuesta',
                    subtitulo: 'Ingresa la cantidad de días previos al vencimiento de una entrega para que se la considere próxima a vencer',
                    visible: true,
                    tipoUsuario: TipoUsuario.PROVEEDOR,
                    permisos: [],
                    url: '/administracion/plazo-proveedor/configurar-plazo',
                },
                {
                    nombre: 'Ver auditoría',
                    titulo: 'Auditoría Funcional Usuarios Proveedor',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar para filtrar las operaciones sobre los usuarios',
                    visible: true,
                    tipoUsuario: TipoUsuario.AMBOS,
                    permisos: [
                        'GC_GESTION_USU_P.CONSULTA',
                    ],
                    url: '/administracion/auditoria/usuario-proveedor',
                },
            ]
        };
    }

    private menuRecepcion(): IMenuItem {
        return {
            nombre: 'Recepción',
            visible: true,
            tipoUsuario: TipoUsuario.ORGANISMO,
            items: [
                {
                    nombre: 'Gestión usuarios',
                    titulo: 'Gestión Usuarios Recepción',
                    subtitulo: 'Asigna o elimina el permiso de recepción de entregas, a nivel de unidades de compra o puntos de recepción',
                    visible: true,
                    permisos: [
                        'GC_GESTION_USU.ALTA',
                        'GC_GESTION_USU.BAJA',
                        'GC_GESTION_USU.MODIFICACION',
                        'GC_GESTION_USU.CONSULTA',
                        'GC_GESTION_USU.IMPRESION',
                    ],
                    url: '/administracion/gestion-usuarios/consulta-usuario-recepcion',
                },
                {
                    nombre: 'Ver auditoría',
                    titulo: 'Auditoría Funcional Usuarios Recepción',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar para filtrar las operaciones sobre los usuarios',
                    visible: true,
                    permisos: [
                        'GC_GESTION_USU.CONSULTA'
                    ],
                    url: '/administracion/auditoria/recepcion',
                },
            ]
        };
    }

    private menuConformidad(): IMenuItem {
        return {
            nombre: 'Conformidad',
            visible: true,
            tipoUsuario: TipoUsuario.ORGANISMO,
            items: [
                {
                    nombre: 'Gestión usuarios',
                    titulo: 'Gestión Usuarios Conformidad',
                    subtitulo: 'Asigna o elimina el permiso de dar conformidad a las entregas, a nivel de unidades de compra, compra o ítem',
                    visible: true,
                    permisos: [
                        'GC_GESTION_USU.ALTA',
                        'GC_GESTION_USU.BAJA',
                        'GC_GESTION_USU.MODIFICACION',
                        'GC_GESTION_USU.CONSULTA',
                    ],
                    url: '/administracion/gestion-usuarios/consulta-usuario-conformidad',
                },
                {
                    nombre: 'Ver auditoría',
                    titulo: 'Auditoría Funcional Usuarios Conformidad',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar para filtrar las operaciones sobre los usuarios',
                    visible: true,
                    permisos: [
                        'GC_GESTION_USU.CONSULTA'
                    ],
                    url: '/administracion/auditoria/conformidad',
                },
            ]
        };
    }

    private menuRoles(): IMenuItem {
        return {
            nombre: 'Gestión de roles',
            titulo: 'Gestión Usuarios Roles',
            subtitulo: 'Asigna o elimina roles a los usuarios, a nivel de unidades de compra, compra o tipo de compra',
            visible: true,
            permisos: [
                'GC_GESTION_USU.ALTA',
                'GC_GESTION_USU.BAJA',
                'GC_GESTION_USU.MODIFICACION',
                'GC_GESTION_USU.CONSULTA',
            ],
            url: '/administracion/gestion-usuarios/consulta-usuario-roles',
        };
    }

     private menuPliegos(): IMenuItem {
         return {
            nombre: 'Pliegos',
            visible: true,
            tipoUsuario: TipoUsuario.ORGANISMO,
            items: [
                {
                    nombre: 'Campos y reglas',
                    titulo: 'Administración de campos y sus reglas',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar para filtrar los campos',
                    visible: true,
                    tipoUsuario: TipoUsuario.ORGANISMO,
                    permisos: [
                        'GC_GESTION_USU.ALTA',
                        'GC_GESTION_USU.BAJA',
                        'GC_GESTION_USU.MODIFICACION',
                        'GC_GESTION_USU.CONSULTA',
                    ],
                    url: '/administracion/campos-reglas',
                },
                {
                    nombre: 'Capítulos',
                    titulo: 'Administración de las capítulos',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar para filtrar los capítulos',
                    visible: true,
                    permisos: [
                        'GC_GESTION_USU.CONSULTA'
                    ],
                    url: '/administracion/auditoria/conformidad',
                },
                {
                    nombre: 'Cláusulas',
                    titulo: 'Administración de las cláusulas',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar para filtrar las cláusulas',
                    visible: true,
                    permisos: [
                        'GC_GESTION_USU.CONSULTA'
                    ],
                    url: '/administracion/auditoria/conformidad',
                },
                {
                    nombre: 'Modelos',
                    titulo: 'Administración de las modelos',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar para filtrar los modelos',
                    visible: true,
                    permisos: [
                        'GC_GESTION_USU.CONSULTA'
                    ],
                    url: '/administracion/auditoria/conformidad',
                },
                {
                    nombre: 'Repositorio archivos',
                    titulo: 'Administración del repositorio de archivos',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar para filtrar los archivos',
                    visible: true,
                    permisos: [
                        'GC_GESTION_USU.ALTA',
                        'GC_GESTION_USU.BAJA',
                        'GC_GESTION_USU.MODIFICACION',
                        'GC_GESTION_USU.CONSULTA',
                    ],
                    url: '/pliegos/repositorio-archivos',
                },
                {
                    nombre: 'Secciones',
                    titulo: 'Administración de las secciones',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar para filtrar las secciones',
                    visible: true,
                    permisos: [
                        'GC_GESTION_USU.CONSULTA'
                    ],
                    url: '/administracion/auditoria/conformidad',
                },
                
            ]
        };
    }

    public tienePermisoUrl(url: string, tipoUsuario?: TipoUsuario): boolean {
        const permisos: string[] = this.seguridad.obtenerPermisos();
        if (permisos.length === 0) {
            return false;
        }
        const item = this.obtenerItemMasAbajo(url, tipoUsuario);
        if (item) {
            return (tipoUsuario === TipoUsuario.PROVEEDOR &&
                (item.tipoUsuario === TipoUsuario.PROVEEDOR || item.tipoUsuario === TipoUsuario.AMBOS))
                || item.permisos === undefined || item.permisos.length === 0 || item.permisos.some(permiso => permisos.includes(permiso));
        } else {
            return false;
        }
    }

    public tienePermisoItemsPorUrl(items: IMenuItem[], url: string): boolean {
        const itemsAccesibles: any = items.filter(
            (menu) =>
                menu.items?.filter((item: any) => {
                    if (item.url) {
                        return url.startsWith(item.url);
                    } else {
                        return this.tienePermisoItemsPorUrl(item.items ?? [], url);
                    }
                }).length !== 0
        );
        return itemsAccesibles.length !== 0;
    }
    hayMasEspecifica(url: string): boolean {
        this.obtenerItemMasAbajo(url);
        return this.obtenerItemMasAbajo(url)?.url !== url;
    }

    public obtenerItem(): any {
        const cleanUrl = this.router.url.split('?')[0];
        const paths: string[] = cleanUrl.split('/');

        let url = '';
        if (paths.length >= 2) {
            url = '/' + paths[1];
        }
        if (paths.length >= 3) {
            url += '/' + paths[2];
        }
        const items: any = this.obtenerMenuItems().filter(
            (menu) =>
                menu.url === url ||
                menu.items?.some((item) => item.url === url) ||
                this.urlEnNietos(menu, url)
        );

        return items.length !== 0 ? items[0] : null;

    }
    public obtenerItemMasAbajo(url: string, tipoUsuario?: TipoUsuario): IMenuItem | undefined {
        const items = this.obtenerMenu([], tipoUsuario, true);
        for (const item of items) {
            item.padre = undefined;
            const subItem = this.obtenerItemMasAbajoRecursivo(item, url);
            if (subItem) {
                return subItem;
            }
        }
        return undefined;
    }
    private obtenerItemMasAbajoRecursivo(item: IMenuItem, url: string): IMenuItem | undefined {
        if (item.url === url || url.startsWith(item.url + "?")) {
            return item;
        } else if (item.items && item.items.length > 0) {
            for (const subItem of item.items) {
                subItem.padre = item;
                const result = this.obtenerItemMasAbajoRecursivo(subItem, url);
                if (result) {
                    return result;
                }
            }
        } else if (item.url && url.startsWith(item.url)) {
            return item;
        }
        return undefined;
    }

    public obtenerSubItem(): any {
        const item: any = this.obtenerItem();
        let subItems: any[] = [];
        if (item != null) {
            const paths: string[] = this.router.url.split('/');

            let url: string = '/' + paths[1];
            if (paths.length === 4 && isNaN(parseFloat(paths[3]))) {
                url = '/' + paths[1] + '/' + paths[2] + '/' + paths[3];
            }
            subItems = item.items.filter((subItem: any) => url.startsWith(subItem.url));
        }
        let item2: any = subItems.length !== 0 ? subItems[0] : null;

        if (item2 != null && this.obtenerSubItem2() == null) {
            item2.url = '';
        }
        return item2;
    }

    public obtenerSubItem2(): any {
        const segments = this.getPathSegments();
        if (segments.includes('agregar')) {
            return { nombre: 'Agregar', url: null };
        }
        if (segments.includes('modificar')) {
            return { nombre: 'Modificar', url: null };
        }
        if (segments.includes('responsables')) {
            return { nombre: 'Responsables', url: null };
        }
        if (segments.includes('consulta-usuario-proveedor')) {
            return { nombre: 'Proveedor', url: null };
        }
        return null;
    }

    private obtenerSubItem2PorUrl(url: string): SubItem | null {
        const item = this.obtenerItem();
        const currentUrl = this.router.url;
        const paths = currentUrl.split('/');

        // 2. La condición del 'if' vacío se convierte en una "cláusula de guarda".
        //    Si se cumple, salimos de la función inmediatamente, lo cual es más claro.
        if (item != null && (url === currentUrl || paths.length > 4)) {
            return null;
        }

        // 3. Definimos una "tabla de reglas". Cada regla tiene una condición y un resultado.
        //    Esto reemplaza por completo la cadena 'if-else if'.
        const rules: { condition: () => boolean; result: SubItem }[] = [
            {
                condition: () => item != null && `${url}/agregar` === currentUrl,
                result: { nombre: 'Agregar', url: null }
            },
            {
                // Agrupamos las 3 condiciones 'endsWith' en una sola usando un array.
                condition: () => [
                    '/listar-procedimiento-compra',
                    '/listar-procedimiento-compra-ver',
                    '/listar-procedimiento-compra-ver-publicado'
                ].some(suffix => currentUrl.endsWith(suffix)),
                result: { nombre: 'Listado Procedimientos de Compra', url: null }
            },
            {
                condition: () => paths.length === 4 && paths[1] === 'ajuste-plan' && isNaN(Number(paths[2])),
                result: { nombre: 'Listado Ajustes de Procedimientos de Compra', url: null }
            },
            {
                condition: () => item != null && paths.length === 3 && !isNaN(Number(paths[2])),
                result: { nombre: 'Editar', url: null }
            },
            {
                condition: () => currentUrl.startsWith('/puntos-recepcion/responsables'),
                result: { nombre: 'Responsables', url: null }
            },
            {
                condition: () => item != null && `${url}/modificar` === currentUrl,
                result: { nombre: 'Modificar', url: null }
            }
        ];

        // 4. Buscamos la primera regla que cumpla su condición.
        const matchingRule = rules.find(rule => rule.condition());

        // 5. Retornamos el resultado de la regla encontrada, o null si ninguna coincidió.
        return matchingRule ? matchingRule.result : null;
    }

    private getPathSegments(): string[] {
        return this.router.url.split('?')[0].split('/');
    }

    private urlEnNietos(menu: IMenuItem, url: string): boolean {
        return menu.items?.some(
            (hijo) =>
                hijo.items?.some((nieto) => nieto.url === url) ?? false
        ) ?? false;
    }
    filtrarPorTipoUsuario(items: IMenuItem[], tipoUsuario?: TipoUsuario): IMenuItem[] {

        let itemsFiltrados = items.filter((item) => tipoUsuario &&
            (!item.tipoUsuario || item.tipoUsuario === tipoUsuario || item.tipoUsuario === TipoUsuario.AMBOS));

        return itemsFiltrados.map((item) => {
            if (item.items && item.items.length > 0) {
                item.items = this.filtrarPorTipoUsuario(item.items, tipoUsuario);
            }
            return item;
        });
    }
}

