'use client';

import { useQuilts } from '@/hooks/useQuilts';

export default function DebugQuiltsPage() {
  const { data, isLoading, error } = useQuilts();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Quilts Data</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Loading:</h2>
          <pre>{JSON.stringify(isLoading, null, 2)}</pre>
        </div>

        <div>
          <h2 className="font-semibold">Error:</h2>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>

        <div>
          <h2 className="font-semibold">Data:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="font-semibold">Quilts Array:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(data?.quilts, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="font-semibold">Quilts Count:</h2>
          <p>{data?.quilts?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}
