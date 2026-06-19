import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api-client';
import { PageWrapper } from '@/components/layout';
import { DeleteUserModal, SuccessModal } from '@/components/ui/super-admin-modals';

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

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: '',
    userEmail: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        if (isMounted) setIsLoading(true);

        const [usersRes, brandsRes, eventsRes] = await Promise.all([
          apiClient.get('/api/v1/users').catch(() => ({ data: [] })),
          apiClient.get('/api/v1/brands').catch(() => ({ data: [] })),
          apiClient.get('/api/v1/events').catch(() => ({ data: [] })),
        ]);

        if (!isMounted) return;

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

        const pending = fetchedEvents.filter((event) => event.status?.toLowerCase() === 'pending');
        setPendingEvents(pending);

        setStats({
          totalUsers: fetchedUsers.length,
          totalBrands: fetchedBrands.length,
          totalEvents: fetchedEvents.length,
          pendingApproval: pending.length,
          rejectedEvents: fetchedEvents.filter(
            (event) => event.status?.toLowerCase() === 'rejected'
          ).length,
          reportedUsers: 0,
        });
      } catch (error) {
        console.error('Dashboard loading failed:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const openDeleteModal = (user: UserPreview) => {
    setDeleteModal({
      isOpen: true,
      userId: user.id,
      userEmail: user.email,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      userId: '',
      userEmail: '',
    });
  };

  const handleDeleteUser = async () => {
    if (!deleteModal.userId) return;

    try {
      await apiClient.delete(`/api/v1/users/${deleteModal.userId}`);

      setUsers((prev) => prev.filter((user) => user.id !== deleteModal.userId));

      setStats((prev) => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
      }));

      closeDeleteModal();
      setShowSuccess(true);
    } catch (error) {
      console.error('Delete user failed:', error);
      alert('Could not delete user. Make sure you have Super Admin rights.');
      closeDeleteModal();
    }
  };

  const handleApprove = async (eventId: string) => {
    try {
      await apiClient.patch(`/api/v1/events/${eventId}`, {
        status: 'approved',
      });

      setPendingEvents((prev) => prev.filter((event) => event.id !== eventId));

      setStats((prev) => ({
        ...prev,
        pendingApproval: Math.max(prev.pendingApproval - 1, 0),
      }));

      setShowSuccess(true);
    } catch (error) {
      console.error('Approve failed:', error);
      alert('Could not approve event.');
    }
  };

  const handleReject = async (eventId: string) => {
    try {
      await apiClient.patch(`/api/v1/events/${eventId}`, {
        status: 'rejected',
      });

      setPendingEvents((prev) => prev.filter((event) => event.id !== eventId));

      setStats((prev) => ({
        ...prev,
        pendingApproval: Math.max(prev.pendingApproval - 1, 0),
        rejectedEvents: prev.rejectedEvents + 1,
      }));

      setShowSuccess(true);
    } catch (error) {
      console.error('Reject failed:', error);
      alert('Could not reject event.');
    }
  };

  const statsArray = [
    { title: 'Total Events', value: stats.totalEvents },
    { title: 'Total Users', value: stats.totalUsers },
    { title: 'Total Brands', value: stats.totalBrands },
    { title: 'Pending Approval', value: stats.pendingApproval },
    { title: 'Rejected Events', value: stats.rejectedEvents },
    { title: 'Reported Users', value: stats.reportedUsers },
  ];

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-500 animate-pulse">Loading dashboard...</p>
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
            className="bg-black text-white text-xs px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            View Activity Log
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {statsArray.map((card) => (
            <div
              key={card.title}
              className="border border-gray-300 bg-white p-6 rounded-xl shadow-sm"
            >
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-4xl font-bold mt-2">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Events Pending Approval</h2>
            <button className="text-sm hover:underline">View All</button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-sm">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border-b border-gray-300 px-4 py-3 text-left">Name</th>
                  <th className="border-b border-gray-300 px-4 py-3 text-left">Start Date</th>
                  <th className="border-b border-gray-300 px-4 py-3 text-left">Status</th>
                  <th className="border-b border-gray-300 px-4 py-3 text-left">Created By</th>
                  <th className="border-b border-gray-300 px-4 py-3 text-left">Location</th>
                  <th className="border-b border-gray-300 px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      No pending events.
                    </td>
                  </tr>
                ) : (
                  pendingEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 last:border-none">
                      <td className="border-b border-gray-200 px-4 py-3">{event.name}</td>
                      <td className="border-b border-gray-200 px-4 py-3">{event.startDate}</td>
                      <td className="border-b border-gray-200 px-4 py-3">{event.status}</td>
                      <td className="border-b border-gray-200 px-4 py-3">{event.createdBy}</td>
                      <td className="border-b border-gray-200 px-4 py-3">{event.location}</td>
                      <td className="border-b border-gray-200 px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleApprove(event.id)}
                            className="bg-black text-white px-5 py-2 text-xs rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(event.id)}
                            className="bg-gray-300 text-gray-800 px-5 py-2 text-xs rounded-lg hover:bg-gray-400 transition-colors"
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">User Preview</h2>
            <button className="text-sm hover:underline">Manage Members</button>
          </div>

          <div className="border border-gray-300 bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-end mb-6">
              <button className="border px-8 py-2 text-xs rounded-lg hover:bg-gray-100 transition-colors">
                Add Member
              </button>
            </div>

            <div className="space-y-5">
              {users.length === 0 ? (
                <p className="text-center text-gray-500">No users found.</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center border-b border-gray-100 pb-4 last:border-none last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-700">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-xs text-gray-400">{user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openDeleteModal(user)}
                      className="border border-gray-400 px-6 py-2 text-xs rounded-lg hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DeleteUserModal
          isOpen={deleteModal.isOpen}
          userName={deleteModal.userEmail}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteUser}
        />

        <SuccessModal
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          title="Success!"
          message="Operation completed successfully."
        />
      </div>
    </PageWrapper>
  );
}
