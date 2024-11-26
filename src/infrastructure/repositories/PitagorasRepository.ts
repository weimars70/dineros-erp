import { IDetalleLegalizacionList } from './interfaces';

export interface PitagorasRepository {
    getDetalleLegalizacion(idTransaccion: number): Promise<IDetalleLegalizacionList | null>;
    insertRecaudoAndUpdateEstado(detalle: IDetalleLegalizacionList, idTransaccion: number): Promise<boolean>;
}
