import { injectable } from 'inversify';
import 'reflect-metadata';
import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { PitagorasRepository } from '@infrastructure/repositories/PitagorasRepository';
import { IPitagorasRequest } from '@infrastructure/repositories/interfaces/IPitagorasRequest';
import { DataBaseError } from '@domain/exceptions';

@injectable()
export class PitagorasService {
    private pitagorasRepository = DEPENDENCY_CONTAINER.get<PitagorasRepository>(TYPES.PitagorasRepository);

    async insertRecaudo(data: IPitagorasRequest): Promise<{ message: string; code: number }> {
        const detalle = await this.pitagorasRepository.getDetalleLegalizacion(data.id_transaccion);
        console.log(detalle);
        if (!detalle) {
            throw new DataBaseError('NOT_FOUND', 'No se encontró el detalle de legalización');
        }

        await this.pitagorasRepository.insertRecaudoAndUpdateEstado(detalle, data.id_transaccion);

        return {
            message: 'Registro procesado exitosamente',
            code: 201,
        };
    }
}
