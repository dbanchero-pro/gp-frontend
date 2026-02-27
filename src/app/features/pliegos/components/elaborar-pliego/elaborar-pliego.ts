import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EstadoProcesoPliego } from '../../enum/estado-proceso-pliego.enum';
import { CanComponentDeactivate } from '../../../../shared/utils/can-component-deactivate';
import { Observable } from 'rxjs';
import { ActualizarService } from '../../../../shared/services/common/actualizar.service';
import { ClausulaPliego } from '../../models/clausula-pliego.model';
import { UsuarioAsignadoPliegoDTO } from '../../models/usuario-asignado-pliego.model';
import { TareaHistorialDTO } from '../../models/tarea-historial.model';
import { SeccionPliegoDTO } from '../../models/seccion-pliego.model';
import { EstadoElemento } from 'src/app/shared/enum/estado-elemento.enum';
import { PliegoDTO } from '../../models/pliego.model';
import { SiNoAmbasValor } from 'src/app/shared/enum/si-no-ambas-valor.enum';


@Component({
  selector: 'app-elaborar-pliego',
  templateUrl: './elaborar-pliego.html',
  styleUrls: ['./elaborar-pliego.scss'],
  standalone: false
})
export class ElaborarPliegoComponent implements OnInit, AfterViewInit, CanComponentDeactivate {
  pliego: PliegoDTO = this.crearPliegoDemo(0);
  EstadoProcesoPliego = EstadoProcesoPliego;
  
  aperturaElectronica: SiNoAmbasValor = SiNoAmbasValor.SI;
  modeloUsado: string = 'Modelo EstÃ¡ndar LicitaciÃ³n PÃºblica Nacional';

  colNavegacion = 'col-lg-3 ml-0 pl-0 mr-0 pr-0';
  colEdicion = 'col-lg-9 ml-0 pl-0 mr-0 pr-0';
  panelNavegacionContraido = false;
  panelEdicionContraido = false;

  seccionActiva: string | null = null;
  clausulaActiva: number | null = null;
  clausulaSeleccionada: ClausulaPliego | null = null;

  tituloEdicion: string = 'EdiciÃ³n';

  modeloCambio: boolean = false;
  esValidador: boolean = false;
  cambiosSinGuardar: boolean = false;

  usuariosAsignados: UsuarioAsignadoPliegoDTO[] = [
    { rol: 'Editor Principal', nombre: 'Juan PÃ©rez' },
    { rol: 'Editor', nombre: 'MarÃ­a GonzÃ¡lez' },
    { rol: 'Validador', nombre: 'Carlos RodrÃ­guez' }
  ];

  historialTareas: TareaHistorialDTO[] = [
    { fecha: new Date('2024-01-15 10:30'), tarea: 'CreaciÃ³n', usuario: 'Juan PÃ©rez' },
    { fecha: new Date('2024-02-16 14:20'), tarea: 'AsignaciÃ³n', usuario: 'MarÃ­a GonzÃ¡lez' },
    { fecha: new Date('2024-03-16 14:20'), tarea: 'IniciaciÃ³n', usuario: 'MarÃ­a GonzÃ¡lez' },
    { fecha: new Date('2024-03-16 14:20'), tarea: 'En ediciÃ³n', usuario: 'MarÃ­a GonzÃ¡lez' }
  ];

