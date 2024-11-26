import { IMemoryDb } from 'pg-mem';

export const insertarTiposRecursos = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO public.tipos_recursos
        (id_tipo_recurso,descripcion_recursos,informacion_adicional)
        VALUES
        (1,'Equipo',false),
        (2,'CodigoCm',false),
        (3,'Guia',false),
        (4,'idAprobacion',false),
        (5,'facturaCM',false),
        (6,'CuentaBancaria',false),
        (7,'cajero',false);`);
};

export const insertarTipoTransacciones = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO public.tipos_transacciones
        (id_tipo_transaccion, descripcion_transaccion)
        VALUES
        (1, 'Recaudo'),
        (4, 'Legalizar'),
        (5, 'Solucion Inconsistencia');
`);
};

export const insertarRecurso = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO public.recursos (id_recurso, id_tipo_recurso, identificador_recurso)
            VALUES
            (1, 1, '3001-1'),
            (2, 1, '3002-1'),
            (11, 2, '19165'),
            (10, 7, '019165')
;
`);
};

export const insertarTraslado = (bdmen: IMemoryDb): void => {
    bdmen.public
        .none(`INSERT INTO public.traslados (id_traslado, recurso_destino, fecha_hora_traslado, valor, estado, tenencia, soporte, medio_pago, terminal)
            VALUES
            ('7807dd08-fb28-4e49-a61e-82244fc86dxc', 10, '2024-08-01 14:39:18.000000', 50000, null, null, null, null, 1),
             ('7807dd08-fb28-4e49-a61e-82244fc86ccc', 10, '2024-08-15 11:39:18.000000', 100, null, null, null, null, 1);
            ;
`);
};

export const insertarLegalizacion = (bdmen: IMemoryDb): void => {
    bdmen.public
        .none(`INSERT INTO public.legalizaciones (id_legalizacion, id_recibo, id_traslado, fecha_hora_legalizacion, numero_aprobacion, fecha_aprobacion, valor, recurso) VALUES
        (7662, null, '7807dd08-fb28-4e49-a61e-82244fc86dxc', '2024-08-12 14:39:18.000000', null, null, 50000, 1),
        (7661, null, '7807dd08-fb28-4e49-a61e-82244fc86ccc', '2024-08-01 14:39:18.000000', null, null, 100, 1);
`);
};

export const insertarAliadosEquipos = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`
        INSERT INTO public.aliados_equipos (aliado, id_equipo, dias_legalizacion)
        VALUES
        (123, 1, 5);
    `);
};

export const insertarMediosPago = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO public.medios_pagos
        (id_medio_pago,descripcion_medio_pago,estado_activo)
        VALUES
        (1,'Efectivo', true),
        (2,'Cheche local', true),
        (3,'Cheche Nacional', false),
        (4,'Transferencia electronica', true),
        (5,'Tarjeta', true),
        (6,'Pendiente pago', true),
        (7,'Consig. Directa Efectivo', true),
        (8,'Consig. Directa Cheque', false),
        (9,'PSE', true),
        (10,'Credito', true);`);
};

export const insertarLegalizacionBolsillo = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`
        INSERT INTO public.legalizacion_bolsillo (id_bolsillo, id_legalizacion, valor, valor_inicial_bolsillo, valor_final_bolsillo)
        VALUES
        ('1-2024-10-03', 7662, 50000, 50000, 50000);
    `);
};
