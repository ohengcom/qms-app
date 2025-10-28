'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function QuiltsPage() {
  const [quilts, setQuilts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/quilts')
      .then(res => res.json())
      .then(data => {
        setQuilts(data.quilts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredQuilts = quilts.filter(quilt =>
    quilt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quilt.itemNumber.toString().includes(searchTerm) ||
    quilt.fillMaterial?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading quilts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">Error loading quilts</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quilt Collection</h1>
          <p className="text-gray-500">Manage your quilts and track their usage</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Quilt
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search quilts by name, number, or material..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Stats */}
      <div className="mb-6 text-sm text-gray-600">
        Showing {filteredQuilts.length} of {quilts.length} quilts
      </div>

      {/* Quilts Grid */}
      {filteredQuilts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'No quilts match your search' : 'No quilts found'}
          </p>
          {!searchTerm && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Quilt
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuilts.map((quilt) => (
            <div
              key={quilt.id}
              className="border rounded-lg p-6 bg-white shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg">{quilt.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  #{quilt.itemNumber}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Season:</span>
                  <span className="font-medium">{quilt.season}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span>{quilt.lengthCm} × {quilt.widthCm} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span>{quilt.weightGrams}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Material:</span>
                  <span className="truncate ml-2">{quilt.fillMaterial}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="truncate ml-2">{quilt.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    quilt.currentStatus === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                    quilt.currentStatus === 'IN_USE' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {quilt.currentStatus}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
