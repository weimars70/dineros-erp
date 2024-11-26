import { IMedioPagoResponse } from './interfaces/IMedioPagoResponse';

export interface MediosPagoRepository {
    consultarMediosPago(idMedioPago: number[]): Promise<IMedioPagoResponse[]>;
}
