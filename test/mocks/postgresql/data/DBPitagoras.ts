import { IMemoryDb } from 'pg-mem';

export const InsertardinerosRecibidor = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO dineros_recibidor (fecha,terminal,recibidor,equipo,valor,forma_de_pago,
                        entrega,prefijo,factura,banco,cheque,cuenta_cheque,cuenta_cartera,usuario)
        VALUES
        ('2024-11-26',2,8715,'149',200000.0,1,1,'','','','','',0,'weimar'),
        ('2024-11-26',2,8715,'149',200000.0,2,1,'','','','','',0,'Diego')`);
};
