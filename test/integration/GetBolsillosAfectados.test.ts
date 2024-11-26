import { application } from '@infrastructure/api/Application';
import { PREFIX } from '@util';

describe('GetBolsillosAfectados', () => {
    it('Obtener bolsillos afectados, status 200', async () => {
        const response = await application.inject({
            method: 'GET',
            url: `${PREFIX}/bolsillos-afectados/7662`,
        });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toHaveProperty('data');
        expect(response.json().data).toHaveProperty('sobrante');
        expect(response.json().data).toHaveProperty('movimientos');
        expect(response.json().data.movimientos[0]).toHaveProperty('id_bolsillo');
        expect(response.json().data.movimientos[0]).toHaveProperty('valor_inicial_bolsillo');
        expect(response.json().data.movimientos[0]).toHaveProperty('valor_legalizado');
        expect(response.json().data.movimientos[0]).toHaveProperty('valor_final_bolsillo');
        expect(response.json().data.movimientos[0]).toHaveProperty('fecha_bolsillo_dia');
        expect(typeof response.json().data.movimientos[0].id_bolsillo).toBe('string');
        expect(typeof response.json().data.movimientos[0].valor_inicial_bolsillo).toBe('number');
        expect(typeof response.json().data.movimientos[0].valor_legalizado).toBe('number');
        expect(typeof response.json().data.movimientos[0].valor_final_bolsillo).toBe('number');
        expect(typeof response.json().data.movimientos[0].fecha_bolsillo_dia).toBe('string');
    });

    it('Obtener bolsillos afectados, no se encuentran datos, status 204', async () => {
        const response = await application.inject({
            method: 'GET',
            url: `${PREFIX}/bolsillos-afectados/100`,
        });
        expect(response.json()).toHaveProperty('code', 204);
        expect(response.json()).toHaveProperty('cause', 'No se encontraron bolsillos afectados y no hay sobrante');
    });

    it('Obtener bolsillos afectados, error en tipo de dato', async () => {
        const response = await application.inject({
            method: 'GET',
            url: `${PREFIX}/bolsillos-afectados/abc`,
        });
        expect(response.json()).toHaveProperty('code', 'BAD_MESSAGE');
    });
});
