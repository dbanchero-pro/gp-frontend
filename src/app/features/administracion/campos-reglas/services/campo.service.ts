import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CampoDTO } from '../models/campo.model';
import { FiltroCampoDTO } from '../models/filtro-campo.model';
import { TipoFuenteCampo } from '../enum/tipo-fuente-campo.enum';
import { TipoDatoCampo } from '../enum/tipo-dato-campo.enum';
import { SiNoValor } from '../../../../shared/enum/si-no-valor.enum';

@Injectable({
  providedIn: 'root'
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
        etiqueta: 'Organismo',
        descripcion: 'Corresponde a la descripción del inciso y descripción de la unidad ejecutora, tomados de las codigueras, correspondientes al ID de inciso e ID de unidad ejecutora de la compra proveniente de SICE.',
        fuente: TipoFuenteCampo.SICE_NO_EDITABLE,
        tipoDato: TipoDatoCampo.TEXTO,
        sePuedeEliminar: SiNoValor.NO,
        reglas: [],
        fechaCreacion: new Date('2024-01-01'),
        fechaModificacion: new Date('2024-01-01'),
        activo: true
      },
      {
        id: this.nextId++,
        etiqueta: 'Tipo de compra',
        descripcion: 'Corresponde a la descripción del tipo de compra, tomado de la codiguera correspondiente al ID de compra proveniente de SICE.',
        fuente: TipoFuenteCampo.SICE_NO_EDITABLE,
        tipoDato: TipoDatoCampo.TEXTO,
        sePuedeEliminar: SiNoValor.NO,
        reglas: [],
        fechaCreacion: new Date('2024-01-01'),
        fechaModificacion: new Date('2024-01-01'),
        activo: true
      },
      {
        id: this.nextId++,
        etiqueta: 'Sub-tipo de compra',
        descripcion: 'Corresponde a la descripción del sub-tipo de compra, tomado de la codiguera correspondiente al ID de sub-tipo de compra proveniente de SICE.',
        fuente: TipoFuenteCampo.SICE_NO_EDITABLE,
        tipoDato: TipoDatoCampo.TEXTO,
        sePuedeEliminar: SiNoValor.NO,
        reglas: [],
        fechaCreacion: new Date('2024-01-01'),
        fechaModificacion: new Date('2024-01-01'),
        activo: true
      },
      {
        id: this.nextId++,
        etiqueta: 'Número de compra',
        descripcion: 'Es el número del procedimiento de la compra proveniente de SICE',
        fuente: TipoFuenteCampo.SICE_NO_EDITABLE,
        tipoDato: TipoDatoCampo.NUMERO,
        sePuedeEliminar: SiNoValor.NO,
        reglas: [],
        fechaCreacion: new Date('2024-01-01'),
        fechaModificacion: new Date('2024-01-01'),
        activo: true
      },
      {
        id: this.nextId++,
        etiqueta: 'Año de compra',
        descripcion: 'Corresponde al año del procedimiento de la compra proveniente de SICE',
        fuente: TipoFuenteCampo.SICE_NO_EDITABLE,
        tipoDato: TipoDatoCampo.NUMERO,
        sePuedeEliminar: SiNoValor.NO,
        reglas: [],
        fechaCreacion: new Date('2024-01-01'),
        fechaModificacion: new Date('2024-01-01'),
        activo: true
      },
      {
        id: this.nextId++,
        etiqueta: 'Ítem de compra',
        descripcion: 'Corresponde a la lista de ítems de la compra en formato: descripción artículo + (código artículo)',
        fuente: TipoFuenteCampo.SICE_NO_EDITABLE,
        tipoDato: TipoDatoCampo.TEXTO,
        sePuedeEliminar: SiNoValor.NO,
        reglas: [],
        fechaCreacion: new Date('2024-01-01'),
        fechaModificacion: new Date('2024-01-01'),
        activo: true
      },
      {
        id: this.nextId++,
        etiqueta: 'Presupuesto',
        descripcion: 'Número que indica el presupuesto asignado a la contratación',
        fuente: TipoFuenteCampo.SICE_EDITABLE,
        tipoDato: TipoDatoCampo.NUMERO,
        sePuedeEliminar: SiNoValor.NO,
        reglas: [],
        fechaCreacion: new Date('2024-01-01'),
        fechaModificacion: new Date('2024-01-01'),
        activo: true
      },
      {
        id: this.nextId++,
        etiqueta: 'Correo electrónico de comunicaciones',
        descripcion: 'Corresponde al correo de comunicaciones, asociado a la Unidad de compra, obtenido de la codiguera de Comunicaciones para Unidades de Compra en SICE.',
        fuente: TipoFuenteCampo.SICE_EDITABLE,
        tipoDato: TipoDatoCampo.CORREO_ELECTRONICO,
        sePuedeEliminar: SiNoValor.NO,
        reglas: [],
        fechaCreacion: new Date('2024-01-01'),
        fechaModificacion: new Date('2024-01-01'),
        activo: true
      },
      {
        id: this.nextId++,
        etiqueta: 'OBJETO_COMPRA',
        descripcion: 'Campo predefinido para el objeto de la compra',
        fuente: TipoFuenteCampo.USUARIO,
        tipoDato: TipoDatoCampo.TEXTO,
        sePuedeEliminar: SiNoValor.NO,
        reglas: [],
        fechaCreacion: new Date('2024-01-01'),
        fechaModificacion: new Date('2024-01-01'),
        activo: true
      }
    ];

    this.campos = camposMock;
  }

  obtenerTodos(filtro?: FiltroCampoDTO): Observable<CampoDTO[]> {
    let camposFiltrados = this.campos.filter(c => c.activo);

    if (filtro) {
      if (filtro.etiqueta) {
        const etiquetaBusqueda = filtro.etiqueta.toLowerCase();
        camposFiltrados = camposFiltrados.filter(campo =>
          campo.etiqueta?.toLowerCase().includes(etiquetaBusqueda)
        );
      }
      if (filtro.descripcion) {
        const descripcionBusqueda = filtro.descripcion.toLowerCase();
        camposFiltrados = camposFiltrados.filter(campo =>
          campo.descripcion?.toLowerCase().includes(descripcionBusqueda)
        );
      }
      if (filtro.fuente) {
        camposFiltrados = camposFiltrados.filter(campo => campo.fuente === filtro.fuente);
      }
    }

    camposFiltrados.sort((a, b) => {
      const etiquetaA = a.etiqueta || '';
      const etiquetaB = b.etiqueta || '';
      return etiquetaA.localeCompare(etiquetaB);
    });

    return of(camposFiltrados).pipe(delay(300));
  }

  crear(campo: CampoDTO): Observable<CampoDTO> {
    const etiquetaExiste = this.campos.some(
      c => c.etiqueta?.toLowerCase() === campo.etiqueta?.toLowerCase() && c.activo
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
      campo.sePuedeEliminar,
      campo.reglas || [],
      new Date(),
      new Date(),
      true
    );

    this.campos.push(nuevoCampo);
    return of(nuevoCampo).pipe(delay(300));
  }

  actualizar(campo: CampoDTO): Observable<CampoDTO> {
    if (!campo.id) {
      throw new Error('El campo debe tener un ID para actualizarlo');
    }

    const index = this.campos.findIndex(c => c.id === campo.id);
    if (index === -1) {
      throw new Error('Campo no encontrado');
    }

    const campoExistente = this.campos[index];

    if (campoExistente.fuente === TipoFuenteCampo.SICE_EDITABLE ||
        campoExistente.fuente === TipoFuenteCampo.SICE_NO_EDITABLE) {
      throw new Error('Los campos SICE no se pueden modificar');
    }

    if (campoExistente.etiqueta === 'OBJETO_COMPRA') {
      throw new Error('El campo OBJETO_COMPRA no se puede modificar');
    }

    const etiquetaExiste = this.campos.some(
      c => c.id !== campo.id &&
           c.etiqueta?.toLowerCase() === campo.etiqueta?.toLowerCase() &&
           c.activo
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
      campo.sePuedeEliminar,
      campo.reglas || [],
      campoExistente.fechaCreacion,
      new Date(),
      true
    );

    this.campos[index] = campoActualizado;
    return of(campoActualizado).pipe(delay(300));
  }

  obtenerPorId(id: number): Observable<CampoDTO | undefined> {
    const campo = this.campos.find(c => c.id === id && c.activo);
    return of(campo).pipe(delay(300));
  }

  eliminar(id: number, bajaLogica: boolean = false): Observable<void> {
    const index = this.campos.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Campo no encontrado');
    }

    const campo = this.campos[index];

    if (campo.fuente === TipoFuenteCampo.SICE_EDITABLE ||
        campo.fuente === TipoFuenteCampo.SICE_NO_EDITABLE) {
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

  obtenerCamposPorTipo(tipoDato: TipoDatoCampo, excluirId?: number): Observable<CampoDTO[]> {
    let camposFiltrados = this.campos.filter(
      c => c.activo && c.tipoDato === tipoDato
    );

    if (excluirId) {
      camposFiltrados = camposFiltrados.filter(c => c.id !== excluirId);
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
      { id: TipoFuenteCampo.SICE_NO_EDITABLE, nombre: 'SICE (no editable)' },
      { id: TipoFuenteCampo.USUARIO, nombre: 'Usuario' }
    ];
  }

  obtenerTiposDato(): { id: string; nombre: string }[] {
    return [
      { id: TipoDatoCampo.NUMERO, nombre: 'Número' },
      { id: TipoDatoCampo.TEXTO, nombre: 'Texto' },
      { id: TipoDatoCampo.BOOLEANO, nombre: 'Booleano' },
      { id: TipoDatoCampo.FECHA, nombre: 'Fecha' },
      { id: TipoDatoCampo.HORA, nombre: 'Hora' },
      { id: TipoDatoCampo.CORREO_ELECTRONICO, nombre: 'Correo electrónico' },
      { id: TipoDatoCampo.LISTA_VALORES_TEXTO, nombre: 'Lista de valores (texto)' }
    ];
  }

  puedeModificar(campo: CampoDTO): boolean {
    if (!campo) return false;

    if (campo.fuente === TipoFuenteCampo.SICE_EDITABLE ||
        campo.fuente === TipoFuenteCampo.SICE_NO_EDITABLE) {
      return false;
    }

    if (campo.etiqueta === 'OBJETO_COMPRA') {
      return false;
    }

    return true;
  }

  puedeEliminar(campo: CampoDTO): boolean {
    if (!campo) return false;

    if (campo.fuente === TipoFuenteCampo.SICE_EDITABLE ||
        campo.fuente === TipoFuenteCampo.SICE_NO_EDITABLE) {
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
