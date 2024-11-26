import axios from 'axios';
import { injectable } from 'inversify';
import { API_RECURSOS } from '@util';
import { ResponseGenerico } from './interfaces/IMaestrosResponse';
import { ApiRequestException } from '@domain/exceptions';
@injectable()
export class ResponsableApiService {
    async consultaResponsable(aliado: string): Promise<string> {
        try {
            const recaudo = await axios<ResponseGenerico<string>>({
                method: 'GET',
                url: API_RECURSOS + `${aliado}`,
            });
            if (recaudo.data.isError) {
                throw new ApiRequestException(
                    'No se pudo obtener información del aliado',
                    'Error al consultar el aliado',
                );
            }
            return recaudo.data.data;
        } catch (error) {
            console.error('apiServiceAxios.consultaAliadoAutorizado', 'Consulta Aliado Autorizado', error);
            return '';
        }
    }
}
