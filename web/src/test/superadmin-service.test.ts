import MockAdapter from 'axios-mock-adapter';
import apiClient from '@/lib/api-client';
import { SuperadminService } from '@/services/superadmin-service';

describe('SuperadminService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Events', () => {
    it('createEvent sends POST request to /api/v1/events', async () => {
      const payload = { title: 'New Event' };
      const responseData = { id: 1, ...payload };

      mock.onPost('/api/v1/events').reply(201, responseData);

      const result = await SuperadminService.createEvent(payload);

      expect(mock.history.post[0].url).toBe('/api/v1/events');
      expect(JSON.parse(mock.history.post[0].data)).toEqual(payload);
      expect(result).toEqual(responseData);
    });

    it('approveEvent sends POST request to /api/v1/events/:id/approve', async () => {
      const eventId = 123;
      const responseData = { success: true };

      mock.onPost(`/api/v1/events/${eventId}/approve`).reply(200, responseData);

      const result = await SuperadminService.approveEvent(eventId);

      expect(mock.history.post[0].url).toBe(`/api/v1/events/${eventId}/approve`);
      expect(result).toEqual(responseData);
    });

    it('rejectEvent sends POST request to /api/v1/events/:id/reject', async () => {
      const eventId = 123;
      const responseData = { success: true };

      mock.onPost(`/api/v1/events/${eventId}/reject`).reply(200, responseData);

      const result = await SuperadminService.rejectEvent(eventId);

      expect(mock.history.post[0].url).toBe(`/api/v1/events/${eventId}/reject`);
      expect(result).toEqual(responseData);
    });
  });

  describe('Users', () => {
    it('updateUser sends PATCH request to /api/v1/users/:id', async () => {
      const userId = 456;
      const payload = { name: 'Updated Name' };
      const responseData = { id: userId, ...payload };

      mock.onPatch(`/api/v1/users/${userId}`).reply(200, responseData);

      const result = await SuperadminService.updateUser(userId, payload);

      expect(mock.history.patch[0].url).toBe(`/api/v1/users/${userId}`);
      expect(JSON.parse(mock.history.patch[0].data)).toEqual(payload);
      expect(result).toEqual(responseData);
    });

    it('deleteUser sends DELETE request to /api/v1/users/:id', async () => {
      const userId = 456;

      mock.onDelete(`/api/v1/users/${userId}`).reply(204);

      await SuperadminService.deleteUser(userId);

      expect(mock.history.delete[0].url).toBe(`/api/v1/users/${userId}`);
    });
  });

  describe('Brands', () => {
    it('updateBrand sends PATCH request to /api/v1/brands/:id', async () => {
      const brandId = 789;
      const payload = { name: 'Updated Brand' };
      const responseData = { id: brandId, ...payload };

      mock.onPatch(`/api/v1/brands/${brandId}`).reply(200, responseData);

      const result = await SuperadminService.updateBrand(brandId, payload);

      expect(mock.history.patch[0].url).toBe(`/api/v1/brands/${brandId}`);
      expect(JSON.parse(mock.history.patch[0].data)).toEqual(payload);
      expect(result).toEqual(responseData);
    });

    it('deleteBrand sends DELETE request to /api/v1/brands/:id', async () => {
      const brandId = 789;

      mock.onDelete(`/api/v1/brands/${brandId}`).reply(204);

      await SuperadminService.deleteBrand(brandId);

      expect(mock.history.delete[0].url).toBe(`/api/v1/brands/${brandId}`);
    });
  });

  describe('Brand Memberships', () => {
    it('getBrandMemberships sends GET request to /api/v1/brands/:brand_id/memberships', async () => {
      const brandId = 789;
      const params = { page: 1, per_page: 10 };
      const responseData = { items: [], total: 0 };

      mock.onGet(`/api/v1/brands/${brandId}/memberships`).reply(200, responseData);

      const result = await SuperadminService.getBrandMemberships(brandId, params);

      expect(mock.history.get[0].url).toBe(`/api/v1/brands/${brandId}/memberships`);
      expect(mock.history.get[0].params).toEqual(params);
      expect(result).toEqual(responseData);
    });

    it('addBrandMember sends POST request to /api/v1/brands/:brand_id/memberships', async () => {
      const brandId = 789;
      const payload = { user_id: 1, role: 'manager' };
      const responseData = { id: 100, ...payload };

      mock.onPost(`/api/v1/brands/${brandId}/memberships`).reply(201, responseData);

      const result = await SuperadminService.addBrandMember(brandId, payload);

      expect(mock.history.post[0].url).toBe(`/api/v1/brands/${brandId}/memberships`);
      expect(JSON.parse(mock.history.post[0].data)).toEqual(payload);
      expect(result).toEqual(responseData);
    });

    it('updateBrandMember sends PATCH request to /api/v1/brands/:brand_id/memberships/:membership_id', async () => {
      const brandId = 789;
      const membershipId = 100;
      const role = 'owner';
      const responseData = { id: membershipId, role };

      mock
        .onPatch(`/api/v1/brands/${brandId}/memberships/${membershipId}`)
        .reply(200, responseData);

      const result = await SuperadminService.updateBrandMember(brandId, membershipId, role);

      expect(mock.history.patch[0].url).toBe(
        `/api/v1/brands/${brandId}/memberships/${membershipId}`
      );
      expect(JSON.parse(mock.history.patch[0].data)).toEqual({ role });
      expect(result).toEqual(responseData);
    });

    it('removeBrandMember sends DELETE request to /api/v1/brands/:brand_id/memberships/:membership_id', async () => {
      const brandId = 789;
      const membershipId = 100;

      mock.onDelete(`/api/v1/brands/${brandId}/memberships/${membershipId}`).reply(204);

      await SuperadminService.removeBrandMember(brandId, membershipId);

      expect(mock.history.delete[0].url).toBe(
        `/api/v1/brands/${brandId}/memberships/${membershipId}`
      );
    });
  });
});
