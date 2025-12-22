export enum TipoAjuste {
    OC_CAMBIAR_FECHA = 'OC_CAMBIAR_FECHA',
    OC_CAMBIAR_PR = 'OC_CAMBIAR_PR',
    OC_ANULAR = 'OC_ANULAR',
    ITEM_CAMBIAR_FECHA = 'ITEM_CAMBIAR_FECHA',
    ITEM_CAMBIAR_CANTIDAD = 'ITEM_CAMBIAR_CANTIDAD',
    ITEM_ANULAR = 'ITEM_ANULAR',
    ITEM_CAMBIAR_FECHA_O_CANTIDAD = 'ITEM_CAMBIAR_FECHA_O_CANTIDAD'
}

export interface TipoAjusteInfo {
    tipo: TipoAjuste;
    nombre: string;
    esParaOC: boolean;
    esParaItem: boolean;
}

export const TIPOS_AJUSTE: TipoAjusteInfo[] = [
    {
        tipo: TipoAjuste.OC_CAMBIAR_FECHA,
        nombre: 'Ajuste OC - Fecha',
        esParaOC: true,
        esParaItem: false
    },
    {
        tipo: TipoAjuste.OC_CAMBIAR_PR,
        nombre: 'Ajuste OC - Punto',
        esParaOC: true,
        esParaItem: false
    },
    {
        tipo: TipoAjuste.OC_ANULAR,
        nombre: 'Anular OC',
        esParaOC: true,
        esParaItem: false
    },
    {
        tipo: TipoAjuste.ITEM_ANULAR,
        nombre: 'Anular Ítem',
        esParaOC: false,
        esParaItem: true
    },
    {
        tipo: TipoAjuste.ITEM_CAMBIAR_CANTIDAD,
        nombre: 'Ajuste Ítem - Cantidad',
        esParaOC: false,
        esParaItem: true
    },
    {
        tipo: TipoAjuste.ITEM_CAMBIAR_FECHA,
        nombre: 'Ajuste Ítem - Fecha',
        esParaOC: false,
        esParaItem: true
    },
    {
        tipo: TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD,
        nombre: 'Ajuste Ítem - Fecha y Cantidad',
        esParaOC: false,
        esParaItem: true
    }
];

export function obtenerTiposParaOC(): TipoAjusteInfo[] {
    return [
        {
            tipo: TipoAjuste.OC_CAMBIAR_FECHA,
            nombre: 'Ajuste OC - Fecha',
            esParaOC: true,
            esParaItem: false
        },
        {
            tipo: TipoAjuste.OC_CAMBIAR_PR,
            nombre: 'Ajuste OC - Punto',
            esParaOC: true,
            esParaItem: false
        },
        {
            tipo: TipoAjuste.OC_ANULAR,
            nombre: 'Anular OC',
            esParaOC: true,
            esParaItem: false
        }
    ];
}

export function obtenerTiposParaItem(): TipoAjusteInfo[] {
    return [
        {
            tipo: TipoAjuste.ITEM_ANULAR,
            nombre: 'Anular Ítem',
            esParaOC: false,
            esParaItem: true
        },
        {
            tipo: TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD,
            nombre: 'Ajuste Ítem - Fecha y Cantidad',
            esParaOC: false,
            esParaItem: true
        },
        {
            tipo: TipoAjuste.ITEM_CAMBIAR_CANTIDAD,
            nombre: 'Ajuste Ítem - Cantidad',
            esParaOC: false,
            esParaItem: true
        },
        {
            tipo: TipoAjuste.ITEM_CAMBIAR_FECHA,
            nombre: 'Ajuste Ítem - Fecha',
            esParaOC: false,
            esParaItem: true
        }
    ];
}

export function obtenerNombreTipo(tipo: TipoAjuste): string {
    const info = TIPOS_AJUSTE.find(t => t.tipo === tipo);
    return info?.nombre ?? '';
}

export function esTipoDeOC(tipo: TipoAjuste): boolean {
    const info = TIPOS_AJUSTE.find(t => t.tipo === tipo);
    return info?.esParaOC || false;
}

export function esTipoDeItem(tipo: TipoAjuste): boolean {
    const info = TIPOS_AJUSTE.find(t => t.tipo === tipo);
    return info?.esParaItem || false;
}