export interface AccionBoton {
    url?: any[];
    nombre: string;
    clase: string;
    claseEtiqueta?: string;
    icono: string;
    ariaLabel?: string;
    accion?: () => void;
    etiquetas?: string[];
    permisos?: string[];
    acciones?: AccionBoton[];
}
