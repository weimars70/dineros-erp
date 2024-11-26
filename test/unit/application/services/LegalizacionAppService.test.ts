import { LegalizacionAppService } from '@application/services';
import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { bodyLegalizacionAliado } from '../../../mocks/data';
import { IBolsilloPubSubRepository } from '@infrastructure/pubsub/IBolsilloPubSub';
import { Redis } from '@infrastructure/redis';
import { LegalizacionRepository } from '@infrastructure/repositories/LegalizacionRepository';
import { AliadosApiService } from '@infrastructure/api-client/aliados-api/AliadosApiService';
import { MediosPagoRepository } from '@infrastructure/repositories/MediosPagoRepository';
import { ResponsableApiService } from '@infrastructure/api-client/maestros-api/ResponsableApiService';

describe('LegalizacionAppService', () => {
    let legalizacionAppService: LegalizacionAppService;
    let mockPubSubPublisher: jest.Mocked<IBolsilloPubSubRepository>;
    let mockRedisClient: jest.Mocked<Redis>;
    let mockPostgresRepository: jest.Mocked<LegalizacionRepository>;
    let mockAliadosApi: jest.Mocked<AliadosApiService>;
    let mockMediosPagoRepository: jest.Mocked<MediosPagoRepository>;
    let mockResponsableApi: jest.Mocked<ResponsableApiService>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockPubSubPublisher = {
            crearBolsillo: jest.fn().mockResolvedValue('OK'),
        };

        mockRedisClient = {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(true),
        } as any;

        mockPostgresRepository = {
            getRecursoId: jest.fn().mockResolvedValue(1),
            legalizarEquipo: jest.fn().mockResolvedValue([1]),
            getBolsilloEquipoAliado: jest.fn().mockResolvedValue({
                bolsillo: true,
                id_responsable: 1,
                valor_total: 1000,
                valor_no_vencido: 1000,
                valor_vencido: 0,
            }),
        } as any;

        mockAliadosApi = {
            consultaAliadoAutorizado: jest.fn().mockResolvedValue(true),
        } as any;

        mockMediosPagoRepository = {
            consultarMediosPago: jest
                .fn()
                .mockResolvedValue([{ id_medio_pago: 1, descripcion_medio_pago: 'Efectivo' }]),
        } as any;

        mockResponsableApi = {
            consultaResponsable: jest.fn().mockResolvedValue('Test Responsable'),
        } as any;

        // Mock del container
        (DEPENDENCY_CONTAINER.get as jest.Mock) = jest.fn((token: symbol) => {
            const mocks: { [key: string]: any } = {
                [TYPES.PubSubBolsillo.toString()]: mockPubSubPublisher,
                [TYPES.RedisClient.toString()]: mockRedisClient,
                [TYPES.SetDataRepository.toString()]: mockPostgresRepository,
                [TYPES.MediosPagoRepository.toString()]: mockMediosPagoRepository,
                AliadosApiService: mockAliadosApi,
                ResponsableApiService: mockResponsableApi,
            };
            return mocks[token.toString()] || mocks[token.description || token.toString()] || null;
        });

        legalizacionAppService = new LegalizacionAppService();
    });

    describe('legalizarAliado', () => {
        it('debe completar el flujo de legalización exitosamente', async () => {
            // Act
            const result = await legalizacionAppService.legalizarAliado(bodyLegalizacionAliado);

            // Assert
            expect(mockMediosPagoRepository.consultarMediosPago).toHaveBeenCalled();
            expect(mockPostgresRepository.getRecursoId).toHaveBeenCalled();
            expect(mockPostgresRepository.legalizarEquipo).toHaveBeenCalled();
            expect(mockPubSubPublisher.crearBolsillo).toHaveBeenCalledWith({
                operacion: 'legalizacion',
                id_transaccion: '1',
            });
            expect(result).toEqual({
                isError: false,
                message: 'Legalizacion creada con exito',
                cause: '',
                code: 201,
            });
        });
    });
});
