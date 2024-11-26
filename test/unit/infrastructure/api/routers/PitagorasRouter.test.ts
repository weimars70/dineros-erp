import { PitagorasService } from '@application/services/PitagorasService';
import { DEPENDENCY_CONTAINER } from '@configuration';
import { insertRecaudo } from '@infrastructure/api/routers/PitagorasRouter';
import { FastifyReply, FastifyRequest } from 'fastify';

jest.mock('@application/services/PitagorasService');
jest.mock('@configuration', () => ({
    DEPENDENCY_CONTAINER: {
        get: jest.fn(),
    },
}));

describe('PitagorasRouter', () => {
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;
    let pitagorasService: jest.Mocked<PitagorasService>;

    beforeEach(() => {
        mockRequest = {
            body: {},
            id: 'test-id',
        };

        mockReply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };

        pitagorasService = {
            insertRecaudo: jest.fn(),
        } as unknown as jest.Mocked<PitagorasService>;

        (DEPENDENCY_CONTAINER.get as jest.Mock).mockReturnValue(pitagorasService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should process recaudo successfully', async () => {
        // Arrange
        const mockResponse = {
            message: 'Registro procesado exitosamente',
            code: 201,
        };

        mockRequest.body = {
            message: {
                data: Buffer.from(JSON.stringify({ id_transaccion: 123456 })).toString('base64'),
                messageId: 'test-message-id',
                publishTime: new Date().toISOString(),
            },
        };

        pitagorasService.insertRecaudo.mockResolvedValue(mockResponse);

        // Act
        await insertRecaudo(mockRequest as FastifyRequest, mockReply as FastifyReply);

        // Assert
        expect(mockReply.status).toHaveBeenCalledWith(201);
        expect(mockReply.send).toHaveBeenCalledWith({
            ...mockResponse,
            id: 'test-id',
        });
    });

    it('should handle validation error when id_transaccion is missing', async () => {
        // Arrange
        mockRequest.body = {
            message: {
                data: Buffer.from(JSON.stringify({})).toString('base64'),
                messageId: 'test-message-id',
                publishTime: new Date().toISOString(),
            },
        };

        // Act
        await insertRecaudo(mockRequest as FastifyRequest, mockReply as FastifyReply);

        // Assert
        expect(mockReply.status).toHaveBeenCalledWith(400);
        expect(mockReply.send).toHaveBeenCalledWith({
            isError: true,
            message: 'Los valores de entrada no son correctos.',
            code: 'BAD_MESSAGE',
            cause: 'El campo id_transaccion es obligatorio',
            timestamp: expect.any(String),
        });
    });

    it('should handle service error', async () => {
        // Arrange
        mockRequest.body = {
            message: {
                data: Buffer.from(JSON.stringify({ id_transaccion: 123456 })).toString('base64'),
                messageId: 'test-message-id',
                publishTime: new Date().toISOString(),
            },
        };

        const mockError = new Error('Service error');
        pitagorasService.insertRecaudo.mockRejectedValue(mockError);

        // Act & Assert
        await expect(insertRecaudo(mockRequest as FastifyRequest, mockReply as FastifyReply)).rejects.toThrow(
            'Service error',
        );
    });
});
