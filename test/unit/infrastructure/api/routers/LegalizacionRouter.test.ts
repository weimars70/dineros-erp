import { LegalizacionAppService } from '@application/services';
import { DEPENDENCY_CONTAINER } from '@configuration';
import { legalizarAliado } from '@infrastructure/api/routers/LegalizacionRouter';
import { FastifyReply, FastifyRequest } from 'fastify';
import { bodyLegalizacionAliado, mockLegalizarAliadoOk } from '../../../../mocks/data';
import { validateData } from '@infrastructure/api/util';

jest.mock('@configuration');
jest.mock('@infrastructure/api/util', () => ({
    validateData: jest.fn(),
}));

describe('LegalizacionRouter', () => {
    let mockRequest: FastifyRequest;
    let mockReply: FastifyReply;
    let mockLegalizacionService: jest.Mocked<LegalizacionAppService>;

    beforeEach(() => {
        mockRequest = {
            body: bodyLegalizacionAliado,
            id: 'test-id',
        } as unknown as FastifyRequest;

        mockReply = {
            send: jest.fn().mockReturnThis(),
            code: jest.fn().mockReturnThis(),
        } as unknown as FastifyReply;

        mockLegalizacionService = {
            legalizarAliado: jest.fn(),
        } as any;

        (DEPENDENCY_CONTAINER.get as jest.Mock).mockReturnValue(mockLegalizacionService);
        (validateData as jest.Mock).mockReturnValue(bodyLegalizacionAliado);
    });

    it('Legalizar Aliado - Exitoso', async () => {
        // Arrange
        mockLegalizacionService.legalizarAliado.mockResolvedValue(mockLegalizarAliadoOk);

        // Act
        await legalizarAliado(mockRequest, mockReply);

        // Assert
        expect(mockReply.send).toHaveBeenCalledWith({
            ...mockLegalizarAliadoOk,
            id: 'test-id',
        });
        expect(mockLegalizacionService.legalizarAliado).toHaveBeenCalledWith(bodyLegalizacionAliado);
    });
});
