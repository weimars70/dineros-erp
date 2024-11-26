import { PitagorasService } from '@application/services/PitagorasService';
import { DEPENDENCY_CONTAINER } from '@configuration';
import { PitagorasRepository } from '@infrastructure/repositories/PitagorasRepository';
import { IDetalleLegalizacion, IPitagorasRequest } from '@infrastructure/repositories/interfaces/IPitagorasRequest';

describe('PitagorasService', () => {
    let service: PitagorasService;
    let mockRepository: jest.Mocked<PitagorasRepository>;

    const mockDetalle: IDetalleLegalizacion = {
        fecha: new Date('2024-01-01'),
        terminal: 1,
        recibidor: 1001,
        equipo: 'TEST-EQ',
        valor: 1000,
        forma_de_pago: 1,
        entrega: 1,
        prefijo: '',
        factura: '',
        banco: '',
        cheque: '',
        cuenta_cheque: '',
        cuenta_cartera: 0,
        usuario: 'test_user',
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockRepository = {
            getDetalleLegalizacion: jest.fn(),
            insertRecaudoAndUpdateEstado: jest.fn(),
        } as jest.Mocked<PitagorasRepository>;

        jest.spyOn(DEPENDENCY_CONTAINER, 'get').mockReturnValue(mockRepository);

        service = new PitagorasService();
    });

    describe('insertRecaudo', () => {
        const mockRequest: IPitagorasRequest = {
            id_transaccion: 123456,
        };

        it('should process recaudo successfully', async () => {
            // Arrange
            const mockDetalleList = { registros: [mockDetalle] };
            mockRepository.getDetalleLegalizacion.mockResolvedValue(mockDetalleList);
            mockRepository.insertRecaudoAndUpdateEstado.mockResolvedValue(true);

            // Act
            const result = await service.insertRecaudo(mockRequest);

            // Assert
            expect(result).toEqual({
                message: 'Registro procesado exitosamente',
                code: 201,
            });
            expect(mockRepository.getDetalleLegalizacion).toHaveBeenCalledWith(123456);
            expect(mockRepository.insertRecaudoAndUpdateEstado).toHaveBeenCalledWith(mockDetalleList, 123456);
        });

        it('should throw error when detalle is not found', async () => {
            // Arrange
            mockRepository.getDetalleLegalizacion.mockResolvedValue(null);

            // Act & Assert
            await expect(async () => {
                await service.insertRecaudo(mockRequest);
            }).rejects.toMatchObject({
                message: 'No se encontró el detalle de legalización',
                code: 'POSTGRES_ERROR',
            });
            expect(mockRepository.getDetalleLegalizacion).toHaveBeenCalledWith(123456);
            expect(mockRepository.insertRecaudoAndUpdateEstado).not.toHaveBeenCalled();
        });

        it('should throw error when getDetalleLegalizacion fails', async () => {
            // Arrange
            const error = new Error('Error al obtener detalle');
            mockRepository.getDetalleLegalizacion.mockRejectedValue(error);

            // Act & Assert
            await expect(async () => {
                await service.insertRecaudo(mockRequest);
            }).rejects.toThrow('Error al obtener detalle');
            expect(mockRepository.getDetalleLegalizacion).toHaveBeenCalledWith(123456);
            expect(mockRepository.insertRecaudoAndUpdateEstado).not.toHaveBeenCalled();
        });

        it('should throw error when insertRecaudoAndUpdateEstado fails', async () => {
            // Arrange
            const mockDetalleList = { registros: [mockDetalle] };
            const error = new Error('Error al insertar recaudo');
            mockRepository.getDetalleLegalizacion.mockResolvedValue(mockDetalleList);
            mockRepository.insertRecaudoAndUpdateEstado.mockRejectedValue(error);

            // Act & Assert
            await expect(async () => {
                await service.insertRecaudo(mockRequest);
            }).rejects.toThrow('Error al insertar recaudo');
            expect(mockRepository.getDetalleLegalizacion).toHaveBeenCalledWith(123456);
            expect(mockRepository.insertRecaudoAndUpdateEstado).toHaveBeenCalledWith(mockDetalleList, 123456);
        });

        it('should handle database connection error', async () => {
            // Arrange
            const error = new Error('Error de conexión a la base de datos');
            mockRepository.getDetalleLegalizacion.mockRejectedValue(error);

            // Act & Assert
            await expect(async () => {
                await service.insertRecaudo(mockRequest);
            }).rejects.toThrow('Error de conexión a la base de datos');
            expect(mockRepository.getDetalleLegalizacion).toHaveBeenCalledWith(123456);
            expect(mockRepository.insertRecaudoAndUpdateEstado).not.toHaveBeenCalled();
        });
    });
});
