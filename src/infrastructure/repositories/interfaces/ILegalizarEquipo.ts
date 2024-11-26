export interface ILegalizarEquipoIn {
    id_transaccion: string;
    valor: string;
    fecha_hora: string;
    terminal: number;
    recursos: ILegalizarEquipoRecursoIn[];
}

export interface ILegalizarEquipoRecursoIn {
    tipo: number;
    identificador: string;
    valor?: string;
    observacion?: string | null;
    medios_pago?: IMediosPagoIn[];
}
export interface IMediosPagoIn {
    id_medio_pago: number;
    valor: string;
}

export interface IBolsilloCalculoResponseDB {
    bolsillo: boolean;
    id_responsable: number;
    valor_total: number;
    valor_no_vencido: number;
    valor_vencido: number;
}

export interface IBolsilloCalculoResponse {
    bolsillo: boolean;
    id_responsable: number;
    valor_total: number;
    valor_no_vencido: number;
    valor_vencido: number;
    saldo_favor_inconsistencias: number;
    total_inconsistencias: number;
}

export interface ILegalizacionesEquipoResponse {
    fecha_hora_legalizacion: string;
    valor: number;
    identificador_recurso: string;
    nombre_responsable: string;
}

export interface IAliadoResponse {
    aliado: number;
    diasLegalizacion: number;
}
