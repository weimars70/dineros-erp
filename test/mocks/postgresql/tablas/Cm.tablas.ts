import { IMemoryDb } from 'pg-mem';

export const TABLAS_CM = {
    generarTablaDinerosRecibidor: (db: IMemoryDb) => {
        db.public.none(`
            CREATE TABLE public.dineros_recibidor (
                id_recibidor serial NOT NULL,
                fecha date NOT NULL,
                terminal integer NOT NULL,
                recibidor integer NOT NULL,
                equipo text NOT NULL,
                valor numeric NOT NULL,
                forma_de_pago integer NOT NULL,
                entrega integer NOT NULL,
                prefijo text NOT NULL,
                factura text NOT NULL,
                banco text NOT NULL,
                cheque text NOT NULL,
                cuenta_cheque text NOT NULL,
                cuenta_cartera numeric NOT NULL,
                usuario text NOT NULL,
                CONSTRAINT pk_dineros_recibidor PRIMARY KEY (id_recibidor)
            );
        `);
    },
};
