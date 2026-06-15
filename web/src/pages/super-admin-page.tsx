import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api-client';
import { PageWrapper } from '@/components/layout';

interface AdminStats {
  totalEvents: number;
  totalUsers: number;
  totalBrands: number;
  pendingApproval: number;
  rejectedEvents: number;
  reportedUsers: number;
}

interface PendingEvent {
  id: string;
  name: string;
  startDate: string;
  status: string;
  createdBy: string;
  location: string;
}

interface UserPreview {
  id: string;
  email: string;
  role: string;
}

export function SuperAdminPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats>({
    totalEvents: 0,
    totalUsers: 0,
    totalBrands: 0,
    pendingApproval: 0,
    rejectedEvents: 0,
    reportedUsers: 0,
  });
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [users, setUsers] = useState<UserPreview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const [usersRes, brandsRes, eventsRes] = await Promise.all([
          apiClient.get('/api/v1/users').catch(() => ({ data: [] })),
          apiClient.get('/api/v1/brands').catch(() => ({ data: [] })),
          apiClient.get('/api/v1/events').catch(() => ({ data: [] })),
        ]);

        const fetchedUsers: UserPreview[] = Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data?.users || [];
        const fetchedBrands = Array.isArray(brandsRes.data)
          ? brandsRes.data
          : brandsRes.data?.brands || [];
        const fetchedEvents: PendingEvent[] = Array.isArray(eventsRes.data)
          ? eventsRes.data
          : eventsRes.data?.events || [];

        setUsers(fetchedUsers);

        const pending = fetchedEvents.filter(
          (e: PendingEvent) => e?.status === 'pending' || e?.status === 'Pending'
        );
        setPendingEvents(pending);

        setStats({
          totalUsers: fetchedUsers.length,
          totalBrands: fetchedBrands.length,
          totalEvents: fetchedEvents.length,
          pendingApproval: pending.length,
          rejectedEvents: fetchedEvents.filter((e: PendingEvent) => e?.status === 'rejected')
            .length,
          reportedUsers: 0,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiClient.delete(`/api/v1/users/${userId}`);

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

      setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
    } catch (error) {
      console.error(error);
      alert('Could not delete user. Make sure you have superadmin rights.');
    }
  };

  const statsArray = [
    { title: 'Total events', value: stats.totalEvents },
    { title: 'Total Users', value: stats.totalUsers },
    { title: 'Total brands', value: stats.totalBrands },
    { title: 'Pending Approval', value: stats.pendingApproval },
    { title: 'Rejected events', value: stats.rejectedEvents },
    { title: 'Reported Users', value: stats.reportedUsers },
  ];

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-500 font-medium animate-pulse">Loading dashboard data...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="p-6 max-w-6xl mx-auto text-gray-800">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button
            onClick={() => navigate('/activity-log')}
            className="bg-black text-white text-xs px-4 py-2 font-medium hover:bg-gray-800 transition-colors"
          >
            View Log activity page
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {statsArray.map((card, idx) => (
            <div key={idx} className="border border-gray-300 p-6 bg-white">
              <p className="text-sm text-gray-700 mb-2">{card.title}</p>
              <p className="text-4xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold">Events Pending Approval</h2>
            <button className="text-sm text-gray-600 hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm bg-white">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Name</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                    Start Date
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                    Status
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                    Created By
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                    Location
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No events pending approval.
                    </td>
                  </tr>
                ) : (
                  pendingEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="border border-gray-300 px-4 py-3">{event.name}</td>
                      <td className="border border-gray-300 px-4 py-3">{event.startDate}</td>
                      <td className="border border-gray-300 px-4 py-3">{event.status}</td>
                      <td className="border border-gray-300 px-4 py-3">{event.createdBy}</td>
                      <td className="border border-gray-300 px-4 py-3">{event.location}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => console.log('Approve', event.id)}
                            className="bg-black text-white px-6 py-1.5 text-xs w-24 hover:bg-gray-800 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => console.log('Reject', event.id)}
                            className="bg-gray-300 text-black px-6 py-1.5 text-xs w-24 hover:bg-gray-400 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-lg font-bold">User Preview</h2>
            <button className="text-sm text-gray-600 hover:underline">Manage Members</button>
          </div>

          <div className="border border-gray-300 p-6 bg-white">
            <div className="flex justify-end mb-6">
              <button className="border border-gray-400 px-8 py-1.5 text-xs font-medium bg-gray-50 hover:bg-gray-100 transition-colors">
                Add Member
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {users.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-2">No users found.</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 font-medium">{user.email}</p>
                        {user.role && <p className="text-xs text-gray-400">{user.role}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="border border-gray-400 px-6 py-1.5 text-xs bg-gray-50 w-24 hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
