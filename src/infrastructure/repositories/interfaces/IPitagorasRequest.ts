export interface IPitagorasRequest {
    id_transaccion: number;
}

export interface IDetalleLegalizacion {
    fecha: Date;
    terminal: number;
    recibidor: number;
    equipo: string;
    valor: number;
    forma_de_pago: number;
    entrega: number;
    prefijo: string;
    factura: string;
    banco: string;
    cheque: string;
    cuenta_cheque: string;
    cuenta_cartera: number;
    usuario: string;
}

export interface IDetalleLegalizacionList {
    registros: IDetalleLegalizacion[];
}
