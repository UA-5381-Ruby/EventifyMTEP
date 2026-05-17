import { eventCategoriesService } from '@/services/eventCategoriesService';
import { apiClient } from '@/lib/apiClient';

jest.mock('@/lib/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('eventCategoriesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls GET /api/v1/events/:event_id/categories', async () => {
    const expected = [{ id: '1', name: 'Tech', slug: 'tech' }];
    (apiClient.get as jest.Mock).mockResolvedValue(expected);

    const response = await eventCategoriesService.getEventCategories('event-1');

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/events/event-1/categories');
    expect(response).toEqual(expected);
  });

  it('calls POST /api/v1/events/:event_id/categories with category_id body', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue(undefined);

    await eventCategoriesService.linkCategoryToEvent('event-1', 'cat-1');

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/events/event-1/categories', {
      category_id: 'cat-1',
    });
  });

  it('calls DELETE /api/v1/events/:event_id/categories/:category_id', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValue(undefined);

    await eventCategoriesService.unlinkCategoryFromEvent('event-1', 'cat-1');

    expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/events/event-1/categories/cat-1');
  });
});
