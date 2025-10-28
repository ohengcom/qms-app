'use client';

import { useEffect, useState } from 'react';

export default function TestQuiltsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuilts = async () => {
      try {
        console.log('TestQuilts: Starting fetch...');
        const response = await fetch('/api/quilts');
        console.log('TestQuilts: Response:', response);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('TestQuilts: Data received:', result);
        setData(result);
      } catch (err) {
        console.error('TestQuilts: Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchQuilts();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Quilts API</h1>
      <div className="mb-4">
        <p><strong>Total Quilts:</strong> {data?.total || 0}</p>
        <p><strong>Quilts Array Length:</strong> {data?.quilts?.length || 0}</p>
      </div>
      
      {data?.quilts?.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">First Few Quilts:</h2>
          {data.quilts.slice(0, 3).map((quilt: any, index: number) => (
            <div key={quilt.id || index} className="border p-4 mb-2 rounded">
              <p><strong>ID:</strong> {quilt.id}</p>
              <p><strong>Name:</strong> {quilt.name}</p>
              <p><strong>Item Number:</strong> {quilt.itemNumber}</p>
              <p><strong>Season:</strong> {quilt.season}</p>
              <p><strong>Dimensions:</strong> {quilt.lengthCm}×{quilt.widthCm}cm</p>
              <p><strong>Weight:</strong> {quilt.weightGrams}g</p>
            </div>
          ))}
        </div>
      )}
      
      <details className="mt-4">
        <summary className="cursor-pointer font-semibold">Raw Data (JSON)</summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}