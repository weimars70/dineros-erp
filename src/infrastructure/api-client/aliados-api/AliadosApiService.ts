import axios from 'axios';
import { injectable } from 'inversify';
import { URL_API_AUTORIZAR_ALIADO, URL_CONSULTA_ALIADO, URL_CONSULTA_EQUIPO, URL_CONSULTA_EQUIPO_ALIADO } from '@util';
import { Equipo, ResponseGenerico } from '../maestros-api/interfaces/IMaestrosResponse';
import { ApiRequestException } from '@domain/exceptions';
import { ResponseAliados, ResponseAliadosMaestros, ResponseEquipos } from './interfaces/IAliadosResponse';
@injectable()
export class AliadosApiService {
    async consultaAliadoAutorizado(aliado: number): Promise<boolean> {
        try {
            const recaudo = await axios<ResponseGenerico<boolean>>({
                method: 'GET',
                url: URL_API_AUTORIZAR_ALIADO + `${aliado}`,
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
            return false;
        }
    }

    async consultaEquipo(equipo: string): Promise<ResponseEquipos> {
        try {
            const recaudo = await axios<ResponseEquipos>({
                method: 'GET',
                url: URL_CONSULTA_EQUIPO + `${equipo}`,
            });
            return recaudo.data;
        } catch (error) {
            console.error('apiServiceAxios.consultaEquipo', 'Consulta Equipo', error);
            throw error;
        }
    }

    async consultaAliadoEquipo(equipo: string): Promise<ResponseAliados> {
        try {
            const recaudo = await axios<ResponseAliados>({
                method: 'get',
                url: URL_CONSULTA_ALIADO + `${equipo}`,
            });
            return recaudo.data;
        } catch (error: any) {
            console.error('apiServiceAxios.consultaAliadoEquipo', 'Consulta Aliado Equipo', error);
            throw new ApiRequestException('Equipo no esta asociado a ningun aliado', error);
        }
    }

    async consultaAliadoEquipoMaestros(aliado: string): Promise<Equipo[]> {
        try {
            const recaudo = await axios<ResponseAliadosMaestros>({
                method: 'POST',
                url: URL_CONSULTA_EQUIPO_ALIADO,
                data: {
                    codigos_equipos: aliado,
                },
            });
            return recaudo.data.data.equipos;
        } catch (error) {
            console.error('apiServiceAxios.consultaAliadoEquipo', 'Consulta Aliado Equipo', error);
            throw error; // Lanzar el error para que el cliente pueda manejarlo
        }
    }
}