  secciones: SeccionPliegoDTO[] = [
    {
      nombre: 'SecciÃ³n I - InformaciÃ³n General',
      expandida: true,
      capitulos: [
        {
          nombre: 'CapÃ­tulo I - Objeto de la Compra',
          expandido: true,
          clausulas: [
            { id: 1, nombre: 'DescripciÃ³n del objeto', bloqueada: false, obligatoria: true, editable:true, clausula: { id: 1, denominacion: "", objetosCompra: [], estado: EstadoElemento.VIGENTE, organismo: undefined, tiposCompra: [], redacciones:[]}  },
            { id: 2, nombre: 'Especificaciones tÃ©cnicas', bloqueada: true, obligatoria: false, editable:false , clausula: {id: 1, denominacion: "", objetosCompra: [], estado: EstadoElemento.VIGENTE, organismo: undefined, tiposCompra: [], redacciones:[]} },
            { id: 3, nombre: 'Cantidad y unidades', bloqueada: false, obligatoria: true, editable:false, clausula: {id: 1, denominacion: "", objetosCompra: [], estado: EstadoElemento.VIGENTE, organismo: undefined, tiposCompra: [], redacciones:[]}  }
          ],
          capitulo: {id: 1, denominacion: "", clausulas:[], estado: EstadoElemento.VIGENTE}
        },
        {
          nombre: 'CapÃ­tulo II - Condiciones Generales',
          expandido: false,
          clausulas: [
            { id: 4, nombre: 'Plazo de entrega', bloqueada: false, obligatoria: true, editable:false , clausula: {id: 1, denominacion: "", objetosCompra: [], estado: EstadoElemento.VIGENTE, organismo: undefined, tiposCompra: [], redacciones:[]} },
            { id: 5, nombre: 'Lugar de entrega', bloqueada: false, obligatoria: true, editable:false  , clausula: {id: 1, denominacion: "", objetosCompra: [], estado: EstadoElemento.VIGENTE, organismo: undefined, tiposCompra: [], redacciones:[]}},
            { id: 6, nombre: 'GarantÃ­as', bloqueada: false, obligatoria: false, editable:false  , clausula: {id: 1, denominacion: "", objetosCompra: [], estado: EstadoElemento.VIGENTE, organismo: undefined, tiposCompra: [], redacciones:[]}}
          ],
          capitulo: {id: 1, denominacion: "", clausulas:[], estado: EstadoElemento.VIGENTE}
        }
      ],
      seccion: {id: 1, denominacion: "secciÃ³n 1", estado: EstadoElemento.VIGENTE, capitulos:[], clausulas: []},
      clausulas: [],
      soloClausulas: false,
    },
    {
      nombre: 'SecciÃ³n II - Requisitos de ParticipaciÃ³n',
      expandida: false,
      capitulos: [
        {
          nombre: 'CapÃ­tulo I - Requisitos Legales',
          expandido: false,
          clausulas: [
            { id: 7, nombre: 'DocumentaciÃ³n legal', bloqueada: false, obligatoria: true, editable:false, clausula: {id: 1, denominacion: "", objetosCompra:[], estado: EstadoElemento.VIGENTE, organismo: undefined, tiposCompra: [], redacciones:[]} },
            { id: 8, nombre: 'Certificados requeridos', bloqueada: false, obligatoria: true, editable:false, clausula: {id: 1, denominacion: "", objetosCompra:[], estado: EstadoElemento.VIGENTE, organismo: undefined, tiposCompra: [], redacciones:[]} }
          ],
          capitulo: {id: 1, denominacion: "", clausulas:[], estado: EstadoElemento.VIGENTE}
        },
        {
          nombre: 'CapÃ­tulo II - Requisitos TÃ©cnicos',
          expandido: false,
          clausulas: [
            { id: 9, nombre: 'Experiencia tÃ©cnica', bloqueada: false, obligatoria: true, editable:false  , clausula: {id: 1, denominacion: "", objetosCompra:[], estado: EstadoElemento.VIGENTE, organismo: undefined, tiposCompra: [], redacciones:[]}},
            { id: 10, nombre: 'Capacidad operativa', bloqueada: false, obligatoria: false, editable:false , clausula: {id: 1, denominacion: "", objetosCompra:[], estado: EstadoElemento.VIGENTE, organismo: undefined, tiposCompra: [], redacciones:[]} }
          ],
          capitulo: {id: 1, denominacion:"", clausulas:[], estado: EstadoElemento.VIGENTE}
        }
      ],
      seccion: {id: 1, denominacion: "secciÃ³n 1", estado: EstadoElemento.VIGENTE, capitulos:[], clausulas: []},
      clausulas: [],
      soloClausulas: false
    },
    {
      nombre: 'SecciÃ³n III - EvaluaciÃ³n y AdjudicaciÃ³n',
      expandida: false,
      capitulos: [
        {
          nombre: 'CapÃ­tulo I - Criterios de EvaluaciÃ³n',
          expandido: false,
          clausulas: [
            { id: 11, nombre: 'Criterio precio', bloqueada: false, obligatoria: true, editable:false, clausula: { id: 1, denominacion: "", objetosCompra: [], estado: EstadoElemento.VIGENTE, organismo: undefined, tiposCompra: [], redacciones:[]}  },
            { id: 12, nombre: 'Criterios tÃ©cnicos', bloqueada: false, obligatoria: true , editable:false, clausula: { id: 2, denominacion: "", objetosCompra: [], estado: EstadoElemento.VIGENTE, organismo: undefined, tiposCompra: [], redacciones:[]}  },
            { id: 13, nombre: 'Puntajes', bloqueada: false, obligatoria: true, editable:false , clausula: { id: 3, denominacion: "", objetosCompra: [], estado: EstadoElemento.VIGENTE, organismo: undefined, tiposCompra: [], redacciones:[]}  }
          ],
          capitulo: {id: 1, denominacion: "", clausulas:[], estado: EstadoElemento.VIGENTE}
        }
      ],
      seccion: {id: 1, denominacion: "secciÃ³n 1", estado: EstadoElemento.VIGENTE, capitulos:[], clausulas: []},
      clausulas: [],
      soloClausulas: false
    },
    {
      nombre: 'SecciÃ³n IV - Con clÃ¡usulas',
      expandida: false,
      capitulos: [],
      clausulas: [
          { id: 11, nombre: 'ClÃ¡usula vacÃ­a', bloqueada: false, obligatoria: true, editable:false, clausula: {id: 1, denominacion: "denominaciÃ³n 1", objetosCompra: [], estado: EstadoElemento.VIGENTE, organismo: undefined, tiposCompra: [], redacciones:[]}  },
      ],
      seccion: {id: 1, denominacion: "secciÃ³n 1", estado: EstadoElemento.VIGENTE, capitulos:[], clausulas: []},
      soloClausulas: true
        
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actualizarService: ActualizarService

  ) {}

  ngOnInit(): void {
    const pliegoId = this.route.snapshot.paramMap.get('id');
    if (pliegoId) {
      this.cargarPliego(parseInt(pliegoId, 10));
    }

    this.route.queryParams.subscribe(params => {
      const etiquetaCopiada = params['etiquetaCopiada'];
      const focusElement = params['focusElement'];
      const clausulaIdParam = params['clausulaId'];

      if (clausulaIdParam) {
        const clausulaId = parseInt(clausulaIdParam, 10);
        this.restaurarClausulaActiva(clausulaId);
      }

      if (etiquetaCopiada) {
        setTimeout(() => {
          this.actualizarService.mensajeCorrecto(`Campo copiado: [[${etiquetaCopiada}]]`);

          if (focusElement) {
            const elemento = document.getElementById(focusElement);
            if (elemento) {
              elemento.focus();
            }
          }

          this.limpiarQueryParams();
        }, 300);
      } else if (focusElement && !etiquetaCopiada) {
        setTimeout(() => {
          const elemento = document.getElementById(focusElement);
          if (elemento) {
            elemento.focus();
          }

          this.limpiarQueryParams();
        }, 300);
      }
    });
  }

  private restaurarClausulaActiva(clausulaId: number): void {
    for (let seccionIndex = 0; seccionIndex < this.secciones.length; seccionIndex++) {
      const seccion = this.secciones[seccionIndex];

      if (seccion.soloClausulas) {
        const clausula = seccion.clausulas.find(c => c.id === clausulaId);
        if (clausula) {
          seccion.expandida = true;
          this.seleccionarClausula(clausula);
          return;
        }
      } else {
        for (let capituloIndex = 0; capituloIndex < seccion.capitulos.length; capituloIndex++) {
          const capitulo = seccion.capitulos[capituloIndex];
          const clausula = capitulo.clausulas.find(c => c.id === clausulaId);

          if (clausula) {
            seccion.expandida = true;
            capitulo.expandido = true;
            this.seleccionarClausula(clausula);
            return;
          }
        }
      }
    }
  }

  ngAfterViewInit(): void {
    // Implementado para cumplir con la interfaz AfterViewInit
  }

  private limpiarQueryParams(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/pliegos/bandeja-entrada/elaborar', id], {
        replaceUrl: true
      });
    }
  }

  cargarPliego(id: number): void {
    this.pliego = this.crearPliegoDemo(
      id,
      'Poder Ejecutivo',
      'Ministerio de Economia',
      'Licitacion Publica',
      'Nacional',
      1234,
      2024
    );
  }

  obtenerTextoEstado(estado: EstadoProcesoPliego): string {
    const estados: { [key: string]: string } = {
      'Pendiente': 'Pendiente',
      'Asignado': 'Asignado',
      'En proceso': 'En Proceso',
      'Pendiente validaciÃ³n': 'Pendiente ValidaciÃ³n',
      'Pendiente aprobaciÃ³n': 'Pendiente AprobaciÃ³n',
      'Aprobado': 'Aprobado',
      'Cancelado': 'Cancelado',
      'Publicado': 'Publicado'
    };
    return estados[estado] || estado;
  }

  toggleSeccion(index: number): void {
    this.secciones[index].expandida = !this.secciones[index].expandida;
  }

  toggleCapitulo(seccionIndex: number, capituloIndex: number): void {
    this.secciones[seccionIndex].capitulos[capituloIndex].expandido =
      !this.secciones[seccionIndex].capitulos[capituloIndex].expandido;
  }

  togglePanelNavegacion(): void {
    this.panelNavegacionContraido = !this.panelNavegacionContraido;

    if (this.panelNavegacionContraido) {
      this.colNavegacion = 'col-lg-1 ml-0 pl-0 mr-0 pr-0';
      this.colEdicion = 'col-lg-11 ml-0 pl-0 mr-0 pr-0';
      this.panelEdicionContraido=false;
    } else {
      this.colNavegacion = 'col-lg-3 ml-0 pl-0 mr-0 pr-0';
      this.colEdicion = 'col-lg-9 ml-0 pl-0 mr-0 pr-0';
      this.panelNavegacionContraido=false;
    }
  }

  togglePanelEdicion(): void {
    this.panelEdicionContraido = !this.panelEdicionContraido;

    if (this.panelEdicionContraido) {
      this.colEdicion = 'col-lg-1 ml-0 pl-0 mr-0 pr-0';
      this.colNavegacion = 'col-lg-11 ml-0 pl-0 mr-0 pr-0';
      this.panelNavegacionContraido=false;
    } else {
      this.colNavegacion = 'col-lg-3 ml-0 pl-0 mr-0 pr-0';
      this.colEdicion = 'col-lg-9 ml-0 pl-0 mr-0 pr-0';
      this.panelEdicionContraido=false;
    }
  }

  seleccionarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
    this.clausulaActiva = null;
    this.clausulaSeleccionada = null;

    const titulos: { [key: string]: string } = {
      'encabezado': 'Encabezado y pie de pÃ¡gina',
      'caratula': 'CarÃ¡tula',
      'notas': 'Notas',
      'anexos': 'Anexos',
      'campos': 'Campos variables',
      'resolucion': 'ResoluciÃ³n'
    };
    this.tituloEdicion = titulos[seccion] || 'EdiciÃ³n';
  }

  seleccionarClausula(clausula: ClausulaPliego): void {
   
    this.seccionActiva = null;
    this.clausulaActiva = clausula.id;
    this.clausulaSeleccionada = clausula;
    this.tituloEdicion = "    ClÃ¡usula: " + (clausula.nombre || clausula.clausula?.denominacion || '');
  }

  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (!this.cambiosSinGuardar) {
      return true;
    }

    return confirm('Tiene cambios sin guardar. Â¿Desea salir sin guardar?');
  }

  volver() {
    this.router.navigate(
      ['/pliegos/bandeja-entrada'],
      { queryParams: { volver: '1' } }
    );
  }

  obtenerTextoOrganismoPliego(): string {
    return `${this.pliego.unidadEjecutora?.inciso?.descInciso ?? ''} | ${this.pliego.unidadEjecutora?.descUnidadEjecutora ?? ''}`;
  }

  obtenerTextoTipoCompraPliego(): string {
    return `${this.pliego.subtipoCompra?.descTipoCompra ?? ''} | ${this.pliego.subtipoCompra?.descSubtipoCompra ?? ''} N° ${this.pliego.numeroCompra}/${this.pliego.anioCompra}`;
  }

  private crearPliegoDemo(
    id: number,
    inciso: string = '',
    unidadEjecutora: string = '',
    tipoCompra: string = '',
    subtipoCompra: string = '',
    numeroCompra: number = 0,
    anioCompra: number = 0
  ): PliegoDTO {
    return {
      id,
      modelo: {
        id: 0,
        denominacion: '',
        fechaVigenciaDesde: null,
        fechaVigenciaHasta: null,
        estado: null as any,
        version: 0,
        secciones: [],
        tiposCompra: [],
        organismo: undefined,
        fechaCreacion: null,
        usuarioCreacion: null,
        fechaModificacion: null,
        usuarioModificacion: null
      },
      notas: [],
      estado: EstadoProcesoPliego.EN_PROCESO,
      unidadEjecutora: {
        id: 0,
        inciso: { idInciso: 0, descInciso: inciso },
        idUnidadEjecutora: 0,
        descUnidadEjecutora: unidadEjecutora
      },
      subtipoCompra: {
        idTipoCompra: '1',
        idSubtipoCompra: '1',
        descTipoCompra: tipoCompra,
        descSubtipoCompra: subtipoCompra
      },
      numeroCompra,
      anioCompra,
      aperturaElectronica: 'S' as any,
      fechaPublicacion: undefined,
      version: 1,
      campos: { id: 0, valorString: '', campo: {} as any, bloqueado: 'N' },
      historial: []
    };
  }
}


