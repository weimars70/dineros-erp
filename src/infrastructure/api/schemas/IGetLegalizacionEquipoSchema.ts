import JoiImport from 'joi';
import DateExtension from '@joi/date';
import { messages } from './Messages';
import { IGetLegalizacionEquipoDataIn } from '@application/data/in/IGetLegalizacionEquipoDataIn';
const Joi = JoiImport.extend(DateExtension) as typeof JoiImport;

export const IGetLegalizacionEquipoSchema = Joi.object<IGetLegalizacionEquipoDataIn>({
    codigo_equipo: Joi.string().required().messages(messages('codigo_equipo')),
});
