import { DataType, IMemoryDb, newDb } from 'pg-mem';
import { TABLAS_DINEROS } from '../tablas';
import {
    insertarAliadosEquipos,
    insertarLegalizacion,
    insertarMediosPago,
    insertarRecurso,
    insertarTipoTransacciones,
    insertarTiposRecursos,
    insertarTraslado,
    insertarLegalizacionBolsillo,
} from '../data';
import moment from 'moment-timezone';

export const DBDinerosMem = () => {
    const dbmem = newDb();

    //Base
    inicializarTablas(dbmem);
    configurarFunciones(dbmem);
    poblarInformacion(dbmem);

    // Interceptor

    const pg = dbmem.adapters.createPgPromise();
    pg.connect();
    return pg;
};

const inicializarTablas = (bdmen: IMemoryDb) => {
    TABLAS_DINEROS.generarSecuenciaTraslados(bdmen);
    TABLAS_DINEROS.generarReciboCaja(bdmen);
    TABLAS_DINEROS.generarTablaTiposRecursos(bdmen);
    TABLAS_DINEROS.generarTablaRecursos(bdmen);
    TABLAS_DINEROS.generarTablaInconsistencias(bdmen);
    TABLAS_DINEROS.generarTablaBolsillo(bdmen);
    TABLAS_DINEROS.generarTablaTraslados(bdmen);
    TABLAS_DINEROS.generarTipoTransacciones(bdmen);
    TABLAS_DINEROS.generarTablaRecursoTransaccionesTraslado(bdmen);
    TABLAS_DINEROS.generarTablaMediosPagos(bdmen);
    TABLAS_DINEROS.generarTablaLegalizaciones(bdmen);
    TABLAS_DINEROS.generarTablaTransacciones(bdmen);
    TABLAS_DINEROS.generarAliadosEquipos(bdmen);
    TABLAS_DINEROS.generarTablaLegalizacionBolsillo(bdmen);
    TABLAS_DINEROS.generarTablaDetalleLegalizaciones(bdmen);
};

const poblarInformacion = (dbmem: IMemoryDb) => {
    //Agregar datos a las tablas
    insertarTiposRecursos(dbmem);
    insertarTipoTransacciones(dbmem);
    insertarRecurso(dbmem);
    insertarTraslado(dbmem);
    insertarMediosPago(dbmem);
    insertarLegalizacion(dbmem);
    insertarAliadosEquipos(dbmem);
    insertarLegalizacionBolsillo(dbmem);
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
