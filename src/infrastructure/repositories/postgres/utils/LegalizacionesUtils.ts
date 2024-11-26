import { IMediosPagoIn } from '../../interfaces/ILegalizarEquipo';

export function obtenerValoresMediosPago(idLegalizacion: number, mediosPago: IMediosPagoIn[] | undefined): string {
    return mediosPago?.length
        ? mediosPago.map((medio) => `(${idLegalizacion}, ${medio.id_medio_pago}, ${medio.valor})`).join(',')
        : '';
}
