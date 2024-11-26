import { FastifyRequest, FastifyReply } from 'fastify';
import { DEPENDENCY_CONTAINER } from '@configuration';
import { validateDataPubSub } from '../util';

import { BadMessageException } from '@domain/exceptions';
import { IPitagorasSchema, PubSubPayload } from '../schemas';
import { IPitagorasRequest } from '@infrastructure/repositories/interfaces';
import { PitagorasService } from '@application/services';

export const insertRecaudo = async (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
    try {
        const pitagorasService = DEPENDENCY_CONTAINER.get(PitagorasService);
        const dataPay = req.body as PubSubPayload;
        const data = validateDataPubSub<IPitagorasRequest>(IPitagorasSchema, dataPay);
        const response = await pitagorasService.insertRecaudo(data);
        return reply.status(response.code).send({ ...response, id: req.id });
    } catch (error) {
        if (error instanceof BadMessageException) {
            return reply.status(400).send({
                isError: true,
                message: 'Los valores de entrada no son correctos.',
                code: error.code,
                cause: error.cause,
                timestamp: new Date().toISOString(),
            });
        }
        throw error;
    }
};
