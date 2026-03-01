export function ordenarYPaginar<T extends Record<string, any>>(
    items: T[],
    pagina: number,
    tamanoPagina: number,
    columnaOrden: keyof T,
    ordem: 'asc' | 'desc',
): T[] {
    const sorted = [...items].sort((a, b) => {
        const aVal = a[columnaOrden];
        const bVal = b[columnaOrden];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return ordem === 'asc' ? -1 : 1;
        if (bVal == null) return ordem === 'asc' ? 1 : -1;

        if (aVal < bVal) return ordem === 'asc' ? -1 : 1;
        if (aVal > bVal) return ordem === 'asc' ? 1 : -1;
        return 0;
    });

    const comienzo = pagina * tamanoPagina;
    const fin = comienzo + Number(tamanoPagina);
    return sorted?.slice(comienzo, fin);
}

export function ordenarMultipleYPaginar<T extends Record<string, any>>(
    items: T[],
    pagina: number,
    tamanoPagina: number,
    columnasOrden: (keyof T)[],
    orden: 'asc' | 'desc',
): T[] {
    const sorted = [...items].sort((a, b) => {
        for (const columnaOrden of columnasOrden) {
            let ret = compararColumna(columnaOrden, orden, a, b);
            if (ret == 0) continue;
            else if (ret != undefined) return ret;
        }
        return 0;
    });
    tamanoPagina = parseInt(tamanoPagina.toString());
    const comienzo = pagina * parseInt(tamanoPagina.toString());
    const fin = comienzo + parseInt(tamanoPagina.toString());

    return sorted.slice(comienzo, fin);
}

function compararColumna<T extends Record<string, any>>(
    columnaOrden: keyof T,
    orden: 'asc' | 'desc',
    a: T,
    b: T,
): number | undefined {
    const aVal: any = a[columnaOrden];
    const bVal: any = b[columnaOrden];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return orden === 'asc' ? -1 : 1;
    if (bVal == null) return orden === 'asc' ? 1 : -1;

    return compararValores(orden, aVal, bVal);
}

function compararValores(
    orden: 'asc' | 'desc',
    aVal: any,
    bVal: any,
): number | undefined {
    const aComparable = aVal instanceof Date ? aVal.getTime() : aVal;
    const bComparable = bVal instanceof Date ? bVal.getTime() : bVal;

    if (aComparable < bComparable) return orden === 'asc' ? -1 : 1;
    if (aComparable > bComparable) return orden === 'asc' ? 1 : -1;
    return undefined;
}
