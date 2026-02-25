

export interface IMenuItem {
    nombre: string;
    titulo?: string;
    subtitulo?: string;
    permisos?: string[];
    url?: string;
    items?: IMenuItem[];
    visible?: boolean;
    _open?: boolean;
    padre?: IMenuItem;
}

export class MenuItem implements IMenuItem {
    constructor(
        public nombre: string,
        public titulo?: string,
        public subtitulo?: string,
        public permisos?: string[],
        public url?: string,
        public items?: IMenuItem[],
        public visible?: boolean,
        public padre?: IMenuItem,
    ) {
    }
}
