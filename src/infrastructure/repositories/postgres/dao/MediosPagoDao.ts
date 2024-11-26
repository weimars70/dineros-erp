import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { MediosPagoRepository } from '@infrastructure/repositories/MediosPagoRepository';
import { IMedioPagoResponse } from '@infrastructure/repositories/interfaces/IMedioPagoResponse';
import { injectable } from 'inversify';
import { IDatabase, IMain } from 'pg-promise';

@injectable()
export class MediosPagoDao implements MediosPagoRepository {
    dbDineros = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPES.dbDineros);

    public async consultarMediosPago(idMediosPago: number[]): Promise<IMedioPagoResponse[]> {
        if (!idMediosPago.length) {
            return [];
        }
        const consultarSql = `
            SELECT id_medio_pago, descripcion_medio_pago
            FROM medios_pagos
            WHERE id_medio_pago IN ($1:csv) AND estado_activo = true
            `;
        const consultarResult = await this.dbDineros.query(consultarSql, [idMediosPago]);
        if (consultarResult) {
            return consultarResult;
        }
        return [];
    }
}
