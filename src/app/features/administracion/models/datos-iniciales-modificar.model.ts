

export interface DatosInicialesModificarDTO {
    idUsuario: string;
    nombre: string;
    correo: string;
    proveedor: string;
    tipoDocumentoProveedor: string;
    nroDocumentoProveedor: string;
    paisDocumentoProveedor: string;
    fechaNombreConfirmado?: Date;
    pais: string;
    tipoDoc: string;
    nroDoc: string;
}