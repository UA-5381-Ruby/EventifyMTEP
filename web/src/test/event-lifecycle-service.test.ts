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

  describe('Error Handling - remaining lifecycle methods', () => {
    it('approveEvent: throws specific message on Axios error with response.data.message', async () => {
      const specificMessage = 'Event cannot be approved in its current state';
      mockedPost.mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: { message: specificMessage } },
      });

      await expect(EventLifecycleService.approveEvent(1)).rejects.toThrow(specificMessage);
    });

    it('rejectEvent: throws specific message on Axios error with response.data.message', async () => {
      const specificMessage = 'Event cannot be rejected in its current state';
      mockedPost.mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: { message: specificMessage } },
      });

      await expect(EventLifecycleService.rejectEvent(1, { reason: 'Bad content' })).rejects.toThrow(specificMessage);
    });

    it('cancelEvent: throws specific message on Axios error with response.data.message', async () => {
      const specificMessage = 'Event cannot be cancelled in its current state';
      mockedPost.mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: { message: specificMessage } },
      });

      await expect(EventLifecycleService.cancelEvent(1)).rejects.toThrow(specificMessage);
    });

    it('Branch: falls through to parseApiError when Axios error has no response message', async () => {
      const axiosErrorWithoutMessage = Object.assign(new Error('Axios error, no message'), {
        isAxiosError: true,
        response: { data: {} }, // no .message
      });
      mockedPost.mockRejectedValueOnce(axiosErrorWithoutMessage);

      await expect(EventLifecycleService.submitEvent(1)).rejects.toThrow('Axios error, no message');

      expect(parseApiError).toHaveBeenCalledWith(axiosErrorWithoutMessage);
    });
  });

  describe('Unwrapped response fallback (response.data, not response.data.data)', () => {
    it('submitEvent: returns response.data directly when no data envelope', async () => {
      mockedPost.mockResolvedValueOnce({ data: { ...mockEvent, status: 'draft_on_review' } });

      const result = await EventLifecycleService.submitEvent(1);

      expect(result.status).toBe('draft_on_review');
    });

    it('approveEvent: returns response.data directly when no data envelope', async () => {
      mockedPost.mockResolvedValueOnce({ data: { ...mockEvent, status: 'published' } });

      const result = await EventLifecycleService.approveEvent(1);

      expect(result.status).toBe('published');
    });

    it('rejectEvent: returns response.data directly when no data envelope', async () => {
      mockedPost.mockResolvedValueOnce({ data: { ...mockEvent, status: 'rejected' } });

      const result = await EventLifecycleService.rejectEvent(1, { reason: 'Bad content' });

      expect(result.status).toBe('rejected');
    });

    it('cancelEvent: returns response.data directly when no data envelope', async () => {
      mockedPost.mockResolvedValueOnce({ data: { ...mockEvent, status: 'cancelled' } });

      const result = await EventLifecycleService.cancelEvent(1);

      expect(result.status).toBe('cancelled');
    });
  });

  describe('rejectEvent default payload', () => {
    it('calls reject endpoint with empty payload when no reason provided', async () => {
      mockedPost.mockResolvedValueOnce({ data: { ...mockEvent, status: 'rejected' } });

      await EventLifecycleService.rejectEvent(1);

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events/1/reject', {});
    });
  });
});
