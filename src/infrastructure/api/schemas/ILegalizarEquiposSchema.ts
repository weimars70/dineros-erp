import JoiImport from 'joi';
import DateExtension from '@joi/date';
import { ILegalizacionDataIn, ILegalizarEquipoRecursoIn } from '@application/data/in/ILegalizacionDataIn';
import { messages } from './Messages';
const Joi = JoiImport.extend(DateExtension) as typeof JoiImport;

export const ILegalizarEquiposSchema = Joi.object<ILegalizacionDataIn>({
    id_transaccion: Joi.string().required().messages(messages('id_transaccion')),
    terminal: Joi.number().required().messages(messages('terminal')),
    valor: Joi.number().required().messages(messages('valor')),
    fecha_hora: Joi.date().format('YYYY-MM-DD HH:mm:ss').raw().required().messages(messages('fecha_hora')),
    recursos: Joi.array()
        .min(1)
        .items(
            Joi.object<ILegalizarEquipoRecursoIn>({
                identificador: Joi.string().required().messages(messages('identificador')),
                tipo: Joi.number().required().messages(messages('tipo')),
                valor: Joi.string().when('tipo', {
                    is: 1,
                    then: Joi.string().required().messages(messages('valor')),
                    otherwise: Joi.string().optional().allow('').messages(messages('valor')),
                }),
                medios_pago: Joi.array()
                    .items(
                        Joi.object({
                            id_medio_pago: Joi.number().required().messages(messages('id_medio_pago')),
                            valor: Joi.string().required().messages(messages('valor')),
                        }),
                    )
                    .when('tipo', {
                        is: 1,
                        then: Joi.array().min(1).required().messages(messages('medios_pago')),
                        otherwise: Joi.array().optional().allow('').messages(messages('medios_pago')),
                    }),
                observacion: Joi.string().optional().allow(null).messages(messages('observacion')),
            }),
        ),
    aliado: Joi.number().optional().allow(null).messages(messages('aliado')),
});
