import { LegalizacionAppService } from '@application/services/LegalizacionAppService';
import { DEPENDENCY_CONTAINER } from '@configuration';
import { FastifyRequest, FastifyReply } from 'fastify';
import { validateData } from '../util';
import { ILegalizacionDataIn } from '@application/data/in/ILegalizacionDataIn';
import { ILegalizarEquiposSchema } from '../schemas/ILegalizarEquiposSchema';
import { IGetLegalizacionEquipoDataIn } from '@application/data/in/IGetLegalizacionEquipoDataIn';
import { IGetLegalizacionEquipoSchema } from '../schemas/IGetLegalizacionEquipoSchema';
import { IGetBolsillosAfectadosDataIn } from '@application/data/in/IGetBolsillosAfectadosDataIn';
import { IGetBolsillosAfectadosSchema } from '../schemas/IGetBolsillosAfectadosSchema';

export const legalizarEquipo = async (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply | void> => {
    const legalizationService = DEPENDENCY_CONTAINER.get(LegalizacionAppService);
    const dataVencido = validateData<ILegalizacionDataIn>(ILegalizarEquiposSchema, req.body);
    const response = await legalizationService.LegalizarEquipo(dataVencido);
    return reply.send({ ...response, id: req.id });
};

export const getLegalizaciones = async (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply | void> => {
    const legalizationService = DEPENDENCY_CONTAINER.get(LegalizacionAppService);
    const codigoEquipo = validateData<IGetLegalizacionEquipoDataIn>(IGetLegalizacionEquipoSchema, req.params);
    const response = await legalizationService.getLegalizacionesEquipo(codigoEquipo.codigo_equipo);
    return reply.send({ ...response, id: req.id });
};

export const legalizarAliado = async (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply | void> => {
    const legalizationService = DEPENDENCY_CONTAINER.get(LegalizacionAppService);
    const dataLegalizacion = validateData<ILegalizacionDataIn>(ILegalizarEquiposSchema, req.body);
    const response = await legalizationService.legalizarAliado(dataLegalizacion);
    return reply.send({ ...response, id: req.id });
};

export const getBolsillosAfectados = async (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply | void> => {
    const legalizationService = DEPENDENCY_CONTAINER.get(LegalizacionAppService);
    const idLegalizacion = validateData<IGetBolsillosAfectadosDataIn>(IGetBolsillosAfectadosSchema, req.params);
    const obtenerRespuestaBolsillosAfectados = await legalizationService.getBolsillosAfectados(
        idLegalizacion.id_legalizacion,
    );
    return reply.send({ ...obtenerRespuestaBolsillosAfectados, id: req.id });
};
