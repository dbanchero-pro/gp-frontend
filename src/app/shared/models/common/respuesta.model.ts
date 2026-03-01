export interface IRespuestaDTO {
    mensaje?: string;
}

export class RespuestaDTO implements IRespuestaDTO {
    constructor(public mensaje?: string) {}
}
