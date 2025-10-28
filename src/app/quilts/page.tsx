'use client';

import { useEffect, useState } from 'react';

export default function QuiltsPage() {
  const [quilts, setQuilts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Fetching quilts from /api/quilts');
    fetch('/api/quilts')
      .then(res => {
        console.log('Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Fetched data:', data);
        console.log('Quilts array:', data.quilts);
        console.log('Quilts length:', data.quilts?.length);
        setQuilts(data.quilts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  console.log('Render - quilts:', quilts, 'loading:', loading, 'error:', error);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Loading quilts...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error: {error}</h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Quilts ({quilts.length})</h1>
      
      <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
        <p><strong>Debug:</strong> Quilts array length = {quilts.length}</p>
        <p>First quilt: {quilts[0]?.name || 'none'}</p>
      </div>

      {quilts.length === 0 ? (
        <p>No quilts found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quilts.map((quilt) => (
            <div key={quilt.id} className="border rounded-lg p-4 bg-white shadow">
              <h3 className="font-bold text-lg">{quilt.name}</h3>
              <p className="text-sm text-gray-600">Item #{quilt.itemNumber}</p>
              <p className="text-sm">Season: {quilt.season}</p>
              <p className="text-sm">Size: {quilt.lengthCm} x {quilt.widthCm} cm</p>
              <p className="text-sm">Weight: {quilt.weightGrams}g</p>
              <p className="text-sm">Material: {quilt.fillMaterial}</p>
              <p className="text-sm">Location: {quilt.location}</p>
              <p className="text-sm">Status: {quilt.currentStatus}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
