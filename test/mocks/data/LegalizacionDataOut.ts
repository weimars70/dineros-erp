import { ILegalizarEquipoOut } from '../../../src/application/data/out';

export const mockLegalizarAliadoOk: ILegalizarEquipoOut = {
    isError: false,
    message: 'Legalizacion creada con exito',
    cause: '',
    code: 201,
};

export const mockLegalizarAliadoError: ILegalizarEquipoOut = {
    isError: false,
    message: 'No puede legalizar el equipo',
    cause: '',
    code: 201,
};
