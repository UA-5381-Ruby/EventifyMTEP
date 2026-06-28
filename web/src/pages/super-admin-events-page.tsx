import { useEffect, useRef } from 'react';
import { PageWrapper } from '@/components/layout';
import { brandsService } from '@/services/brands-service';
import { EventsService } from '@/services/events-service';
import { CategoriesService } from '@/services/categories-service';
import { useReduxState } from '@/hooks/use-redux-state';

type ActivityStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'cancelled'
  | 'archived';

interface Activity {
  id: string;
  brandName?: string;
  brandLogo?: string;
  brand?: { id: string; name: string; logo?: string; image_url?: string };
  title?: string;
  eventName?: string;
  name?: string;
  date?: string;
  start_date?: string;
  status: ActivityStatus;
  category?: string;
  categories?: Array<{ id: string; name: string }>;
}

interface Brand {
  id: string;
  name: string;
  logo_url?: string;
}

interface Category {
  id: string;
  name: string;
}

interface AxiosResponseData<T> {
  data?: {
    data?: T;
    meta?: {
      total?: number;
      total_count?: number;
    };
  };
  meta?: {
    total?: number;
    total_count?: number;
  };
}

interface RawBackendEvent {
  id: string | number;
  brand_id?: string | number;
  title?: string;
  name?: string;
  start_date?: string;
  date?: string;
  status?: string;
  brand?: {
    name?: string;
    logo?: string;
    logo_url?: string;
    image_url?: string;
  };
  categories?: Array<{ id: string | number; name: string }>;
}

const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || 'https://your-bucket-name.s3.amazonaws.com';

