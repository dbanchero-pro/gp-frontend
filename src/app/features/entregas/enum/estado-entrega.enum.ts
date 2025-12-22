export enum EstadoEntrega {
  EN_TRANSITO = 'En tránsito',
  EN_PREPARACION = 'En preparación',
  EN_CURSO = 'En curso',
  ENTREGADO = 'Entregado',
  ENTREGA_ACEPTADA = 'Entrega aceptada',
  ENTREGA_PARCIAL = 'Entrega aceptada parcial',
  ENTREGA_RECHAZADA = 'Entrega rechazada',
  CONFORMIDAD_EMITIDA = 'Conformidad emitida',
  CONFORMIDAD_PARCIAL = 'Conformidad emitida parcial',
  CONFORMIDAD_RECHAZADA = 'Conformidad rechazada',
  CONFORMIDAD_EMITIDA_CON_OBSERVACION = 'Conformidad emitida con observación',
  CONFORMIDAD_PARCIAL_CON_OBSERVACION = 'Conformidad parcial con observación'
}

export const ESTADO_ENTREGA_CODIGOS: Record<EstadoEntrega, string> = {
  [EstadoEntrega.EN_TRANSITO]: 'EN_TRANSITO',
  [EstadoEntrega.EN_PREPARACION]: 'EN_PREPARACION',
  [EstadoEntrega.EN_CURSO]: 'EN_CURSO',
  [EstadoEntrega.ENTREGADO]: 'ENTREGADO',
  [EstadoEntrega.ENTREGA_ACEPTADA]: 'ENTREGA_ACEPTADA',
  [EstadoEntrega.ENTREGA_PARCIAL]: 'ENTREGA_PARCIAL',
  [EstadoEntrega.ENTREGA_RECHAZADA]: 'ENTREGA_RECHAZADA',
  [EstadoEntrega.CONFORMIDAD_EMITIDA]: 'CONFORMIDAD_EMITIDA',
  [EstadoEntrega.CONFORMIDAD_PARCIAL]: 'CONFORMIDAD_PARCIAL',
  [EstadoEntrega.CONFORMIDAD_RECHAZADA]: 'CONFORMIDAD_RECHAZADA',
  [EstadoEntrega.CONFORMIDAD_EMITIDA_CON_OBSERVACION]: 'CONFORMIDAD_EMITIDA_CON_OBSERVACION',
  [EstadoEntrega.CONFORMIDAD_PARCIAL_CON_OBSERVACION]: 'CONFORMIDAD_PARCIAL_CON_OBSERVACION'
};

export type EstadoEntregaCodigo = (typeof ESTADO_ENTREGA_CODIGOS)[EstadoEntrega];

export interface EstadoEntregaOpcion {
  id: EstadoEntregaCodigo | null;
  nombre: string;
  aplicaBienes: boolean;
  aplicaServiciosObras: boolean;
}

export const ESTADO_ENTREGA_SEGUIMIENTO_OPCIONES: EstadoEntregaOpcion[] = [
  { id: null, nombre: 'Todos los estados', aplicaBienes: true, aplicaServiciosObras: true },
  {
    id: ESTADO_ENTREGA_CODIGOS[EstadoEntrega.EN_TRANSITO],
    nombre: EstadoEntrega.EN_TRANSITO,
    aplicaBienes: true,
    aplicaServiciosObras: false
  },
  {
    id: ESTADO_ENTREGA_CODIGOS[EstadoEntrega.EN_PREPARACION],
    nombre: EstadoEntrega.EN_PREPARACION,
    aplicaBienes: true,
    aplicaServiciosObras: false
  },
  {
    id: ESTADO_ENTREGA_CODIGOS[EstadoEntrega.EN_CURSO],
    nombre: EstadoEntrega.EN_CURSO,
    aplicaBienes: false,
    aplicaServiciosObras: true
  },
  {
    id: ESTADO_ENTREGA_CODIGOS[EstadoEntrega.ENTREGADO],
    nombre: EstadoEntrega.ENTREGADO,
    aplicaBienes: false,
    aplicaServiciosObras: true
  },
  {
    id: ESTADO_ENTREGA_CODIGOS[EstadoEntrega.ENTREGA_ACEPTADA],
    nombre: EstadoEntrega.ENTREGA_ACEPTADA,
    aplicaBienes: true,
    aplicaServiciosObras: true
  },
  {
    id: ESTADO_ENTREGA_CODIGOS[EstadoEntrega.ENTREGA_PARCIAL],
    nombre: EstadoEntrega.ENTREGA_PARCIAL,
    aplicaBienes: true,
    aplicaServiciosObras: true
  },
  {
    id: ESTADO_ENTREGA_CODIGOS[EstadoEntrega.ENTREGA_RECHAZADA],
    nombre: EstadoEntrega.ENTREGA_RECHAZADA,
    aplicaBienes: true,
    aplicaServiciosObras: true
  },
  {
    id: ESTADO_ENTREGA_CODIGOS[EstadoEntrega.CONFORMIDAD_EMITIDA],
    nombre: EstadoEntrega.CONFORMIDAD_EMITIDA,
    aplicaBienes: true,
    aplicaServiciosObras: true
  },
  {
    id: ESTADO_ENTREGA_CODIGOS[EstadoEntrega.CONFORMIDAD_PARCIAL],
    nombre: EstadoEntrega.CONFORMIDAD_PARCIAL,
    aplicaBienes: true,
    aplicaServiciosObras: true
  },
  {
    id: ESTADO_ENTREGA_CODIGOS[EstadoEntrega.CONFORMIDAD_RECHAZADA],
    nombre: EstadoEntrega.CONFORMIDAD_RECHAZADA,
    aplicaBienes: true,
    aplicaServiciosObras: true
  },
  {
    id: ESTADO_ENTREGA_CODIGOS[EstadoEntrega.CONFORMIDAD_EMITIDA_CON_OBSERVACION],
    nombre: EstadoEntrega.CONFORMIDAD_EMITIDA_CON_OBSERVACION,
    aplicaBienes: true,
    aplicaServiciosObras: true
  },
  {
    id: ESTADO_ENTREGA_CODIGOS[EstadoEntrega.CONFORMIDAD_PARCIAL_CON_OBSERVACION],
    nombre: EstadoEntrega.CONFORMIDAD_PARCIAL_CON_OBSERVACION,
    aplicaBienes: true,
    aplicaServiciosObras: true
  }
];