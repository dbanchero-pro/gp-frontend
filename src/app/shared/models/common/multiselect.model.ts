export interface IMultiSelect {
    id: number | string;
    nombre: string;
}

export class MultiSelect implements IMultiSelect {
    constructor(public id: number | string, public nombre: string) {}
}
