import Joi from 'joi';
import { messages } from './Messages';
import { IPitagorasRequest } from '@infrastructure/repositories/interfaces/IPitagorasRequest';

export const IPitagorasSchema = Joi.object<IPitagorasRequest>({
    id_transaccion: Joi.number().required().messages(messages('id_transaccion')),
});
