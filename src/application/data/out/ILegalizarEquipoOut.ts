import { ILegalizacionesEquipoResponse } from '@infrastructure/repositories/interfaces/ILegalizarEquipo';

export interface ILegalizarEquipoOut {
    isError: boolean;
    cause: string;
    message: string;
    code: number;
}

export enum ETipoOperacion {
    LEGALIZACION = 'Legalizacion',
}

export interface IlegalizacionesEquiposOut {
    isError: boolean;
    cause: string;
    data: ILegalizacionesEquipoResponse[];
    code: number;
}

export interface IResponsableDataOut {
    id_responsable: string;
    nombre_responsable: string;
}
