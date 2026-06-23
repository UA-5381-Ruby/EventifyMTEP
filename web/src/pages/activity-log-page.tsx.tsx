import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PageWrapper } from '@/components/layout'; // Ваш імпорт макета

// --- Типи та Інтерфейси ---
type ActivityStatus = 'In Progress' | 'Complete' | 'Pending' | 'Approved' | 'Rejected';

interface Actor {
  name: string;
  avatar: string;
}

interface Activity {
  id: string;
  actor: Actor;
  brandName: string;
  category: string;
  eventName: string;
  date: string;
  status: ActivityStatus;
}

// Інтерфейс для відповіді від API (якщо бекенд повертає об'єкт з пагінацією)
interface ApiResponse {
  items: Activity[];
  total: number;
}

export default function ActivityLogPage() {
  // Основні стейти для даних
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Стейт пагінації
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5; // Кількість елементів на сторінку

  // Стейти для фільтрів
  const [selectedStatuses, setSelectedStatuses] = useState<ActivityStatus[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedBrand, setSelectedBrand] = useState<string>('All Brands');
  const [selectedTime, setSelectedTime] = useState<string>('Past 7 days');

  // Стейт для відкритих списків
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const filterContainerRef = useRef<HTMLDivElement>(null);

  // 1. Скидання пагінації на 1 сторінку при зміні будь-якого фільтра
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedBrand, selectedStatuses, selectedTime]);

  // 2. Запит до БД через Axios із передачею всіх параметрів
  useEffect(() => {
    const fetchDataFromDB = async () => {
      setLoading(true);
      setError(null);
      try {
        // Формуємо чистий об'єкт параметрів для axios
        const params: Record<string, any> = {
          page: currentPage,
          limit: itemsPerPage,
          timeRange: selectedTime
        };

        if (selectedCategory !== 'All Categories') params.category = selectedCategory;
        if (selectedBrand !== 'All Brands') params.brandName = selectedBrand;
        if (selectedStatuses.length > 0) params.statuses = selectedStatuses.join(',');

        // Виконуємо запит
        const response = await axios.get<ApiResponse | Activity[]>('/api/events', { params });

        // Гнучка перевірка: якщо бекенд повертає об'єкт { items, total } або просто масив
        if (response.data && typeof response.data === 'object' && 'items' in response.data) {
          setActivities(response.data.items);
          setTotalEvents(response.data.total);
        } else if (Array.isArray(response.data)) {
          setActivities(response.data);
          setTotalEvents(response.data.length);
        }
      } catch (err) {
        console.error('Помилка завантаження даних з БД:', err);
        setError('Не вдалося завантажити історію активності. Будь ласка, спробуйте пізніше.');
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromDB();
  }, [currentPage, selectedCategory, selectedBrand, selectedStatuses, selectedTime]);

  // 3. Закриття випадаючого списку при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target as Node)) {
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

  // Розрахунок загальної кількості сторінок для блоку пагінації
  const totalPages = Math.ceil(totalEvents / itemsPerPage);
  const showPagination = totalPages > 1;

  const getStatusStyle = (status: ActivityStatus) => {
    switch (status) {
      case 'In Progress': return { text: 'text-purple-600', dot: 'bg-purple-500' };
      case 'Complete': return { text: 'text-emerald-600', dot: 'bg-emerald-500' };
      case 'Pending': return { text: 'text-sky-500', dot: 'bg-sky-500' };
      case 'Approved': return { text: 'text-amber-500', dot: 'bg-amber-500' };
      case 'Rejected': return { text: 'text-gray-500', dot: 'bg-gray-500' };
      default: return { text: 'text-gray-500', dot: 'bg-gray-500' };
    }
  };

  return (
    <PageWrapper>
      <div className="p-6 max-w-7xl mx-auto text-gray-800">

        {/* Заголовок сторінки */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Logs</h1>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              User Activity History
            </p>
          </div>
        </div>

        {/* Картка з кількістю івентів з БД */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6 w-60">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Events</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {loading && totalEvents === 0 ? '...' : totalEvents}
          </p>
        </div>

        {/* Панель інструментів (Фільтри) */}
        <div className="flex flex-wrap items-center gap-3 mb-6" ref={filterContainerRef}>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">
            Filter By
          </span>

          {/* Випадаючий список Category */}
          <div className="relative">
            <button onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')} className="border border-gray-300 bg-white px-4 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              {selectedCategory} <span className="text-gray-400 text-xs">⏷</span>
            </button>
            {activeDropdown === 'category' && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-xl p-2 z-10">
                {['All Categories', 'Conference', 'Workshop', 'Networking', 'Education'].map((cat) => (
                  <button key={cat} onClick={() => { setSelectedCategory(cat); setActiveDropdown(null); }} className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${selectedCategory === cat ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Випадаючий список Brands */}
          <div className="relative">
            <button onClick={() => setActiveDropdown(activeDropdown === 'brands' ? null : 'brands')} className="border border-gray-300 bg-white px-4 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              {selectedBrand} <span className="text-gray-400 text-xs">⏷</span>
            </button>
            {activeDropdown === 'brands' && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-xl p-2 z-10">
                {['All Brands', 'Tech Summit LLC', 'Creative Agency', 'Green Energy Group', 'Alpha Digital'].map((brand) => (
                  <button key={brand} onClick={() => { setSelectedBrand(brand); setActiveDropdown(null); }} className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${selectedBrand === brand ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {brand}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Фільтр статусів */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
              className={`border px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${selectedStatuses.length > 0 || activeDropdown === 'status'
                ? 'border-gray-400 bg-gray-50 font-medium'
                : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
            >
              Status {selectedStatuses.length > 0 && `(${selectedStatuses.length})`} <span className="text-gray-400 text-xs">⏷</span>
            </button>

            {activeDropdown === 'status' && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-xl p-3 z-10">
                <span className="block text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">
                  Select status
                </span>
                <div className="space-y-2">
                  {(['In Progress', 'Complete', 'Pending', 'Approved', 'Rejected'] as ActivityStatus[]).map((status) => (
                    <label key={status} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        value={status}
                        checked={selectedStatuses.includes(status)}
                        onChange={() => handleCheckboxChange(status)}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Випадаючий список Часу */}
          <div className="relative ml-auto">
            <button onClick={() => setActiveDropdown(activeDropdown === 'time' ? null : 'time')} className="bg-gray-900 text-white px-4 py-2 text-sm rounded-lg hover:bg-black transition-colors flex items-center gap-2">
              {selectedTime} <span className="text-gray-400 text-xs">⏷</span>
            </button>
            {activeDropdown === 'time' && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-xl p-2 z-10">
                {['Today', 'Past 7 days', 'Past 30 days', 'All Time'].map((time) => (
                  <button key={time} onClick={() => { setSelectedTime(time); setActiveDropdown(null); }} className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${selectedTime === time ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Екран Помилки */}
        {error && (
          <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Таблиця */}
        <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-sm">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event ID</th>
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand logo</th>
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand name</th>
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event name</th>
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="border-b border-gray-300 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="border-b border-gray-300 px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2 animate-pulse">
                      <div className="w-4 h-4 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-4 h-4 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-4 h-4 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      <span className="ml-2 font-medium">Завантаження з бази даних...</span>
                    </div>
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    No events found for selected filters.
                  </td>
                </tr>
              ) : (
                activities.map((item, index) => {
                  const statusStyle = getStatusStyle(item.status);
                  // Розрахунок наскрізного ID з урахуванням поточної сторінки пагінації
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">#{globalIndex}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg shadow-sm border border-gray-200">
                            {item.actor?.avatar || '👤'}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{item.actor?.name || 'Система'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.brandName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>
                          <span className="block font-medium text-gray-900">{item.eventName}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {item.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        <div className={`flex items-center gap-2 ${statusStyle.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                          {item.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors">•••</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Динамічна Пагінація */}
        {showPagination && (
          <div className="flex justify-end items-center gap-1 mt-6">
            {/* Кнопка назад */}
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
            >
              &lt;
            </button>

            {/* Рендер номерів сторінок */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${currentPage === page
                  ? 'bg-gray-900 font-bold text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                {page}
              </button>
            ))}

            {/* Кнопка вперед */}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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