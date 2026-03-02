import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SiNoValor } from 'src/app/shared/enum/si-no-valor.enum';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { CampoDTO } from 'src/app/shared/models/pliego/comun/campo.model';
import { TipoDatoCampo } from '../enums/tipo-dato-campo.enum';
import { TipoFuenteCampo } from '../enums/tipo-fuente-campo.enum';
import { FiltroCampoDTO } from '../models/filtros/filtro-campo.model';

@Injectable({
    providedIn: 'root',
})
export class CampoService {
    private campos: CampoDTO[] = [];
    private nextId = 1;

    constructor() {
        this.inicializarDatosMock();
    }

    private inicializarDatosMock(): void {
        const camposMock: CampoDTO[] = [
            {
                id: this.nextId++,
                etiqueta: 'ORGANISMO',
                descripcion:
                    'Corresponde a la descripción del inciso y descripción de la unidad ejecutora, tomados de las codigueras, correspondientes al ID de inciso e ID de unidad ejecutora de la compra proveniente de SICE.',
                fuente: TipoFuenteCampo.SICE_NO_EDITABLE,
                tipoDato: TipoDatoCampo.TEXTO,
                sePuedeEliminar: SiNoValor.NO,
                alcance: 'Global',
                reglas: [
                    {
                        id: 1,
                        codigo: 'REG001',
                        nombre: 'Organismo requerido',
                        tipoRegla: 'VALOR' as any,
                        operador: 'DISTINTO' as any,
                        valor: '',
                        mensajeError: 'El campo Organismo es obligatorio',
                    },
                ],
                fechaCreacion: new Date('2024-01-01'),
                fechaModificacion: new Date('2024-01-01'),
                activo: true,
            },
            {
                id: this.nextId++,
                etiqueta: 'TIPO_DE_COMPRA',
                descripcion:
                    'Corresponde a la descripción del tipo de compra, tomado de la codiguera correspondiente al ID de compra proveniente de SICE.',
                fuente: TipoFuenteCampo.SICE_NO_EDITABLE,
                tipoDato: TipoDatoCampo.TEXTO,
                sePuedeEliminar: SiNoValor.NO,
                alcance: 'Global',
                reglas: [],
                fechaCreacion: new Date('2024-01-01'),
                fechaModificacion: new Date('2024-01-01'),
                activo: true,
            },
            {
                id: this.nextId++,
                etiqueta: 'SUB_TIPO_DE_COMPRA',
                descripcion:
                    'Corresponde a la descripción del sub-tipo de compra, tomado de la codiguera correspondiente al ID de sub-tipo de compra proveniente de SICE.',
                fuente: TipoFuenteCampo.SICE_NO_EDITABLE,
                tipoDato: TipoDatoCampo.TEXTO,
                sePuedeEliminar: SiNoValor.NO,
                alcance: 'Global',
                reglas: [],
                fechaCreacion: new Date('2024-01-01'),
                fechaModificacion: new Date('2024-01-01'),
                activo: true,
            },
            {
                id: this.nextId++,
                etiqueta: 'NUMERO_DE_COMPRA',
                descripcion:
                    'Es el número del procedimiento de la compra proveniente de SICE',
                fuente: TipoFuenteCampo.SICE_NO_EDITABLE,
                tipoDato: TipoDatoCampo.NUMERO,
                sePuedeEliminar: SiNoValor.NO,
                alcance: 'Global',
                reglas: [],
                fechaCreacion: new Date('2024-01-01'),
                fechaModificacion: new Date('2024-01-01'),
                activo: true,
            },
            {
                id: this.nextId++,
                etiqueta: 'ANO_DE_COMPRA',
                descripcion:
                    'Corresponde al año del procedimiento de la compra proveniente de SICE',
                fuente: TipoFuenteCampo.SICE_NO_EDITABLE,
                tipoDato: TipoDatoCampo.NUMERO,
                sePuedeEliminar: SiNoValor.NO,
                alcance: 'Global',
                reglas: [],
                fechaCreacion: new Date('2024-01-01'),
                fechaModificacion: new Date('2024-01-01'),
                activo: true,
            },
            {
                id: this.nextId++,
                etiqueta: 'ITEM_DE_COMPRA',
                descripcion:
                    'Corresponde a la lista de ítems de la compra en formato: descripción artículo + (código artículo)',
                fuente: TipoFuenteCampo.SICE_NO_EDITABLE,
                tipoDato: TipoDatoCampo.TEXTO,
                sePuedeEliminar: SiNoValor.NO,
                alcance: 'Global',
                reglas: [],
                fechaCreacion: new Date('2024-01-01'),
                fechaModificacion: new Date('2024-01-01'),
                activo: true,
            },
            {
                id: this.nextId++,
                etiqueta: 'PRESUPUESTO',
                descripcion:
                    'Número que indica el presupuesto asignado a la contratación',
                fuente: TipoFuenteCampo.SICE_EDITABLE,
                tipoDato: TipoDatoCampo.NUMERO,
                sePuedeEliminar: SiNoValor.NO,
                alcance: 'Global',
                reglas: [
                    {
                        id: 2,
                        codigo: 'REG002',
                        nombre: 'Presupuesto mínimo',
                        tipoRegla: 'VALOR' as any,
                        operador: 'MAYOR' as any,
                        valor: '0',
                        mensajeError: 'El presupuesto debe ser mayor a 0',
                    },
                    {
                        id: 3,
                        codigo: 'REG003',
                        nombre: 'Presupuesto máximo',
                        tipoRegla: 'VALOR' as any,
                        operador: 'MENOR_IGUAL' as any,
                        valor: '10000000',
                        mensajeError:
                            'El presupuesto no puede superar los 10.000.000',
                    },
                ],
                fechaCreacion: new Date('2024-01-01'),
                fechaModificacion: new Date('2024-01-01'),
                activo: true,
            },
            {
                id: this.nextId++,
                etiqueta: 'CORREO_ELECTRONICO_DE_COMUNICACIONES',
                descripcion:
                    'Corresponde al correo de comunicaciones, asociado a la Unidad de compra, obtenido de la codiguera de Comunicaciones para Unidades de Compra en SICE.',
                fuente: TipoFuenteCampo.SICE_EDITABLE,
                tipoDato: TipoDatoCampo.CORREO_ELECTRONICO,
                sePuedeEliminar: SiNoValor.NO,
                alcance: 'Global',
                reglas: [
                    {
                        id: 4,
                        codigo: 'REG004',
                        nombre: 'Email requerido',
                        tipoRegla: 'VALOR' as any,
                        operador: 'DISTINTO' as any,
                        valor: '',
                        mensajeError: 'Debe ingresar un correo electrónico',
                    },
                ],
                fechaCreacion: new Date('2024-01-01'),
                fechaModificacion: new Date('2024-01-01'),
                activo: true,
            },
            {
                id: this.nextId++,
                etiqueta: 'OBJETO_COMPRA',
                descripcion: 'Campo predefinido para el objeto de la compra',
                fuente: TipoFuenteCampo.USUARIO,
                tipoDato: TipoDatoCampo.TEXTO,
                sePuedeEliminar: SiNoValor.NO,
                alcance: 'Global',
                reglas: [],
                fechaCreacion: new Date('2024-01-01'),
                fechaModificacion: new Date('2024-01-01'),
                activo: true,
            },
            {
                id: this.nextId++,
                etiqueta: 'FECHA_INICIO',
                descripcion: 'Fecha de inicio del contrato',
                fuente: TipoFuenteCampo.USUARIO,
                tipoDato: TipoDatoCampo.FECHA,
                sePuedeEliminar: SiNoValor.SI,
                alcance: 'Global',
                reglas: [],
                fechaCreacion: new Date('2024-01-01'),
                fechaModificacion: new Date('2024-01-01'),
                activo: true,
            },
            {
                id: this.nextId++,
                etiqueta: 'FECHA_FIN',
                descripcion: 'Fecha de finalización del contrato',
                fuente: TipoFuenteCampo.USUARIO,
                tipoDato: TipoDatoCampo.FECHA,
                sePuedeEliminar: SiNoValor.SI,
                alcance: 'Global',
                reglas: [
                    {
                        id: 5,
                        codigo: 'REG005',
                        nombre: 'Fecha fin posterior',
                        tipoRegla: 'CAMPO' as any,
                        operador: 'MAYOR' as any,
                        idCampoComparar: 10,
                        etiquetaCampoComparar: 'FECHA_INICIO',
                        mensajeError:
                            'La fecha de fin debe ser posterior a la fecha de inicio',
                    },
                ],
                fechaCreacion: new Date('2024-01-01'),
                fechaModificacion: new Date('2024-01-01'),
                activo: true,
            },
            {
                id: this.nextId++,
                etiqueta: 'PLAZO_DE_ENTREGA',
                descripcion: 'Cantidad de días para la entrega',
                fuente: TipoFuenteCampo.USUARIO,
                tipoDato: TipoDatoCampo.NUMERO,
                sePuedeEliminar: SiNoValor.SI,
                alcance: 'Global',
                reglas: [
                    {
                        id: 6,
                        codigo: 'REG006',
                        nombre: 'Plazo mínimo',
                        tipoRegla: 'VALOR' as any,
                        operador: 'MAYOR_IGUAL' as any,
                        valor: '1',
                        mensajeError: 'El plazo debe ser al menos 1 día',
                    },
                    {
                        id: 7,
                        codigo: 'REG007',
                        nombre: 'Plazo máximo',
                        tipoRegla: 'VALOR' as any,
                        operador: 'MENOR_IGUAL' as any,
                        valor: '365',
                        mensajeError: 'El plazo no puede superar los 365 días',
                    },
                ],
                fechaCreacion: new Date('2024-01-01'),
                fechaModificacion: new Date('2024-01-01'),
                activo: true,
            },
        ];

        this.campos = camposMock;
    }

