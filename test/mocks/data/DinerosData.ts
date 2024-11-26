import { ILegalizarEquipoIn } from '@infrastructure/repositories/interfaces/ILegalizarEquipo';

export const bodyLegalizacion: ILegalizarEquipoIn = {
    id_transaccion: '7807dd08-fb28-4e49-a61e-82244fc86057',
    valor: '100',
    fecha_hora: '2024-08-01 14:39:18',
    terminal: 1,
    recursos: [
        {
            tipo: 2,
            identificador: '19165',
        },
        {
            tipo: 7,
            identificador: '019165',
        },
        {
            identificador: '3001-1',
            tipo: 1,
            observacion: null,
            valor: '100',
            medios_pago: [
                {
                    id_medio_pago: 1,
                    valor: '100',
                },
            ],
        },
    ],
};
