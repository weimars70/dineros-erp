import { application } from '@infrastructure/api/Application';
import { PREFIX } from '@util';
import { mockApiAxios } from '../jest.setup';
import { bodyLegalizacion } from '../mocks/data';
import { Redis } from '@infrastructure/redis';
import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { objectRedis } from '../mocks/data/RedisData';
import { IBolsilloPubSubRepository } from '@infrastructure/pubsub/IBolsilloPubSub';

describe('Legalizar equipo', () => {
    it('Legalizar equipo externo con registro en redis - Status 200', async () => {
        const pubsub = DEPENDENCY_CONTAINER.get<IBolsilloPubSubRepository>(TYPES.PubSubBolsillo);
        const client: Redis = DEPENDENCY_CONTAINER.get(TYPES.RedisClient);

        const spyClient = jest.spyOn(client, 'get').mockImplementation(() => Promise.resolve(objectRedis));
        const spyPubSub = jest.spyOn(pubsub, 'crearBolsillo');

        // Arrange
        mockApiAxios.mockReturnValueOnce(
            Promise.resolve({
                status: 200,
                data: {
                    isError: false,
                    data: true,
                    timestamp: '2030-07-21T17:32:28Z',
                },
            }),
        );
        //Act
        const response = await application.inject({
            method: 'POST',
            url: `${PREFIX}/legalizaciones/equipos`,
            payload: bodyLegalizacion,
        });

        const payload = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(payload).toHaveProperty('message', 'Legalizacion creada con exito');
        expect(spyClient).toHaveBeenCalled();
        expect(spyPubSub).toHaveBeenCalled();
    });

    it('Legalizar equipo externo sin registro en redis - Status 200', async () => {
        const client: Redis = DEPENDENCY_CONTAINER.get(TYPES.RedisClient);
        const pubsub = DEPENDENCY_CONTAINER.get<IBolsilloPubSubRepository>(TYPES.PubSubBolsillo);

        jest.spyOn(client, 'get').mockImplementation(() => Promise.resolve(null));
        const spyPubSub = jest.spyOn(pubsub, 'crearBolsillo');

        // Arrange
        mockApiAxios.mockReturnValueOnce(
            Promise.resolve({
                status: 200,
                data: {
                    isError: false,
                    data: {
                        id_equipo: '3001-1',
                        terminal: '1',
                        codigo_equipo: '3001',
                        nombre: 'Automatizacion goo',
                        id_categoria: 1,
                        categoria: 'Distribucion',
                        activo: true,
                        especializacion: null,
                        nombre_especializacion: null,
                        atributos_operativos: [
                            {
                                id_atributo: '1-2',
                                nombre_atributo: 'Externo',
                                id_tipo_atributo: 1,
                                nombre_tipo_atributo: 'Vinculo',
                            },
                        ],
                    },
                    timestamp: '2030-07-21T17:32:28Z',
                },
            }),
        );

        mockApiAxios.mockReturnValueOnce(
            Promise.resolve({
                status: 200,
                data: {
                    isError: false,
                    data: {
                        dias_legalizacion: 1,
                        id_aliado: 1,
                        nombre: 'Aliado 1',
                    },
                    timestamp: '2030-07-21T17:32:28Z',
                },
            }),
        );

        mockApiAxios.mockReturnValueOnce(
            Promise.resolve({
                status: 200,
                data: {
                    isError: false,
                    data: true,
                    timestamp: '2030-07-21T17:32:28Z',
                },
            }),
        );
        //Act
        const response = await application.inject({
            method: 'POST',
            url: `${PREFIX}/legalizaciones/equipos`,
            payload: { ...bodyLegalizacion, id_transaccion: '7807dd08-fb28-4e49-a61e-xccxcxxc' },
        });
        const payload = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(payload).toHaveProperty('message', 'Legalizacion creada con exito');
        expect(spyPubSub).toHaveBeenCalled();
    });

    it('Legalizar equipo interno sin registro en redis - Status 200', async () => {
        const client: Redis = DEPENDENCY_CONTAINER.get(TYPES.RedisClient);
        jest.spyOn(client, 'get').mockImplementation(() => Promise.resolve(null));

        mockApiAxios.mockReturnValueOnce(
            Promise.resolve({
                status: 200,
                data: {
                    isError: false,
                    data: {
                        id_equipo: '3001-1',
                        terminal: '1',
                        codigo_equipo: '3001',
                        nombre: 'Automatizacion goo',
                        id_categoria: 1,
                        categoria: 'Distribucion',
                        activo: true,
                        especializacion: null,
                        nombre_especializacion: null,
                        atributos_operativos: [
                            {
                                id_atributo: '1-2',
                                nombre_atributo: 'Interno',
                                id_tipo_atributo: 1,
                                nombre_tipo_atributo: 'Vinculo',
                            },
                        ],
                    },
                    timestamp: '2030-07-21T17:32:28Z',
                },
            }),
        );

        //Act
        const response = await application.inject({
            method: 'POST',
            url: `${PREFIX}/legalizaciones/equipos`,
            payload: bodyLegalizacion,
        });

        const payload = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(payload).toHaveProperty('message', 'No puede legalizar el equipo');
    });

    it('Legalizar equipo interno con registro en redis - Status 200', async () => {
        const client: Redis = DEPENDENCY_CONTAINER.get(TYPES.RedisClient);
        const spyClient = jest
            .spyOn(client, 'get')
            .mockImplementation(() => Promise.resolve({ ...objectRedis, interno: true }));

        // Arrange
        mockApiAxios.mockReturnValueOnce(
            Promise.resolve({
                status: 200,
                data: {
                    isError: false,
                    data: true,
                    timestamp: '2030-07-21T17:32:28Z',
                },
            }),
        );
        //Act
        const response = await application.inject({
            method: 'POST',
            url: `${PREFIX}/legalizaciones/equipos`,
            payload: bodyLegalizacion,
        });

        const payload = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(payload).toHaveProperty('message', 'No puede legalizar el equipo');
        expect(spyClient).toHaveBeenCalled();
    });
});
