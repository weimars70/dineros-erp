import { FastifySchema } from 'fastify';

export const PitagorasSchema: FastifySchema = {
    description: 'Procesa un recaudo de legalización',
    tags: ['Pitagoras'],
    summary: 'Procesa un recaudo y actualiza su estado',
    body: {
        type: 'object',
        required: ['message'],
        properties: {
            message: {
                type: 'object',
                required: ['data', 'messageId', 'publishTime'],
                properties: {
                    data: {
                        type: 'string',
                        description: 'Datos codificados en base64 que contienen el id_transaccion',
                    },
                    messageId: {
                        type: 'string',
                        description: 'ID único del mensaje',
                    },
                    publishTime: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Fecha y hora de publicación del mensaje',
                    },
                },
            },
        },
    },
    response: {
        201: {
            description: 'Recaudo procesado exitosamente',
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Registro procesado exitosamente',
                },
                code: {
                    type: 'number',
                    example: 201,
                },
                id: {
                    type: 'string',
                    description: 'ID de la petición',
                },
            },
        },
        400: {
            description: 'Error de validación',
            type: 'object',
            properties: {
                isError: {
                    type: 'boolean',
                    example: true,
                },
                message: {
                    type: 'string',
                    example: 'Los valores de entrada no son correctos.',
                },
                code: {
                    type: 'string',
                    example: 'BAD_MESSAGE',
                },
                cause: {
                    type: 'string',
                    example: 'El campo id_transaccion es obligatorio',
                },
                timestamp: {
                    type: 'string',
                    format: 'date-time',
                },
            },
        },
        500: {
            description: 'Error interno del servidor',
            type: 'object',
            properties: {
                isError: {
                    type: 'boolean',
                    example: true,
                },
                message: {
                    type: 'string',
                    example: 'Error interno del servidor',
                },
                code: {
                    type: 'string',
                    example: 'POSTGRES_ERROR',
                },
                cause: {
                    type: 'string',
                    example: 'Error al procesar el recaudo',
                },
                timestamp: {
                    type: 'string',
                    format: 'date-time',
                },
            },
        },
    },
};