export default function ActivityLogPage() {
  const [activities, setActivities] = useReduxState<Activity[]>([]);
  const [totalEvents, setTotalEvents] = useReduxState<number>(0);
  const [loading, setLoading] = useReduxState<boolean>(true);
  const [error, setError] = useReduxState<string | null>(null);

  const [brands, setBrands] = useReduxState<Brand[]>([]);
  const [categories, setCategories] = useReduxState<Category[]>([]);

  const [currentPage, setCurrentPage] = useReduxState<number>(1);
  const itemsPerPage = 10;

  const [selectedStatuses, setSelectedStatuses] = useReduxState<ActivityStatus[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useReduxState<string>('');
  const [selectedBrandId, setSelectedBrandId] = useReduxState<string>('');

  const [activeDropdown, setActiveDropdown] = useReduxState<string | null>(null);
  const filterContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBrandsAndCategories = async () => {
      try {
        const [brandsRaw, categoriesRaw] = await Promise.all([
          brandsService.getBrands({ scope: 'discover', per_page: 100 }).catch(() => null),
          CategoriesService.getCategories().catch(() => null),
        ]);

        const brandsRes = brandsRaw as AxiosResponseData<Brand[]>;
        const categoriesRes = categoriesRaw as AxiosResponseData<Category[]>;

        const brandsData =
          brandsRes?.data?.data || (Array.isArray(brandsRes?.data) ? brandsRes.data : []) || [];
        if (Array.isArray(brandsData)) {
          setBrands(brandsData.map((b) => ({ id: String(b.id), name: b.name })));
        }

        const categoriesData =
          categoriesRes?.data?.data ||
          (Array.isArray(categoriesRes?.data) ? categoriesRes.data : []) ||
          [];
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData.map((c) => ({ id: String(c.id), name: c.name })));
        }
      } catch (err) {
        console.error('Error fetching brands/categories:', err);
      }
    };

    fetchBrandsAndCategories();
  }, []);

  useEffect(() => {
    const fetchDataFromDB = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number> = {
          page: currentPage,
          per_page: itemsPerPage,
        };

        if (selectedCategoryId) params.category_id = selectedCategoryId;
        if (selectedBrandId) params.brand_id = selectedBrandId;
        if (selectedStatuses.length > 0) params.status = selectedStatuses.join(',');

        const rawResponse = await EventsService.getEvents(params);
        const response = rawResponse as AxiosResponseData<RawBackendEvent[]>;

        const responseData =
          response?.data?.data || (Array.isArray(response?.data) ? response.data : []) || [];
        const responseMeta = response?.data?.meta || response?.meta || {};

        if (Array.isArray(responseData)) {
          const events = responseData.map((event) => {
            const matchedBrand = brands.find((b) => b.id === String(event.brand_id));

            const rawLogo =
              event.brand?.logo ||
              event.brand?.logo_url ||
              event.brand?.image_url ||
              matchedBrand?.logo_url;
            let finalBrandLogo = null;
            if (rawLogo) {
              finalBrandLogo = rawLogo.startsWith('http') ? rawLogo : `${S3_BASE_URL}/${rawLogo}`;
            }

            return {
              id: String(event.id),
              brandName: event.brand?.name || matchedBrand?.name || 'N/A',
              brandLogo: finalBrandLogo,
              eventName: event.title || event.name || 'N/A',
              date: event.start_date || event.date || new Date().toISOString(),
              status: (event.status || 'draft') as ActivityStatus,
              category: event.categories?.[0]?.name || 'General',
            };
          });
          setActivities(events);
          setTotalEvents(responseMeta.total || responseMeta.total_count || events.length);
        }
      } catch {
        setError('Try again later. Error fetching events from the database.');
      }
      {
        setLoading(false);
      }
    };

    fetchDataFromDB();
  }, [currentPage, selectedCategoryId, selectedBrandId, selectedStatuses, brands]);

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

  const handleCheckboxChange = (status: ActivityStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const totalPages = Math.ceil(totalEvents / itemsPerPage);
  const showPagination = totalPages > 1;

  const getStatusStyle = (status: ActivityStatus) => {
    switch (status) {
      case 'draft':
        return { text: 'text-gray-600', dot: 'bg-gray-500' };
      case 'submitted':
        return { text: 'text-blue-600', dot: 'bg-blue-500' };
      case 'approved':
        return { text: 'text-emerald-600', dot: 'bg-emerald-500' };
      case 'published':
        return { text: 'text-green-600', dot: 'bg-green-500' };
      case 'rejected':
        return { text: 'text-red-600', dot: 'bg-red-500' };
      case 'cancelled':
        return { text: 'text-orange-600', dot: 'bg-orange-500' };
      case 'archived':
        return { text: 'text-slate-600', dot: 'bg-slate-500' };
      default:
        return { text: 'text-gray-500', dot: 'bg-gray-500' };
    }
  };

  return (
    <PageWrapper>
      <div className="p-6 max-w-7xl mx-auto text-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Logs</h1>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              User Activity History
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6 w-60">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Events</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {loading && totalEvents === 0 ? '...' : totalEvents}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6" ref={filterContainerRef}>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">
            Filter By
          </span>

          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
              className="border border-gray-300 bg-white px-4 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              {selectedCategoryId
                ? categories.find((c) => c.id === selectedCategoryId)?.name
                : 'All Categories'}
              <span className="text-gray-400 text-xs">⏷</span>
            </button>
            {activeDropdown === 'category' && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-xl p-2 z-10">
                <button
                  onClick={() => {
                    setSelectedCategoryId('');
                    setActiveDropdown(null);
                  }}
                  className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${selectedCategoryId === '' ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setActiveDropdown(null);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${selectedCategoryId === cat.id ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'brands' ? null : 'brands')}
              className="border border-gray-300 bg-white px-4 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              {selectedBrandId ? brands.find((b) => b.id === selectedBrandId)?.name : 'All Brands'}
              <span className="text-gray-400 text-xs">⏷</span>
            </button>
            {activeDropdown === 'brands' && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-xl p-2 z-10">
                <button
                  onClick={() => {
                    setSelectedBrandId('');
                    setActiveDropdown(null);
                  }}
                  className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${selectedBrandId === '' ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  All Brands
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => {
                      setSelectedBrandId(brand.id);
                      setActiveDropdown(null);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${selectedBrandId === brand.id ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
              className={`border px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                selectedStatuses.length > 0 || activeDropdown === 'status'
                  ? 'border-gray-400 bg-gray-50 font-medium'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              Status {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}{' '}
              <span className="text-gray-400 text-xs">⏷</span>
            </button>

            {activeDropdown === 'status' && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-xl p-3 z-10">
                <span className="block text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">
                  Select status
                </span>
                <div className="space-y-2">
                  {(
                    [
                      'draft',
                      'submitted',
                      'approved',
                      'published',
                      'rejected',
                      'cancelled',
                      'archived',
                    ] as ActivityStatus[]
                  ).map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        value={status}
                        checked={selectedStatuses.includes(status)}
                        onChange={() => handleCheckboxChange(status)}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-gray-700 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
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
                  Event ID
                </th>
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Event name
                </th>
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
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
                      <span className="ml-2 font-medium">Завантаження з бази даних...</span>
                    </div>
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                    No events found for selected filters.
                  </td>
                </tr>
              ) : (
                activities.map((item, index) => {
                  const statusStyle = getStatusStyle(item.status);
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                        #{globalIndex}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {item.brandLogo ? (
                            <img
                              src={item.brandLogo}
                              alt={item.brandName}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm bg-white"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm border border-gray-200">
                              {item.brandName && item.brandName !== 'N/A'
                                ? item.brandName.charAt(0).toUpperCase()
                                : 'B'}
                            </div>
                          )}
                          <span className="text-sm text-gray-600">{item.brandName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>
                          <span className="block font-medium text-gray-900">{item.eventName}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(item.date || new Date()).toLocaleDateString('uk-UA')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        <div className={`flex items-center gap-2 ${statusStyle.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                          {item.status}
                        </div>
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

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
