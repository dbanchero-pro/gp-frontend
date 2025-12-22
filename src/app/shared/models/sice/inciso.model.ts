export interface IIncisoDTO {
    idInciso?: number;
    descInciso?: string;
    habilitado?: boolean;
}

export class IncisoDTO implements IIncisoDTO {
    constructor(public id?: number, public descInciso?: string, public habilitado: boolean = true) {
    }
}
