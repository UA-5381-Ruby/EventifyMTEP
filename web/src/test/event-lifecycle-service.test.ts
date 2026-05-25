import apiClient, { parseApiError } from '@/lib/api-client';
import { EventLifecycleService } from '@/services/event-lifecycle-service';
import type { Event } from '@/types/event';

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
  parseApiError: jest.fn((err) => {
    throw err;
  }),
}));

const mockedPost = apiClient.post as jest.Mock;

const mockEvent: Event = {
  id: 1,
  title: 'Tech Summit 2026',
  start_date: '2026-09-01T09:00:00.000Z',
  status: 'draft',
  brand_id: 42,
};

describe('EventLifecycleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Submission & Review', () => {
    it('submitEvent: should call submit endpoint and return event', async () => {
      mockedPost.mockResolvedValueOnce({
        data: { data: { ...mockEvent, status: 'draft_on_review' } },
      });

      const result = await EventLifecycleService.submitEvent(1);

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events/1/submit');
      expect(result.status).toBe('draft_on_review');
    });

    it('approveEvent: should call approve endpoint and return published event', async () => {
      mockedPost.mockResolvedValueOnce({
        data: { data: { ...mockEvent, status: 'published' } },
      });

      const result = await EventLifecycleService.approveEvent(1);

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events/1/approve');
      expect(result.status).toBe('published');
    });

    it('rejectEvent: should call reject endpoint with reason and return rejected event', async () => {
      mockedPost.mockResolvedValueOnce({
        data: { data: { ...mockEvent, status: 'rejected' } },
      });
      const payload = { reason: 'Incomplete details' };

      const result = await EventLifecycleService.rejectEvent(1, payload);

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events/1/reject', payload);
      expect(result.status).toBe('rejected');
    });
  });

  describe('Termination', () => {
    it('cancelEvent: should call cancel endpoint and return cancelled event', async () => {
      mockedPost.mockResolvedValueOnce({
        data: { data: { ...mockEvent, status: 'cancelled' } },
      });

      const result = await EventLifecycleService.cancelEvent(1);

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events/1/cancel');
      expect(result.status).toBe('cancelled');
    });
  });

  describe('Error Handling (handleLifecycleError)', () => {
    it('Branch 1: throws specific message if Axios error contains response.data.message (422/403)', async () => {
      const specificMessage = 'All required fields must be filled before submission';
      const mockAxiosError = {
        isAxiosError: true,
        response: {
          data: { message: specificMessage },
        },
      };

      mockedPost.mockRejectedValueOnce(mockAxiosError);

      await expect(EventLifecycleService.submitEvent(1)).rejects.toThrow(specificMessage);
    });

    it('Branch 2: fallbacks to parseApiError for non-Axios or standard errors', async () => {
      const standardError = new Error('Network down');
      mockedPost.mockRejectedValueOnce(standardError);

      await expect(EventLifecycleService.submitEvent(1)).rejects.toThrow();

      expect(parseApiError).toHaveBeenCalledWith(standardError);
    });
  });
});