    obtenerTodos(filtro?: FiltroCampoDTO): Observable<CampoDTO[]> {
        let camposFiltrados = this.campos.filter((c) => c.activo);

        if (filtro) {
            if (filtro.etiqueta) {
                const etiquetaBusqueda = filtro.etiqueta.toLowerCase();
                camposFiltrados = camposFiltrados.filter((campo) =>
                    campo.etiqueta?.toLowerCase().includes(etiquetaBusqueda),
                );
            }
            if (filtro.descripcion) {
                const descripcionBusqueda = filtro.descripcion.toLowerCase();
                camposFiltrados = camposFiltrados.filter((campo) =>
                    campo.descripcion
                        ?.toLowerCase()
                        .includes(descripcionBusqueda),
                );
            }
            if (filtro.fuente) {
                camposFiltrados = camposFiltrados.filter(
                    (campo) => campo.fuente === filtro.fuente,
                );
            }
        }

        camposFiltrados.sort((a, b) => {
            const etiquetaA = a.etiqueta || '';
            const etiquetaB = b.etiqueta || '';
            return etiquetaA.localeCompare(etiquetaB);
        });

        return of(camposFiltrados).pipe(delay(300));
    }

    obtenerTodosPaginado(
        filtro?: FiltroCampoDTO,
        pagina: number = 0,
        tamanoPagina: number = 10,
        sort: string = 'etiqueta',
        order: 'asc' | 'desc' = 'asc',
    ): Observable<PageModel<CampoDTO>> {
        let camposFiltrados = this.campos.filter((c) => c.activo);

        if (filtro) {
            if (filtro.etiqueta) {
                const etiquetaBusqueda = filtro.etiqueta.toLowerCase();
                camposFiltrados = camposFiltrados.filter((campo) =>
                    campo.etiqueta?.toLowerCase().includes(etiquetaBusqueda),
                );
            }
            if (filtro.descripcion) {
                const descripcionBusqueda = filtro.descripcion.toLowerCase();
                camposFiltrados = camposFiltrados.filter((campo) =>
                    campo.descripcion
                        ?.toLowerCase()
                        .includes(descripcionBusqueda),
                );
            }
            if (filtro.fuente) {
                camposFiltrados = camposFiltrados.filter(
                    (campo) => campo.fuente === filtro.fuente,
                );
            }
        }

        camposFiltrados.sort((a, b) => {
            let valorA: any = '';
            let valorB: any = '';

            switch (sort) {
                case 'etiqueta':
                    valorA = a.etiqueta || '';
                    valorB = b.etiqueta || '';
                    break;
                case 'fuente':
                    valorA = a.fuente || '';
                    valorB = b.fuente || '';
                    break;
                default:
                    valorA = a.etiqueta || '';
                    valorB = b.etiqueta || '';
            }

            const resultado = valorA
                .toString()
                .localeCompare(valorB.toString());
            return order === 'asc' ? resultado : -resultado;
        });

        const totalElements = camposFiltrados.length;
        const inicio = pagina * tamanoPagina;
        const fin = inicio + tamanoPagina;
        const camposPaginados = camposFiltrados.slice(inicio, fin);

        const page: PageModel<CampoDTO> = {
            page: null,
            content: camposPaginados,
            totalElements,
            totalPages: Math.ceil(totalElements / tamanoPagina),
            size: tamanoPagina,
            number: pagina,
            first: pagina === 0,
            last: pagina >= Math.ceil(totalElements / tamanoPagina) - 1,
            numberOfElements: camposPaginados.length,
            sort: {
                sorted: order !== undefined,
                unsorted: order === undefined,
                empty: order === undefined,
            },
            empty: camposPaginados.length === 0,
        };

        return of(page).pipe(delay(300));
    }

