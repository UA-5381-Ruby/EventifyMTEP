import { SuperadminService } from '@/services/superadmin-service';
import { UserService } from '@/services/user-service';
import { EventsService } from '@/services/events-service';
import { brandsService } from '@/services/brands-service';

jest.mock('@/services/user-service');
jest.mock('@/services/events-service');
jest.mock('@/services/brands-service');

describe('SuperadminService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardData', () => {
    it('should successfully aggregate data and correctly calculate stats', async () => {
      const mockUsers = [
        { id: 1, email: 'admin@test.com', role: 'Admin' },
        { id: 2, email: 'user@test.com' },
      ];

      const mockBrands = {
        data: [{ id: 1, name: 'Brand A' }, { id: 2, name: 'Brand B' }],
      };

      const mockEvents = {
        data: [
          { id: 1, status: 'pending', name: 'Event 1' },
          { id: 2, status: 'rejected', title: 'Event 2' },
          { id: 3, status: 'approved', name: 'Event 3' },
        ],
      };

      (UserService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);
      (brandsService.getBrands as jest.Mock).mockResolvedValue(mockBrands);
      (EventsService.getEvents as jest.Mock).mockResolvedValue(mockEvents);

      const result = await SuperadminService.getDashboardData();

      expect(UserService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(brandsService.getBrands).toHaveBeenCalledTimes(1);
      expect(EventsService.getEvents).toHaveBeenCalledTimes(1);

      expect(result.stats).toEqual({
        totalUsers: 2,
        totalBrands: 2,
        totalEvents: 3,
        pendingApproval: 1,
        rejectedEvents: 1,
        reportedUsers: 0,
      });

      expect(result.users).toEqual([
        { id: '1', email: 'admin@test.com', role: 'Admin' },
        { id: '2', email: 'user@test.com', role: 'Member' },
      ]);

      expect(result.pendingEvents).toHaveLength(1);
      expect(result.pendingEvents[0]).toMatchObject({
        id: '1',
        status: 'pending',
        name: 'Event 1',
      });
    });

    it('should safely handle empty or invalid data', async () => {
      (UserService.getAllUsers as jest.Mock).mockResolvedValue(null);
      (brandsService.getBrands as jest.Mock).mockResolvedValue({});
      (EventsService.getEvents as jest.Mock).mockResolvedValue({ data: null });

      const result = await SuperadminService.getDashboardData();

      expect(result.stats).toEqual({
        totalUsers: 0,
        totalBrands: 0,
        totalEvents: 0,
        pendingApproval: 0,
        rejectedEvents: 0,
        reportedUsers: 0,
      });

      expect(result.users).toEqual([]);
      expect(result.pendingEvents).toEqual([]);
    });

    it('should provide default values for events with missing fields', async () => {
      const mockEvents = {
        data: [{ id: 1, status: 'pending' }],
      };

      (UserService.getAllUsers as jest.Mock).mockResolvedValue([]);
      (brandsService.getBrands as jest.Mock).mockResolvedValue({ data: [] });
      (EventsService.getEvents as jest.Mock).mockResolvedValue(mockEvents);

      const result = await SuperadminService.getDashboardData();

      expect(result.pendingEvents[0]).toEqual({
        id: '1',
        status: 'pending',
        name: 'Untitled Event',
        startDate: 'N/A',
        createdBy: 'Unknown',
        location: 'Remote',
      });
    });
  });
});