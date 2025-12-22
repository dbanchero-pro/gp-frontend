export interface IColorDTO {
    id?: number;
    descColor?: string;
}

export class ClassColorDTO implements IColorDTO {
    constructor(public id?: number, public descColor?: string) {
    }
}
