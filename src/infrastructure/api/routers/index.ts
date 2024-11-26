import { PitagorasSchema } from '../swagger/schemas';
import { getLegalizaciones, legalizarAliado, legalizarEquipo, getBolsillosAfectados } from './LegalizacionRouter';
import { FastifyInstance } from 'fastify';
import { insertRecaudo } from './PitagorasRouter';

export const initRoutes = async (application: FastifyInstance): Promise<void> => {
    application.post(`/legalizaciones/equipos`, legalizarEquipo);
    application.post(`/legalizaciones/aliados`, legalizarAliado);
    application.get(`/legalizaciones/equipos/:codigo_equipo`, getLegalizaciones);
    application.get(`/bolsillos-afectados/:id_legalizacion`, getBolsillosAfectados);
    application.post(`/pitagoras`, { schema: PitagorasSchema }, insertRecaudo);
};
