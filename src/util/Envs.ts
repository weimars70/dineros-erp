export const NODE_ENV = process.env.NODE_ENV?.toLowerCase() ?? 'local';

export const GCP_PROJECT = process.env.GCP_PROJECT ?? 'cm-dineros-dev';

export const TOPIC_PUBSUB_BOLSILLO = process.env.TOPIC_PUBSUB_BOLSILLO ?? 'middleware-bolsillo';

export const PREFIX = process.env.DOMAIN
    ? `/${process.env.DOMAIN}/${process.env.SERVICE_NAME}/v1`
    : '/dineros/cm-dineros-legalizaciones/v1';

export const HOST = process.env.HOST ?? 'localhost';

export const URL_RECAUDO =
    process.env.URL_RECAUDO ?? 'https://apiv2-dev.coordinadora.com/dineros/cm-dineros-recaudos-ms/recaudos';

export const URL_CONSULTA_EQUIPO =
    process.env.URL_CONSULTA_EQUIPO ??
    'https://api-testing.coordinadora.com/cm-maestros-equipos-consulta/api/v1/equipos/';

export const URL_CONSULTA_ALIADO =
    process.env.URL_CONSULTA_ALIADO ??
    'https://apiv2-dev.coordinadora.com/sigo-acuerdos/cm-aliados-consulta-ms/aliados/equipos/dias_legalizacion/';

export const URL_CONSULTA_EQUIPO_ALIADO =
    process.env.URL_CONSULTA_EQUIPO_ALIADO ??
    'https://apiv2-dev.coordinadora.com/sigo-acuerdos/cm-aliados-consulta-ms/equipos-aliado';

export const URL_API_AUTORIZAR_ALIADO =
    process.env.URL_API_AUTORIZAR_ALIADO ??
    'https://apiv2-dev.coordinadora.com/dineros/cm-dineros-recursos/aliado/autorizar/';

export const API_RECURSOS =
    process.env.API_RECURSOS ?? 'https://apiv2-dev.coordinadora.com/dineros/cm-dineros-recursos/responsable/';

export const REDIS_PORT = process.env.REDIS_PORT ?? '6379';
export const REDIS_HOST = process.env.REDIS_HOST ?? 'localhost';
export const REDIS_PASS = process.env.REDIS_PASS ?? '';
export const REDIS_TIEMPO_VENCIMIENTO = process.env.REDIS_TIEMPO_VENCIMIENTO ?? '7200';

// Dineros DB
export const POSTGRES_HOST = process.env.POSTGRES_HOST ?? 'localhost';
export const POSTGRES_USER = process.env.POSTGRES_USER ?? 'postgres';
export const POSTGRES_PASS = process.env.POSTGRES_PASS ?? 'password';
export const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE ?? 'postgres';
export const PG_PORT = process.env.PG_PORT ?? 5432;

// CM DB
export const CM_POSTGRES_HOST = process.env.CM_POSTGRES_HOST ?? 'localhost';
export const CM_POSTGRES_USER = process.env.CM_POSTGRES_USER ?? 'postgres';
export const CM_POSTGRES_PASS = process.env.CM_POSTGRES_PASS ?? 'password';
export const CM_POSTGRES_DATABASE = process.env.CM_POSTGRES_DATABASE ?? 'postgres';
export const CM_PG_PORT = process.env.CM_PG_PORT ?? 5432;
