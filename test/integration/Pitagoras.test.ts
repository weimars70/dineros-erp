import { application } from '@infrastructure/api/Application';
import { PREFIX } from '@util';
import { DEPENDENCY_CONTAINER } from '@configuration';
import { PitagorasService } from '@application/services/PitagorasService';

describe('Pitagoras Integration Tests', () => {
    let mockPitagorasService: jest.Mocked<PitagorasService>;

    beforeEach(() => {
        mockPitagorasService = {
            insertRecaudo: jest.fn(),
        } as unknown as jest.Mocked<PitagorasService>;

        jest.spyOn(DEPENDENCY_CONTAINER, 'get').mockReturnValue(mockPitagorasService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle invalid request payload', async () => {
        // Arrange
        const payload = {
            message: {
                data: Buffer.from(JSON.stringify({})).toString('base64'),
                messageId: 'test-message-id',
                publishTime: new Date().toISOString(),
            },
        };

        // Act
        const response = await application.inject({
            method: 'POST',
            url: `${PREFIX}/pitagoras`,
            payload,
        });

        // Assert
        const responseBody = JSON.parse(response.payload);
        expect(response.statusCode).toBe(400);
        expect(responseBody).toMatchObject({
            isError: true,
            message: 'Los valores de entrada no son correctos.',
            code: 'BAD_MESSAGE',
            cause: 'El campo id_transaccion es obligatorio',
            timestamp: expect.any(String),
        });
        expect(mockPitagorasService.insertRecaudo).not.toHaveBeenCalled();
    });
});
