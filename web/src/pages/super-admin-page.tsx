import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';

export function SuperAdminPage() {
  const navigate = useNavigate();
  const stats = [
    { title: 'Total events', value: '11' },
    { title: 'Total Users', value: '11' },
    { title: 'Total brands', value: '11' },
    { title: 'Pending Approval', value: '11' },
    { title: 'Rejected events', value: '11' },
    { title: 'Reported Users', value: '11' },
  ];

  return (
    <PageWrapper>

      <div className="p-6 max-w-6xl mx-auto text-gray-800">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button
            onClick={() => navigate('/activity-log')}
            className="bg-black text-white text-xs px-4 py-2 font-medium hover:bg-gray-800 transition-colors">
            View Log activity page
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((card, idx) => (
            <div key={idx} className="border border-gray-300 p-6 bg-white">
              <p className="text-sm text-gray-700 mb-2">{card.title}</p>
              <p className="text-4xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold">Events Pending Approval</h2>
            <a href="#" className="text-sm text-gray-600 hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm bg-white">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold w-1/6">Name</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold w-1/6">Start Date</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold w-1/6">Status</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold w-1/6">Created By</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold w-1/6">Location</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold w-1/3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((_, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-300 px-4 py-3">Event</td>
                    <td className="border border-gray-300 px-4 py-3">DD/MM/YYYY</td>
                    <td className="border border-gray-300 px-4 py-3">status</td>
                    <td className="border border-gray-300 px-4 py-3"></td>
                    <td className="border border-gray-300 px-4 py-3"></td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex justify-center gap-2">
                        <button className="bg-black text-white px-6 py-1.5 text-xs w-24 hover:bg-gray-800 transition-colors">
                          Approve
                        </button>
                        <button className="bg-gray-300 text-black px-6 py-1.5 text-xs w-24 hover:bg-gray-400 transition-colors">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-lg font-bold">User Preview</h2>
            <a href="#" className="text-sm text-gray-600 hover:underline">Manage Members</a>
          </div>

          <div className="border border-gray-300 p-6 bg-white">
            <div className="flex justify-end mb-6">
              <button className="border border-gray-400 px-8 py-1.5 text-xs font-medium bg-gray-50 hover:bg-gray-100 transition-colors">
                Add Member
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">user@mybrand.com</p>
                    <p className="text-xs text-gray-400">Owner</p>
                  </div>
                </div>
                <button className="border border-gray-400 px-6 py-1.5 text-xs bg-gray-50 w-24 hover:bg-gray-100 transition-colors">
                  Delete
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">manager1@mybrand.com</p>
                  </div>
                </div>
                <button className="border border-gray-400 px-6 py-1.5 text-xs bg-gray-50 w-24 hover:bg-gray-100 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}