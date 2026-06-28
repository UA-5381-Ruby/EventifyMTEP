import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxState } from '@/hooks/use-redux-state';

import { PageWrapper } from '@/components/layout';
import { DeleteUserModal, SuccessModal } from '@/components/ui/super-admin-modals';

import { UserService } from '@/services/user-service';
import { EventLifecycleService } from '@/services/event-lifecycle-service';
import { SuperadminService } from '@/services/superadmin-service';

import type { AdminStats, PendingEvent, UserPreview } from '@/types/super-admin';

export function SuperAdminPage() {
  const navigate = useNavigate();

  const [deleteModal, setDeleteModal] = useReduxState({
    isOpen: false,
    userId: '',
    userEmail: '',
  });

  const [showSuccess, setShowSuccess] = useReduxState(false);

  const [stats, setStats] = useReduxState<AdminStats>({
    totalEvents: 0,
    totalUsers: 0,
    totalBrands: 0,
    pendingApproval: 0,
    rejectedEvents: 0,
    reportedUsers: 0,
  });

  const [pendingEvents, setPendingEvents] = useReduxState<PendingEvent[]>([]);
  const [users, setUsers] = useReduxState<UserPreview[]>([]);
  const [isLoading, setIsLoading] = useReduxState(true);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);

      const dashboard = await SuperadminService.getDashboardData();

      setUsers(dashboard.users);
      setPendingEvents(dashboard.pendingEvents);
      setStats(dashboard.stats);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboard();
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
      await UserService.deleteUser(deleteModal.userId);

      closeDeleteModal();
      setShowSuccess(true);

      await loadDashboard();
    } catch (error) {
      console.error('Delete user failed:', error);

      alert('Could not delete user.');

      closeDeleteModal();
    }
  };

  const handleApprove = async (eventId: string) => {
    try {
      await EventLifecycleService.approveEvent(eventId);

      setShowSuccess(true);

      await loadDashboard();
    } catch (error) {
      console.error('Approve failed:', error);

      alert('Could not approve event.');
    }
  };

  const handleReject = async (eventId: string) => {
    try {
      await EventLifecycleService.rejectEvent(eventId);

      setShowSuccess(true);

      await loadDashboard();
    } catch (error) {
      console.error('Reject failed:', error);

      alert('Could not reject event.');
    }
  };

  const statsArray = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
    },
    {
      title: 'Total Brands',
      value: stats.totalBrands,
    },
    {
      title: 'Pending Approval',
      value: stats.pendingApproval,
    },
    {
      title: 'Rejected Events',
      value: stats.rejectedEvents,
    },
    {
      title: 'Reported Users',
      value: stats.reportedUsers,
    },
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

        {/* Statistics */}

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

        {/* Pending Events */}

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
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="border-b px-4 py-3">{event.name}</td>

                      <td className="border-b px-4 py-3">{event.startDate}</td>

                      <td className="border-b px-4 py-3">{event.status}</td>

                      <td className="border-b px-4 py-3">{event.createdBy}</td>

                      <td className="border-b px-4 py-3">{event.location}</td>

                      <td className="border-b px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleApprove(event.id)}
                            className="bg-black text-white px-5 py-2 text-xs rounded-lg hover:bg-gray-800"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => handleReject(event.id)}
                            className="bg-gray-300 text-gray-800 px-5 py-2 text-xs rounded-lg hover:bg-gray-400"
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

        {/* Users */}

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">User Preview</h2>

            <button className="text-sm hover:underline">Manage Members</button>
          </div>

          <div className="border border-gray-300 bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-end mb-6">
              <button className="border px-8 py-2 text-xs rounded-lg hover:bg-gray-100">
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
                    className="flex justify-between items-center border-b border-gray-100 pb-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold">
                        {user.email.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-medium">{user.email}</p>

                        <p className="text-xs text-gray-400">{user.role}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => openDeleteModal(user)}
                      className="border border-gray-400 px-6 py-2 text-xs rounded-lg hover:border-red-500 hover:text-red-600"
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