    crear(campo: CampoDTO): Observable<CampoDTO> {
        const etiquetaExiste = this.campos.some(
            (c) =>
                c.etiqueta?.toLowerCase() === campo.etiqueta?.toLowerCase() &&
                c.activo,
        );

        if (etiquetaExiste) {
            throw new Error('Ya existe un campo con esa etiqueta');
        }

        const nuevoCampo = new CampoDTO(
            this.nextId++,
            campo.etiqueta,
            campo.descripcion,
            campo.fuente,
            campo.tipoDato,
            campo.largoMaximo,
            campo.valoresPermitidos,
            campo.sePuedeEliminar,
            campo.alcance || 'Global',
            campo.reglas || [],
            new Date(),
            new Date(),
            true,
        );

        this.campos.push(nuevoCampo);
        return of(nuevoCampo).pipe(delay(300));
    }

    actualizar(campo: CampoDTO): Observable<CampoDTO> {
        if (!campo.id) {
            throw new Error('El campo debe tener un ID para actualizarlo');
        }

        const index = this.campos.findIndex((c) => c.id === campo.id);
        if (index === -1) {
            throw new Error('Campo no encontrado');
        }

        const campoExistente = this.campos[index];

        if (
            campoExistente.fuente === TipoFuenteCampo.SICE_EDITABLE ||
            campoExistente.fuente === TipoFuenteCampo.SICE_NO_EDITABLE
        ) {
            throw new Error('Los campos SICE no se pueden modificar');
        }

        if (campoExistente.etiqueta === 'OBJETO_COMPRA') {
            throw new Error('El campo OBJETO_COMPRA no se puede modificar');
        }

        const etiquetaExiste = this.campos.some(
            (c) =>
                c.id !== campo.id &&
                c.etiqueta?.toLowerCase() === campo.etiqueta?.toLowerCase() &&
                c.activo,
        );

        if (etiquetaExiste) {
            throw new Error('Ya existe un campo con esa etiqueta');
        }

        const campoActualizado = new CampoDTO(
            campo.id,
            campo.etiqueta,
            campo.descripcion,
            campo.fuente,
            campo.tipoDato,
            campo.largoMaximo,
            campo.valoresPermitidos,
            campo.sePuedeEliminar,
            campo.alcance || campoExistente.alcance || 'Global',
            campo.reglas || [],
            campoExistente.fechaCreacion,
            new Date(),
            true,
        );

        this.campos[index] = campoActualizado;
        return of(campoActualizado).pipe(delay(300));
    }

