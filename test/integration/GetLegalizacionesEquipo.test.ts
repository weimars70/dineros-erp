import { application } from '@infrastructure/api/Application';
import { PREFIX } from '@util';
import { bodyLegalizacion } from '../mocks/data';
import { mockApiAxios } from '../jest.setup';

describe('Obtener las legalizaciones de un equipo', () => {
    it('Get legalizaciones de ultimos 30 dias', async () => {
        mockApiAxios.mockReturnValueOnce(
            Promise.resolve({
                status: 200,
                data: {
                    isError: false,
                    data: 'JUAN CARLOS ESPINOSA DUQUE',
                    timestamp: '2030-07-21T17:32:28Z',
                },
            }),
        );

        mockApiAxios.mockReturnValueOnce(
            Promise.resolve({
                status: 200,
                data: {
                    isError: false,
                    data: 'JUAN CARLOS ESPINOSA DUQUE',
                    timestamp: '2030-07-21T17:32:28Z',
                },
            }),
        );

        //Act
        const response = await application.inject({
            method: 'GET',
            url: `${PREFIX}/legalizaciones/equipos/3001-1`,
            payload: bodyLegalizacion,
        });

        const payload = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toBe(200);
        /*const expected = JSON.stringify([
            {
                fecha_hora_legalizacion: '2024-08-12T14:39:18.000Z',
                valor: 50000,
                identificador_recurso: '019165',
                nombre_responsable: 'JUAN CARLOS ESPINOSA DUQUE',
            },
            {
                fecha_hora_legalizacion: '2024-08-01T14:39:18.000Z',
                valor: 100,
                identificador_recurso: '019165',
                nombre_responsable: 'JUAN CARLOS ESPINOSA DUQUE',
            },
        ]);*/
        expect(JSON.stringify(payload.data)).toBe('[]');
    });
});
