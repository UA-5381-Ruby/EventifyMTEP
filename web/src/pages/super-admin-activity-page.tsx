import { useState, useEffect, useRef } from 'react';
import { PageWrapper } from '@/components/layout';
import type { Activity, ActivityType } from '@/services/activity-service';
import { activityService } from '@/services/activity-service';
export default function SuperAdminActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalActivities, setTotalActivities] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  const [selectedActivityTypes, setSelectedActivityTypes] = useState<ActivityType[]>([]);
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const filterContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [selectedActivityTypes, selectedResource, selectedStatus, searchEmail]);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        const { activities, total } = await activityService.getActivities({
          page: currentPage,
          perPage: itemsPerPage,
          activityTypes: selectedActivityTypes,
          resource: selectedResource,
          status: selectedStatus,
          email: searchEmail,
        });

        setActivities(activities);
        setTotalActivities(total);
      } catch (err: unknown) {
        console.error('Error loading activities:', err);

        let errorMessage = 'Failed to load activity data. Check your connection to the server.';
        const axiosError = err as { response?: { data?: { error?: string } } };

        if (axiosError?.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setActivities([]);
        setTotalActivities(0);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [currentPage, selectedActivityTypes, selectedResource, selectedStatus, searchEmail]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterContainerRef.current &&
        !filterContainerRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleActivityTypeChange = (type: ActivityType) => {
    setSelectedActivityTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const totalPages = Math.ceil(totalActivities / itemsPerPage);
  const showPagination = totalPages > 1;

  const getActivityTypeColor = (type: ActivityType) => {
    switch (type) {
      case 'login':
        return { text: 'text-blue-600', bg: 'bg-blue-100', badge: 'bg-blue-500' };
      case 'logout':
        return { text: 'text-gray-600', bg: 'bg-gray-100', badge: 'bg-gray-500' };
      case 'create':
        return { text: 'text-green-600', bg: 'bg-green-100', badge: 'bg-green-500' };
      case 'update':
        return { text: 'text-yellow-600', bg: 'bg-yellow-100', badge: 'bg-yellow-500' };
      case 'delete':
        return { text: 'text-red-600', bg: 'bg-red-100', badge: 'bg-red-500' };
      case 'approve':
        return { text: 'text-emerald-600', bg: 'bg-emerald-100', badge: 'bg-emerald-500' };
      case 'reject':
        return { text: 'text-orange-600', bg: 'bg-orange-100', badge: 'bg-orange-500' };
      case 'publish':
        return { text: 'text-purple-600', bg: 'bg-purple-100', badge: 'bg-purple-500' };
      case 'download':
        return { text: 'text-indigo-600', bg: 'bg-indigo-100', badge: 'bg-indigo-500' };
      case 'upload':
        return { text: 'text-cyan-600', bg: 'bg-cyan-100', badge: 'bg-cyan-500' };
      default:
        return { text: 'text-gray-600', bg: 'bg-gray-100', badge: 'bg-gray-500' };
    }
  };

  const getActivityDescription = (activity: Activity) => {
    const actor = activity.actor.email;
    switch (activity.type) {
      case 'login':
        return `${actor} logged in`;
      case 'logout':
        return `${actor} logged out`;
      case 'create':
        return `${actor} created ${activity.resource} "${activity.resourceName || activity.resourceId || ''}"`;
      case 'update':
        return `${actor} updated ${activity.resource} "${activity.resourceName || activity.resourceId || ''}"`;
      case 'delete':
        return `${actor} deleted ${activity.resource} "${activity.resourceName || activity.resourceId || ''}"`;
      case 'approve':
        return `${actor} approved ${activity.resource} "${activity.resourceName || activity.resourceId || ''}"`;
      case 'reject':
        return `${actor} rejected ${activity.resource} "${activity.resourceName || activity.resourceId || ''}"`;
      case 'publish':
        return `${actor} published ${activity.resource} "${activity.resourceName || activity.resourceId || ''}"`;
      default:
        return `${actor} performed ${activity.type} on ${activity.resource}`;
    }
  };

  const activityTypes: ActivityType[] = [
    'login',
    'logout',
    'create',
    'update',
    'delete',
    'approve',
    'reject',
    'publish',
  ];
  const resources = ['Event', 'Brand', 'User', 'Ticket', 'Category'];

  return (
    <PageWrapper>
      <div className="p-6 max-w-7xl mx-auto text-gray-800">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">User Activity Log</h1>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-2">
            Real-time system activity monitoring
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6 w-full max-w-xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Total Activities
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {loading && totalActivities === 0 ? '...' : totalActivities}
          </p>
        </div>

        <div
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6"
          ref={filterContainerRef}
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Filters</p>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="border border-gray-300 bg-white px-4 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            />

            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'resource' ? null : 'resource')}
                className="border border-gray-300 bg-white px-4 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                {selectedResource || 'All Resources'}
                <span className="text-gray-400 text-xs">⏷</span>
              </button>
              {activeDropdown === 'resource' && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-xl p-2 z-10">
                  <button
                    onClick={() => {
                      setSelectedResource('');
                      setActiveDropdown(null);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${selectedResource === '' ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    All Resources
                  </button>
                  {resources.map((resource) => (
                    <button
                      key={resource}
                      onClick={() => {
                        setSelectedResource(resource);
                        setActiveDropdown(null);
                      }}
                      className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${selectedResource === resource ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {resource}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                className={`border px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                  selectedStatus
                    ? 'border-gray-400 bg-gray-50 font-medium'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                {selectedStatus ? `Status: ${selectedStatus}` : 'All Status'}{' '}
                <span className="text-gray-400 text-xs">⏷</span>
              </button>

              {activeDropdown === 'status' && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-xl p-3 z-10">
                  <button
                    onClick={() => {
                      setSelectedStatus('');
                      setActiveDropdown(null);
                    }}
                    className="block w-full text-left px-3 py-1.5 text-sm rounded transition-colors text-gray-700 hover:bg-gray-50"
                  >
                    All Status
                  </button>
                  {['success', 'failed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setActiveDropdown(null);
                      }}
                      className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${selectedStatus === status ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Activity Types
            </p>
            <div className="flex flex-wrap gap-2">
              {activityTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedActivityTypes.includes(type)}
                    onChange={() => handleActivityTypeChange(type)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-sm">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2 animate-pulse">
                      <div
                        className="w-4 h-4 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="w-4 h-4 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="w-4 h-4 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                      <span className="ml-2 font-medium">Loading activities...</span>
                    </div>
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                    No activities found for selected filters.
                  </td>
                </tr>
              ) : (
                activities.map((item) => {
                  const colors = getActivityTypeColor(item.type);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                        {new Date(item.timestamp).toLocaleString('uk-UA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-gray-900">
                            {item.actor.email}
                          </span>
                          {item.actor.name && (
                            <span className="text-xs text-gray-400">{item.actor.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {getActivityDescription(item)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-semibold text-white rounded-full ${colors.badge} capitalize`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.resource}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                            item.status === 'success'
                              ? 'text-green-700 bg-green-100'
                              : 'text-red-700 bg-red-100'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${item.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                          ></span>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {showPagination && (
          <div className="flex justify-end items-center gap-1 mt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
            >
              &lt;
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const startPage = Math.max(1, currentPage - 2);
              return startPage + i;
            })
              .filter((page) => page <= totalPages)
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    currentPage === page
                      ? 'bg-gray-900 font-bold text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-2 py-1 text-gray-500">...</span>
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
