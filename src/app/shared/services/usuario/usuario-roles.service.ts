import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TipoPerfil } from '../../enum/tipo-perfil.enum';
import { PageModel } from '../../models/common/page/page.model';
import { UsuarioOrganismoPerfilDTO } from '../../models/usuario/usuario-organismo-perfil.model';

@Injectable({
    providedIn: 'root'
})
export class UsuarioRolesService {
    private readonly mockUsuarios: UsuarioOrganismoPerfilDTO[] = [
        {
            id: 1,
            idUsuario: '12345678',
            nombre: 'Juan Pérez',
            perfil: TipoPerfil.Conformidad,
            nroDocumento: '12345678',
            correo: 'juan.perez@example.com',
            unidadCompra: {
                idInciso: 1,
                idUnidadEjecutora: 1,
                idUnidadCompra: 1,
                descInciso: 'Inciso 01 - Presidencia',
                descUnidadEjecutora: 'UE 001 - Dirección General',
                descUnidadCompra: 'UC 001 - Compras Generales'
            },
            compra: {
                idCompra: 1,
                numCompra: 123,
                anioCompra: 2024,
                subtipoCompra: {
                    idTipoCompra: 'LC',
                    idSubtipoCompra: 'LP',
                    descTipoCompra: 'Licitación Abreviada',
                    descSubtipoCompra: 'Por precio'
                }
            },
            itemCompra: undefined
        },
        {
            id: 2,
            idUsuario: '87654321',
            nombre: 'María González',
            perfil: TipoPerfil.Conformidad,
            nroDocumento: '87654321',
            correo: 'maria.gonzalez@example.com',
            unidadCompra: {
                idInciso: 2,
                idUnidadEjecutora: 2,
                idUnidadCompra: 2,
                descInciso: 'Inciso 02 - Ministerio de Economía',
                descUnidadEjecutora: 'UE 002 - Secretaría Administrativa',
                descUnidadCompra: 'UC 002 - Logística'
            },
            compra: {
                idCompra: 2,
                numCompra: 456,
                anioCompra: 2024,
                subtipoCompra: {
                    idTipoCompra: 'CD',
                    idSubtipoCompra: 'CM',
                    descTipoCompra: 'Compra Directa',
                    descSubtipoCompra: 'Por monto'
                }
            },
            itemCompra: {
                idCompra: 2,
                idItem: 1,
                nroItem: 1,
                codArticulo: 1001,
                descArticulo: 'Papel A4 75gr'
            }
        },
        {
            id: 3,
            idUsuario: '11223344',
            nombre: 'Carlos Rodríguez',
            perfil: TipoPerfil.Conformidad,
            nroDocumento: '11223344',
            correo: 'carlos.rodriguez@example.com',
            unidadCompra: undefined,
            compra: undefined,
            itemCompra: undefined
        }
    ];

    constructor() { }

    obtenerTodos(
        filtros: {
            permisoTodas?: boolean;
            nroDocumento?: string;
            idInciso?: number;
            idUnidadEjecutora?: number;
            idUnidadCompra?: number;
            idTipoCompra?: string;
            nroCompra?: number;
            anioCompra?: number;
            nroItem?: number;
            descArticulo?: string;
            nomEntregable?: string;
            codEntregable?: string;
        } = {},
        page: number = 0,
        size: number = 10,
        sort: string = 'usuarioOrganismo.usuario.nroDocumento,asc'
    ): Observable<PageModel<UsuarioOrganismoPerfilDTO>> {
        let resultados = [...this.mockUsuarios];

        if (filtros.nroDocumento) {
            resultados = resultados.filter(u => u.idUsuario?.includes(filtros.nroDocumento!));
        }

        if (filtros.idInciso) {
            resultados = resultados.filter(u => u.unidadCompra?.idInciso === filtros.idInciso);
        }

        if (filtros.permisoTodas) {
            resultados = resultados.filter(u => !u.unidadCompra);
        }

        const start = page * size;
        const end = start + size;
        const paginados = resultados.slice(start, end);
        const totalPages = Math.ceil(resultados.length / size);

        return of({
            content: paginados,
            page: {},
            totalPages: totalPages,
            totalElements: resultados.length,
            last: page >= totalPages - 1,
            size: size,
            number: page,
            numberOfElements: paginados.length,
            first: page === 0,
            sort: {
                sorted: false,
                unsorted: true,
                empty: true
            },
            empty: paginados.length === 0
        });
    }

    agregarRolUC(
        idInciso: number,
        idUnidadEjecutora: number,
        idUnidadCompra: number,
        idUsuario: string
    ): Observable<boolean> {
        console.log('Mock: agregarRolUC', { idInciso, idUnidadEjecutora, idUnidadCompra, idUsuario });
        return of(true);
    }

    agregarRolTodasUc(idUsuario: string): Observable<boolean> {
        console.log('Mock: agregarRolTodasUc', { idUsuario });
        return of(true);
    }

    agregarRolPorCompra(idCompra: number, idUsuario: string): Observable<boolean> {
        console.log('Mock: agregarRolPorCompra', { idCompra, idUsuario });
        return of(true);
    }

    agregarRolPorItem(idCompra: number, idItem: number, idUsuario: string): Observable<boolean> {
        console.log('Mock: agregarRolPorItem', { idCompra, idItem, idUsuario });
        return of(true);
    }

    eliminarRol(id: number): Observable<boolean> {
        console.log('Mock: eliminarRol', { id });
        return of(true);
    }

    exportarUsuariosRol(filtro: any): void {
        console.log('Mock: exportarUsuariosRol', filtro);
        alert('Funcionalidad de exportación mock - Los datos se exportarían aquí');
    }
}
