import {
    PG_PORT,
    POSTGRES_DATABASE,
    POSTGRES_HOST,
    POSTGRES_PASS,
    POSTGRES_USER,
    CM_PG_PORT,
    CM_POSTGRES_DATABASE,
    CM_POSTGRES_HOST,
    CM_POSTGRES_PASS,
    CM_POSTGRES_USER,
} from '@util';
import pgPromise, { IMain, IDatabase } from 'pg-promise';
import { IConnectionParameters } from 'pg-promise/typescript/pg-subset';

const PG_CONECTION: IConnectionParameters = {
    host: POSTGRES_HOST,
    port: +PG_PORT,
    user: POSTGRES_USER,
    password: POSTGRES_PASS,
    database: POSTGRES_DATABASE,
    connectionTimeoutMillis: 10000000,
    max: 30,
    idleTimeoutMillis: 30000000,
    query_timeout: 25000000,
};

const CM_PG_CONNECTION: IConnectionParameters = {
    host: CM_POSTGRES_HOST,
    port: +CM_PG_PORT,
    user: CM_POSTGRES_USER,
    password: CM_POSTGRES_PASS,
    database: CM_POSTGRES_DATABASE,
    connectionTimeoutMillis: 10000000,
    max: 30,
    idleTimeoutMillis: 30000000,
    query_timeout: 25000000,
};
const pgp: IMain = pgPromise();
pgp.pg.types.setTypeParser(pgp.pg.types.builtins.NUMERIC, (value: string) => parseFloat(value));

export const dineros = pgp(PG_CONECTION) as IDatabase<IMain>;
export const cm = pgp(CM_PG_CONNECTION) as IDatabase<IMain>;
