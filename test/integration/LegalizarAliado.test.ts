import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { application } from '@infrastructure/api/Application';
import { IBolsilloPubSubRepository } from '@infrastructure/pubsub/IBolsilloPubSub';
import { PREFIX } from '@util';
import { bodyLegalizacionNoAliado } from '../mocks/data';
import { bodyLegalizacionAliado, bodyLegalizacionAliadoNoMedioPago } from '../mocks/data/LegalizacionDataIn';
import { DBMemRepositoryTestFactory } from '../mocks/factories';

describe('Legalizar Aliado', () => {
    it('Legalizar equipo externo desde el Front - Status 200', async () => {
        // Arrange
        const pubsub = DEPENDENCY_CONTAINER.get<IBolsilloPubSubRepository>(TYPES.PubSubBolsillo);
        const spyPubSub = jest.spyOn(pubsub, 'crearBolsillo');
        const query = `SELECT * FROM legalizaciones WHERE recurso = 1 AND TO_CHAR(fecha_hora_legalizacion, 'YYYY-MM-DD') = '2024-10-01'`;
        const repositoryTestFactory = new DBMemRepositoryTestFactory();
        const repository = repositoryTestFactory.create(TYPES.dbDineros);

        //Act
        const response = await application.inject({
            method: 'POST',
            url: `${PREFIX}/legalizaciones/aliados`,
            payload: { ...bodyLegalizacionAliado },
        });
        const payload = JSON.parse(response.payload);
        const resultadoQuery = await repository.executeQuery(query);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(payload).toHaveProperty('message', 'Legalizacion creada con exito');
        expect(spyPubSub).toHaveBeenCalled();
        expect(resultadoQuery).toHaveLength(1);
        expect(resultadoQuery[0].valor).toBe(100);
        expect(resultadoQuery[0].recurso).toBe(1);
    });

    it('Legalizar equipo externo desde el Front No existe Aliado - Status 200', async () => {
        // Arrange
        const pubsub = DEPENDENCY_CONTAINER.get<IBolsilloPubSubRepository>(TYPES.PubSubBolsillo);
        const spyPubSub = jest.spyOn(pubsub, 'crearBolsillo');

        //Act
        const response = await application.inject({
            method: 'POST',
            url: `${PREFIX}/legalizaciones/aliados`,
            payload: bodyLegalizacionNoAliado,
        });
        const payload = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(payload).toHaveProperty('message', 'No puede legalizar el equipo, aliado no válido');
        expect(spyPubSub).toHaveBeenCalledTimes(0);
    });

    it('Legalizar equipo externo desde el Front No existe Medio Pago - Status 200', async () => {
        // Arrange
        const pubsub = DEPENDENCY_CONTAINER.get<IBolsilloPubSubRepository>(TYPES.PubSubBolsillo);
        const spyPubSub = jest.spyOn(pubsub, 'crearBolsillo');

        //Act
        const response = await application.inject({
            method: 'POST',
            url: `${PREFIX}/legalizaciones/aliados`,
            payload: bodyLegalizacionAliadoNoMedioPago,
        });
        const payload = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(payload).toHaveProperty('message', 'No se puede legalizar el equipo. Medios de pago no son válidos');
        expect(spyPubSub).toHaveBeenCalledTimes(0);
    });
});