    obtenerPorId(id: number): Observable<CampoDTO | undefined> {
        const campo = this.campos.find((c) => c.id === id && c.activo);
        return of(campo).pipe(delay(300));
    }

    eliminar(id: number, bajaLogica: boolean = false): Observable<void> {
        const index = this.campos.findIndex((c) => c.id === id);
        if (index === -1) {
            throw new Error('Campo no encontrado');
        }

        const campo = this.campos[index];

        if (
            campo.fuente === TipoFuenteCampo.SICE_EDITABLE ||
            campo.fuente === TipoFuenteCampo.SICE_NO_EDITABLE
        ) {
            throw new Error('Los campos SICE no se pueden eliminar');
        }

        if (campo.etiqueta === 'OBJETO_COMPRA') {
            throw new Error('El campo OBJETO_COMPRA no se puede eliminar');
        }

        if (campo.sePuedeEliminar === SiNoValor.NO) {
            throw new Error('Este campo no se puede eliminar');
        }

        if (bajaLogica) {
            this.campos[index].activo = false;
        } else {
            this.campos.splice(index, 1);
        }

        return of(void 0).pipe(delay(300));
    }

    obtenerCamposPorTipo(
        tipoDato: TipoDatoCampo,
        excluirId?: number,
    ): Observable<CampoDTO[]> {
        let camposFiltrados = this.campos.filter(
            (c) => c.activo && c.tipoDato === tipoDato,
        );

        if (excluirId) {
            camposFiltrados = camposFiltrados.filter((c) => c.id !== excluirId);
        }

        camposFiltrados.sort((a, b) => {
            const etiquetaA = a.etiqueta || '';
            const etiquetaB = b.etiqueta || '';
            return etiquetaA.localeCompare(etiquetaB);
        });

        return of(camposFiltrados).pipe(delay(300));
    }

