import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Clausula } from '../../../models/clausula.model';
import { ClausulaService } from '../../../services/clausula.service';
import { IColumnaOrden } from '../../../../../shared/models/common/columna-orden.model';
import { FechaPipe } from '../../../../../shared/pipes/fecha.pipe';

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
  versiones: Clausula[] = [];
  versionesFiltradas: Clausula[] = [];
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

  obtenerResumenTiposCompra(clausula: Clausula): string {
    return clausula.tiposCompra
      .map(tc => {
        const subtipos = tc.subtipos.map(st => st.subtipoCompraDescripcion).join(', ');
        return `${tc.tipoCompraDescripcion} | ${subtipos}`;
      })
      .join(' • ');
  }

  obtenerResumenObjetosCompra(clausula: Clausula): string {
    return clausula.objetosCompra
      .map(oc => {
        const partes = [oc.familiaDescripcion];
        if (oc.subfamiliaDescripcion) partes.push(oc.subfamiliaDescripcion);
        if (oc.claseDescripcion) partes.push(oc.claseDescripcion);
        if (oc.subclaseDescripcion) partes.push(oc.subclaseDescripcion);

        let resultado = partes.join(' | ');

        if (oc.articulo) {
          resultado += ` | ${oc.articulo.articuloDescripcion} (${oc.articulo.articuloCodigo})`;
        }

        return resultado;
      })
      .join(' • ');
  }

  obtenerResumenIncisos(clausula: Clausula): string {
    return clausula.incisos
      .map(i => {
        const inciso = `${i.incisoCodigo} - ${i.incisoDescripcion}`;
        if (i.unidadEjecutora) {
          return `${inciso} | ${i.unidadEjecutora.unidadEjecutoraCodigo} - ${i.unidadEjecutora.unidadEjecutoraDescripcion}`;
        }
        return inciso;
      })
      .join(' • ');
  }

  obtenerTextoVigencia(clausula: Clausula): string {
    const desde = clausula.fechaVigenciaDesde
      ? this.fechaPipe.transform(clausula.fechaVigenciaDesde)
      : '';
    const hasta = clausula.fechaVigenciaHasta
      ? this.fechaPipe.transform(clausula.fechaVigenciaHasta)
      : '';
    return `${desde} - ${hasta}`;
  }

  obtenerFechaAprobacion(clausula: Clausula): string {
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
    this.router.navigate(['/pliegos/clausulas'], { queryParams: { volver: 1 } });
  }
}
