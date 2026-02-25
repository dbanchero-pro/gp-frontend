import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

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

    public obtenerMenu(permisos: string[], ignorarPermisos: boolean = false): IMenuItem[] {
        const items: IMenuItem[] = this.obtenerMenuItems();
        return this.filtrarMenu(items, permisos, ignorarPermisos);
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

    private obtenerMenuItems(): IMenuItem[] {
        return this.filtrarItemsMenu([
            this.menuBandejaEntrada(),
            this.menuAdministracion(),
          //  this.menuEntregas(tipoUsuario),
        ]);
    }


    private menuAdministracion(): IMenuItem {
        return {
            nombre: 'Administración',
            visible: true,
            items: [
                this.menuPliegos(),
                this.menuRoles(),
            ],
        };
    }

    private menuPuntosRecepcion(): IMenuItem {
        return {
            nombre: 'Puntos Recepción',
            visible: true,
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

    private menuRoles(): IMenuItem {
        return {
            nombre: 'Usuarios y roles',
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

     private menuBandejaEntrada(): IMenuItem {
        
        return {
            nombre: 'Pliegos',
            visible: true,
            items: [
                {
                    nombre: 'Bandeja de entrada',
                    titulo: 'Bandeja de entrada',
                    subtitulo: 'Visualización de los procesos de elaboración de pliegos',
                    visible: true,
                    permisos: [
                        'GC_GESTION_USU.CONSULTA'
                    ],
                    url: '/pliegos/bandeja-entrada'
                },
                {
                    nombre: 'Asignar usuarios',
                    titulo: 'Asignar usuarios',
                    subtitulo: 'Seleccion agregar usuario o modificar para asignar roles a los usuarios',
                    visible: false,
                    permisos: [
                        'GC_GESTION_USU.CONSULTA'
                    ],
                    url: '/pliegos/bandeja-entrada/asignar-usuarios'
                },
                {
                    nombre: 'Iniciar pliego',
                    titulo: 'Iniciar pliego',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar modelos o pliegos para seleccionar un modelo o pliego',
                    visible: false,
                    permisos: [
                        'GC_GESTION_USU.CONSULTA'
                    ],
                    url: '/pliegos/bandeja-entrada/iniciar-pliego'
                }
             ]
        };
    }

     private menuPliegos(): IMenuItem {
         return {
            nombre: 'Pliegos',
            visible: true,
            items: [
                 {
                    nombre: 'Campos y reglas',
                    titulo: 'Administración de campos y sus reglas',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar para filtrar los campos',
                    visible: true,
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
                    url: '/administracion/capitulos',
                },
                {
                    nombre: 'Cláusulas',
                    titulo: 'Administración de las cláusulas',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar para filtrar las cláusulas',
                    visible: true,
                    permisos: [
                        'GC_GESTION_USU.CONSULTA'
                    ],
                    url: '/pliegos/clausulas',
                },
                {
                    nombre: 'Modelos',
                    titulo: 'Administración de los modelos',
                    subtitulo: 'Ingresa las opciones de búsqueda y presiona buscar para filtrar los modelos',
                    visible: true,
                    permisos: [
                        'GC_GESTION_USU.CONSULTA'
                    ],
                    url: '/pliegos/modelos',
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
                    url: '/pliegos/secciones',
                },
                
            ]
        };
    }

    public tienePermisoUrl(url: string): boolean {
        const permisos: string[] = this.seguridad.obtenerPermisos();
        if (permisos.length === 0) {
            return false;
        }
        const item = this.obtenerItemMasAbajo(url);
        if (item) {
            return item.permisos === undefined || item.permisos.length === 0 || item.permisos.some(permiso => permisos.includes(permiso));
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
    public obtenerItemMasAbajo(url: string): IMenuItem | undefined {
        const items = this.obtenerMenu([], true);
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
    filtrarItemsMenu(items: IMenuItem[]): IMenuItem[] {

        let itemsFiltrados = items;

        return itemsFiltrados.map((item) => {
            if (item.items && item.items.length > 0) {
                item.items = this.filtrarItemsMenu(item.items);
            }
            return item;
        });
    }
}