    obtenerTiposFuente(): { id: string; nombre: string }[] {
        return [
            { id: '', nombre: 'Todos' },
            { id: TipoFuenteCampo.SICE_EDITABLE, nombre: 'SICE (editable)' },
            {
                id: TipoFuenteCampo.SICE_NO_EDITABLE,
                nombre: 'SICE (no editable)',
            },
            { id: TipoFuenteCampo.USUARIO, nombre: 'Usuario' },
        ];
    }

    obtenerTiposDato(): { id: string; nombre: string }[] {
        return [
            { id: TipoDatoCampo.NUMERO, nombre: 'Número' },
            { id: TipoDatoCampo.TEXTO, nombre: 'Texto' },
            { id: TipoDatoCampo.BOOLEANO, nombre: 'Booleano' },
            { id: TipoDatoCampo.FECHA, nombre: 'Fecha' },
            { id: TipoDatoCampo.HORA, nombre: 'Hora' },
            {
                id: TipoDatoCampo.CORREO_ELECTRONICO,
                nombre: 'Correo electrónico',
            },
            {
                id: TipoDatoCampo.LISTA_UNICA_SELECCION,
                nombre: 'Lista única selección',
            },
            { id: TipoDatoCampo.LISTA_MULTIPLE_SELECCION, nombre: 'Lista múltiple selección' },
        ];
    }

    puedeModificar(campo: CampoDTO): boolean {
        if (!campo) return false;

        if (
            campo.fuente === TipoFuenteCampo.SICE_EDITABLE ||
            campo.fuente === TipoFuenteCampo.SICE_NO_EDITABLE
        ) {
            return false;
        }

        if (campo.etiqueta === 'OBJETO_COMPRA') {
            return false;
        }

        return true;
    }

    puedeEliminar(campo: CampoDTO): boolean {
        if (!campo) return false;

        if (
            campo.fuente === TipoFuenteCampo.SICE_EDITABLE ||
            campo.fuente === TipoFuenteCampo.SICE_NO_EDITABLE
        ) {
            return false;
        }

        if (campo.etiqueta === 'OBJETO_COMPRA') {
            return false;
        }

        if (campo.sePuedeEliminar === SiNoValor.NO) {
            return false;
        }

        return true;
    }
}
