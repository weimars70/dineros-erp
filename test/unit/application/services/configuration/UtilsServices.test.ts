import {
    formatearFechaBolsillo,
    sumarMediosPago,
    validarRecurso,
    validarValoresTransaccion,
} from '@application/services/configuration/UtilsServices';
import { ILegalizarEquipoRecursoIn } from '@application/data/in/ILegalizacionDataIn';

describe('UtilsServices', () => {
    describe('formatearFechaBolsillo', () => {
        it('Extraer fecha correcta', () => {
            const idBolsillo = '123-2021-09-15';
            const formattedDate = formatearFechaBolsillo(idBolsillo);
            expect(formattedDate).toBe('2021-09-15');
        });
    });

    describe('sumarMediosPago', () => {
        it('Debe sumar los valores de mediosPago correctamente', () => {
            const mediosPago = [{ valor: '10' }, { valor: '20' }, { valor: '30' }];
            const suma = sumarMediosPago(mediosPago);
            expect(suma).toBe(60);
        });
    });

    describe('validarRecurso', () => {
        it('Debería devolver verdadero si la suma de mediosPago es igual al valor del recurso', () => {
            const recurso: ILegalizarEquipoRecursoIn = {
                tipo: 1,
                identificador: '1',
                valor: '60',
                medios_pago: [
                    { id_medio_pago: 1, valor: '10' },
                    { id_medio_pago: 2, valor: '20' },
                    { id_medio_pago: 3, valor: '30' },
                ],
            };
            const isValid = validarRecurso(recurso);
            expect(isValid).toBe(true);
        });

        it('Debe devolver false si la suma de mediosPago no es igual al valor del recurso', () => {
            const recurso: ILegalizarEquipoRecursoIn = {
                tipo: 1,
                identificador: '1',
                valor: '60',
                medios_pago: [
                    { id_medio_pago: 1, valor: '20' },
                    { id_medio_pago: 2, valor: '20' },
                    { id_medio_pago: 3, valor: '30' },
                ],
            };
            const isValid = validarRecurso(recurso);
            expect(isValid).toBe(false);
        });
    });

    describe('validarSumaValores', () => {
        it('Debe devolver isValid verdadero si todos los recursos son válidos y la suma es igual a valorLegalizacion', () => {
            const recursos: ILegalizarEquipoRecursoIn[] = [
                {
                    tipo: 1,
                    identificador: '1',
                    valor: '60',
                    medios_pago: [
                        { id_medio_pago: 1, valor: '10' },
                        { id_medio_pago: 2, valor: '20' },
                        { id_medio_pago: 3, valor: '30' },
                    ],
                },
                {
                    tipo: 1,
                    identificador: '1',
                    valor: '60',
                    medios_pago: [
                        { id_medio_pago: 1, valor: '10' },
                        { id_medio_pago: 2, valor: '20' },
                        { id_medio_pago: 3, valor: '30' },
                    ],
                },
            ];
            const valorLegalizacion = '120';
            const result = validarValoresTransaccion(recursos, valorLegalizacion);
            expect(result.isValid).toBe(true);
            expect(result.message).toBe('');
        });

        it('Debe devolver isValid false si algun recurso no es válido', () => {
            const recursos: ILegalizarEquipoRecursoIn[] = [
                {
                    tipo: 1,
                    identificador: '1',
                    valor: '60',
                    medios_pago: [
                        { id_medio_pago: 1, valor: '20' },
                        { id_medio_pago: 2, valor: '20' },
                        { id_medio_pago: 3, valor: '30' },
                    ],
                },
                {
                    tipo: 1,
                    identificador: '1',
                    valor: '60',
                    medios_pago: [
                        { id_medio_pago: 1, valor: '20' },
                        { id_medio_pago: 2, valor: '20' },
                        { id_medio_pago: 3, valor: '30' },
                    ],
                },
            ];
            const valorLegalizacion = '60';
            const result = validarValoresTransaccion(recursos, valorLegalizacion);
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('La suma de los medios de pago no es igual al valor de la legalización');
        });

        it('Debe devolver isValid false si la suma de recursos no es igual a valorLegalizacion', () => {
            const recursos: ILegalizarEquipoRecursoIn[] = [
                {
                    tipo: 1,
                    identificador: '1',
                    valor: '60',
                    medios_pago: [
                        { id_medio_pago: 1, valor: '10' },
                        { id_medio_pago: 2, valor: '20' },
                        { id_medio_pago: 3, valor: '30' },
                    ],
                },
                {
                    tipo: 1,
                    identificador: '1',
                    valor: '60',
                    medios_pago: [
                        { id_medio_pago: 1, valor: '10' },
                        { id_medio_pago: 2, valor: '20' },
                        { id_medio_pago: 3, valor: '30' },
                    ],
                },
            ];
            const valorLegalizacion = '70';
            const result = validarValoresTransaccion(recursos, valorLegalizacion);
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('La suma de los recursos no es igual al valor de la transacción');
        });
    });
});
