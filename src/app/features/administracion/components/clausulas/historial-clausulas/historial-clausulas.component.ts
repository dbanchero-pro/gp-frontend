import { Component, OnInit, Version, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IColumnaOrden } from '../../../../../shared/models/common/columna-orden.model';
import { FechaPipe } from '../../../../../shared/pipes/fecha.pipe';
import { ClausulaDTO } from 'src/app/shared/models/pliego/clausula/clausula.model';
import { ClausulaService } from '../../../services/clausula.service';

@Component({
  selector: 'app-historial-clausulas',
  templateUrl: './historial-clausulas.component.html',
  styleUrls: ['./historial-clausulas.component.scss'],
  standalone: false
})
export class HistorialClausulasComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clausulaService = inject(ClausulaService);
  private fechaPipe = inject(FechaPipe);

  clausulaId: number | null = null;
  denominacionClausula = '';
  versiones: ClausulaDTO[] = [];
  versionesFiltradas: ClausulaDTO[] = [];
  cargando = false;

  total = 0;
  parametros = {
    pagina: 0,
    tamanoPagina: 10,
    sort: 'version',
    order: 'desc' as 'asc' | 'desc'
  };

  listaOrden: IColumnaOrden[] = [
    { id: 'version', nombre: 'Versión' },
    { id: 'fechaModificacion', nombre: 'Fecha de aprobación' },
    { id: 'fechaVigenciaDesde', nombre: 'Fecha vigencia desde' },
    { id: 'fechaVigenciaHasta', nombre: 'Fecha vigencia hasta' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clausulaId = parseInt(id, 10);
      this.cargarHistorial();
    }
  }

  cargarHistorial(): void {
    if (!this.clausulaId) {
      return;
    }

    this.cargando = true;
    this.clausulaService.obtenerHistorialVersiones(this.clausulaId).subscribe({
      next: (versiones) => {
        this.versiones = versiones;
        if (versiones.length > 0) {
          this.denominacionClausula = versiones[0].denominacion;
        }
        this.aplicarOrdenYPaginacion();
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  aplicarOrdenYPaginacion(): void {
    let versionesOrdenadas = [...this.versiones];

    // Aplicar ordenamiento
    versionesOrdenadas.sort((a, b) => {
      let valorA: any = (a as any)[this.parametros.sort];
      let valorB: any = (b as any)[this.parametros.sort];

      if (valorA === null || valorA === undefined) valorA = '';
      if (valorB === null || valorB === undefined) valorB = '';

      if (typeof valorA === 'string') {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }

      let comparacion = 0;
      if (valorA < valorB) {
        comparacion = -1;
      } else if (valorA > valorB) {
        comparacion = 1;
      }

      return this.parametros.order === 'asc' ? comparacion : -comparacion;
    });

    this.total = versionesOrdenadas.length;

    // Aplicar paginación
    const inicio = this.parametros.pagina * this.parametros.tamanoPagina;
    const fin = inicio + this.parametros.tamanoPagina;
    this.versionesFiltradas = versionesOrdenadas.slice(inicio, fin);
  }

  cambioPagina(pagina: number): void {
    this.parametros.pagina = pagina - 1;
    this.aplicarOrdenYPaginacion();
  }

  cambioPorPagina(tamanoPagina: number): void {
    this.parametros.tamanoPagina = tamanoPagina;
    this.parametros.pagina = 0;
    this.aplicarOrdenYPaginacion();
  }

  cambioOrden(orden: 'asc' | 'desc'): void {
    this.parametros.order = orden;
    this.aplicarOrdenYPaginacion();
  }

  cambioColumnaOrden(columna: string): void {
    this.parametros.sort = columna;
    this.aplicarOrdenYPaginacion();
  }

  obtenerResumenTiposCompra(clausula: ClausulaDTO): string {
    return clausula.tiposCompra
      .map(tc => {
        const tipo = tc.tipoCompra?.descTipoCompra || '';
        const subtipo = tc.subtipoCompra?.descSubtipoCompra || 'Todos los subtipos';
        if (!tipo) {
          return '';
        }
        return `${tipo} | ${subtipo}`;
      })
      .filter(Boolean)
      .join(' • ');
  }

  obtenerResumenObjetosCompra(clausula: ClausulaDTO): string {
    return clausula.objetosCompra
      .map(oc => {
        const partes: string[] = [];
        if (oc.familia?.descFamilia) partes.push(oc.familia.descFamilia);
        if (oc.subfamilia?.descSubfamilia) partes.push(oc.subfamilia.descSubfamilia);
        if (oc.clase?.descClase) partes.push(oc.clase.descClase);
        if (oc.subclase?.descSubclase) partes.push(oc.subclase.descSubclase);

        let resultado = partes.join(' | ');

        if (oc.articulo?.descArticuloServObra) {
          resultado += ` | ${oc.articulo.descArticuloServObra}`;
        }

        return resultado;
      })
      .filter(texto => texto.length > 0)
      .join(' • ');
  }

  obtenerResumenIncisos(clausula: ClausulaDTO): string {
    if (!clausula.organismo?.inciso?.descInciso) {
      return '';
    }

    const inciso = clausula.organismo.inciso.descInciso;
    const unidad = clausula.organismo.unidadEjecutora?.descUnidadEjecutora;

    return unidad ? `${inciso} | ${unidad}` : inciso;
  }

  obtenerTextoVigencia(clausula: ClausulaDTO): string {
    const desde = clausula.fechaVigenciaDesde
      ? this.fechaPipe.transform(clausula.fechaVigenciaDesde)
      : '';
    const hasta = clausula.fechaVigenciaHasta
      ? this.fechaPipe.transform(clausula.fechaVigenciaHasta)
      : '';
    return `${desde} - ${hasta}`;
  }

  obtenerFechaAprobacion(clausula: ClausulaDTO): string {
    return clausula.fechaModificacion
      ? this.fechaPipe.transform(clausula.fechaModificacion)
      : '';
  }

  truncarRedaccion(html: string): string {
    if (!html) return '';

    const textoPlano = this.extraerTextoDeHTML(html);
    const longitudMaxima = 300;

    if (textoPlano.length <= longitudMaxima) {
      return html;
    }

    return this.truncarHTMLPorTexto(html, longitudMaxima);
  }

  esRedaccionTruncada(html: string): boolean {
    if (!html) return false;
    const textoPlano = this.extraerTextoDeHTML(html);
    return textoPlano.length > 300;
  }

  private extraerTextoDeHTML(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  private truncarHTMLPorTexto(html: string, longitudMaxima: number): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let textoAcumulado = 0;
    let resultadoHTML = '';

    const procesarNodo = (nodo: Node): boolean => {
      if (textoAcumulado >= longitudMaxima) {
        return false;
      }

      if (nodo.nodeType === Node.TEXT_NODE) {
        const textoNodo = nodo.textContent || '';
        const espacioRestante = longitudMaxima - textoAcumulado;

        if (textoNodo.length <= espacioRestante) {
          resultadoHTML += textoNodo;
          textoAcumulado += textoNodo.length;
          return true;
        } else {
          resultadoHTML += textoNodo.substring(0, espacioRestante) + '...';
          textoAcumulado = longitudMaxima;
          return false;
        }
      } else if (nodo.nodeType === Node.ELEMENT_NODE) {
        const elemento = nodo as Element;
        const etiqueta = elemento.tagName.toLowerCase();

        const atributos = Array.from(elemento.attributes)
          .map(attr => `${attr.name}="${attr.value}"`)
          .join(' ');

        resultadoHTML += `<${etiqueta}${atributos ? ' ' + atributos : ''}>`;

        for (let i = 0; i < nodo.childNodes.length; i++) {
          if (!procesarNodo(nodo.childNodes[i])) {
            break;
          }
        }

        resultadoHTML += `</${etiqueta}>`;
        return textoAcumulado < longitudMaxima;
      }

      return true;
    };

    for (let i = 0; i < doc.body.childNodes.length; i++) {
      if (!procesarNodo(doc.body.childNodes[i])) {
        break;
      }
    }

    return resultadoHTML;
  }

  volver(): void {
    this.router.navigate(['/administracion/clausulas'], { queryParams: { volver: 1 } });
  }

  obtenerEstadoVigencia(clausula: ClausulaDTO): string {
      if (clausula.estado === 'BORRADOR') {
        const hoy = new Date();
        const desde = clausula.fechaVigenciaDesde ? new Date(clausula.fechaVigenciaDesde) : null;
        const hasta = clausula.fechaVigenciaHasta ? new Date(clausula.fechaVigenciaHasta) : null;
  
        if (desde && hoy < desde) {
          return 'NO_VIGENTE';
        }
        if (hasta && hoy > hasta) {
          return 'NO_VIGENTE';
        }
        return 'VIGENTE';
      }
      return clausula.estado;
    }

   esBorrador(clausula: ClausulaDTO): boolean {
     return clausula.estado === 'BORRADOR';
   }

  obtenerTextoEstadoVigencia(clausula: ClausulaDTO): string {
      const estado = this.obtenerEstadoVigencia(clausula);
      if (estado === 'VIGENTE') {
        return 'Vigente';
      }
      return 'No vigente';
    }
}


