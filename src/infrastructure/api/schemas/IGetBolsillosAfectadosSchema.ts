import JoiImport from 'joi';
import DateExtension from '@joi/date';
import { messages } from './Messages';
import { IGetBolsillosAfectadosDataIn } from '@application/data/in/IGetBolsillosAfectadosDataIn';
const Joi = JoiImport.extend(DateExtension) as typeof JoiImport;

export const IGetBolsillosAfectadosSchema = Joi.object<IGetBolsillosAfectadosDataIn>({
    id_legalizacion: Joi.number().required().messages(messages('id_legalizacion')),
});
