import { ILegalizacionDataIn } from '@application/data/in/ILegalizacionDataIn';

export const bodyLegalizacionAliado: ILegalizacionDataIn = {
    id_transaccion: '7807dd08-fb28-4e49-a61e-82244fc86057',
    valor: '100',
    fecha_hora: '2024-10-01 14:39:18',
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
            medios_pago: [
                {
                    id_medio_pago: 1,
                    valor: '100',
                },
            ],
            valor: '100',
        },
    ],
    aliado: 123,
};

export const bodyLegalizacionNoAliado = {
    id_transaccion: '7807dd08-fb28-4e49-a61e-jxjxjxjxjx',
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
            identificador: '3002-1',
            tipo: 1,
            observacion: null,
            medios_pago: [
                {
                    id_medio_pago: 1,
                    valor: '100',
                },
            ],
            valor: '100',
        },
    ],
};

export const bodyLegalizacionAliadoNoMedioPago: ILegalizacionDataIn = {
    id_transaccion: '7807dd08-fb28-4e49-a61e-82244fc86057',
    valor: '100',
    fecha_hora: '2024-10-01 14:39:18',
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
            medios_pago: [
                {
                    id_medio_pago: 500,
                    valor: '100',
                },
            ],
            valor: '100',
        },
    ],
    aliado: 123,
};
