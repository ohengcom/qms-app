'use client';

import { useDashboardStats } from '@/hooks/useDashboard';
import { Loading } from '@/components/ui/loading';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();



  if (isLoading) {
    return (
      <div className="p-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800">Loading dashboard data via tRPC...</p>
        </div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading dashboard: {error.message}</p>
          <pre className="mt-2 text-xs text-red-600">{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    );
  }

  const overview = stats?.overview || {
    totalQuilts: 0,
    inUseCount: 0,
    availableCount: 0,
    storageCount: 0,
    maintenanceCount: 0,
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">QMS Dashboard</h1>
      <p className="text-gray-600 mb-8">Quilt Management System</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Quilts</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{overview.totalQuilts}</p>
          <p className="text-sm text-gray-500 mt-1">In your collection</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">In Use</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{overview.inUseCount}</p>
          <p className="text-sm text-gray-500 mt-1">Currently being used</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Available</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{overview.availableCount}</p>
          <p className="text-sm text-gray-500 mt-1">Ready to use</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">In Storage</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">{overview.storageCount}</p>
          <p className="text-sm text-gray-500 mt-1">Stored away</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">📦</div>
            <div className="text-sm font-medium">View Quilts</div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">⏰</div>
            <div className="text-sm font-medium">Usage Tracking</div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">📥</div>
            <div className="text-sm font-medium">Import Data</div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">📤</div>
            <div className="text-sm font-medium">Export Data</div>
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800">
          ✅ <strong>Success!</strong> The QMS application is now running with optimized tech stack.
          Dashboard data loaded via tRPC successfully.
        </p>
      </div>


    </div>
  );
}
