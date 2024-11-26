import {
    IAliadoResponse,
    IBolsilloCalculoResponseDB,
    ILegalizacionesEquipoResponse,
    ILegalizarEquipoIn,
} from './interfaces/ILegalizarEquipo';
import { IBolsillosAfectadosResponse } from './interfaces/IBolsillosAfectados';

export interface LegalizacionRepository {
    getRecursoId(recurso: string, idTipoRecurso: number): Promise<number>;
    createAliadoRecurso(aliado: number, equipo: number, dias_legalizacion: number | null): Promise<string | null>;
    getBolsilloEquipoAliado(id_responsable: number, aliado?: string): Promise<IBolsilloCalculoResponseDB | null>;
    legalizarEquipo(
        data: ILegalizarEquipoIn,
        idCajero: number,
        aliado: number,
        bolsillo: IBolsilloCalculoResponseDB | null,
    ): Promise<number[]>;
    getLegalizacionesEquipo(recurso: number): Promise<ILegalizacionesEquipoResponse[]>;
    consultarAliadoPorEquipo(idEquipo: number): Promise<IAliadoResponse>;
    getBolsillosAfectados(idLegalizacion: number): Promise<IBolsillosAfectadosResponse[] | null>;
    getSobranteBolsillo(idLegalizacion: number): Promise<number>;
}
