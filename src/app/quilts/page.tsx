'use client';

import { useEffect, useState } from 'react';

export default function QuiltsPage() {
  const [quilts, setQuilts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 简体中文文本
  const t = {
    title: '被子收藏',
    loading: '加载中...',
    error: '错误',
    noQuiltsFound: '未找到被子',
    itemNumber: '编号',
    season: '季节',
    size: '尺寸',
    weight: '重量',
    material: '材料',
    location: '位置',
    status: '状态',
  };

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

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">{t.loading}</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">{t.error}: {error}</h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{t.title} ({quilts.length})</h1>
      
      {quilts.length === 0 ? (
        <p>{t.noQuiltsFound}</p>
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
