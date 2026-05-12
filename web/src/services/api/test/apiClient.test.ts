import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../apiClient';

describe('apiClient', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        mock = new MockAdapter(apiClient);
        localStorage.clear();
    });

    afterEach(() => {
        mock.restore();
    });

    it('adds Authorization header when token exists', async () => {
        localStorage.setItem('access_token', 'TEST_TOKEN');

        mock.onGet('/test').reply((config) => {
            return [
                200,
                {
                    authHeader: config.headers?.Authorization,
                },
            ];
        });

        const response = await apiClient.get('/test');

        expect(response.data.authHeader).toBe('Bearer TEST_TOKEN');
    });

    it('does NOT add Authorization header when token is missing', async () => {
        mock.onGet('/test').reply((config) => {
            return [
                200,
                {
                    authHeader: config.headers?.Authorization,
                },
            ];
        });

        const response = await apiClient.get('/test');

        expect(response.data.authHeader).toBeUndefined();
    });

    it('handles 401 response', async () => {
        mock.onGet('/protected').reply(401);

        await expect(
            apiClient.get('/protected'),
        ).rejects.toBeTruthy();
    });

    it('uses correct baseURL', () => {
        expect(apiClient.defaults.baseURL).toBeDefined();
    });
});
