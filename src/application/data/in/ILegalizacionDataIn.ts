export interface ILegalizacionDataIn {
    id_transaccion: string;
    valor: string;
    fecha_hora: string;
    terminal: number;
    recursos: ILegalizarEquipoRecursoIn[];
    aliado?: number;
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
