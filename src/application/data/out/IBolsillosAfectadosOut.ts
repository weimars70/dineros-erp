import { IBolsillosAfectadosResponse } from '@infrastructure/repositories/interfaces/IBolsillosAfectados';

export interface IBolsillosAfectadosOut {
    isError: boolean;
    cause: string;
    data: IBolsillosAfectadosData | null;
    code: number;
}

export interface IBolsillosAfectadosData {
    sobrante: number | null;
    movimientos: IBolsillosAfectadosResponse[] | null;
}
