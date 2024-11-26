import { DataType, IMemoryDb, newDb } from 'pg-mem';

import moment from 'moment-timezone';
import { TABLAS_CM } from '../tablas';
import { InsertardinerosRecibidor } from '../data';

export const DBCmMem = () => {
    const dbmem = newDb();

    // Base
    inicializarTablas(dbmem);
    configurarFunciones(dbmem);
    InsertardinerosRecibidor(dbmem);
    // Interceptor
    const pg = dbmem.adapters.createPgPromise();
    pg.connect();
    return pg;
};

const inicializarTablas = (bdmen: IMemoryDb) => {
    TABLAS_CM.generarTablaDinerosRecibidor(bdmen);
};

const configurarFunciones = (dbmem: IMemoryDb) => {
    dbmem.public.registerFunction({
        name: 'trim',
        args: [DataType.text],
        returns: DataType.text,
        implementation: (x) => x.trim(),
    });

    dbmem.public.registerFunction({
        name: 'to_char',
        args: [DataType.timestamp, DataType.text],
        returns: DataType.text,
        implementation: (x, y) => {
            return moment.tz(x, 'America/Bogota').format(y);
        },
    });
};
