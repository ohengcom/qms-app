'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Loading } from '@/components/ui/loading';

// Dynamic imports for large components
const QuiltForm = dynamic(
  () => import('@/components/quilts/QuiltForm').then(mod => ({ default: mod.QuiltForm })),
  {
    loading: () => <Loading text="Loading form..." />,
    ssr: false,
  }
);

const QuiltDetail = dynamic(
  () => import('@/components/quilts/QuiltDetail').then(mod => ({ default: mod.QuiltDetail })),
  {
    loading: () => <Loading text="Loading details..." />,
    ssr: false,
  }
);

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

export default function QuiltsPage() {
  const [quilts, setQuilts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuilt, setSelectedQuilt] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  useEffect(() => {
    fetch('/api/quilts')
      .then(res => res.json())
      .then(data => {
        setQuilts(data.quilts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching quilts:', err);
        setLoading(false);
      });
  }, []);

  const handleCreateQuilt = () => {
    setShowCreateDialog(true);
  };

  const handleEditQuilt = (quilt: any) => {
    setSelectedQuilt(quilt);
    setShowEditDialog(true);
  };

  const handleViewQuilt = (quilt: any) => {
    setSelectedQuilt(quilt);
    setShowDetailSheet(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    // Refetch quilts
    fetch('/api/quilts')
      .then(res => res.json())
      .then(data => setQuilts(data.quilts || []));
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setSelectedQuilt(null);
    // Refetch quilts
    fetch('/api/quilts')
      .then(res => res.json())
      .then(data => setQuilts(data.quilts || []));
  };

  const handleCancel = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setSelectedQuilt(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading quilts...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quilt Collection ({quilts.length})</h1>
        <Button onClick={handleCreateQuilt}>Add Quilt</Button>
      </div>

      {quilts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No quilts found</p>
          <Button onClick={handleCreateQuilt}>Add Your First Quilt</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quilts.map((quilt) => (
            <div
              key={quilt.id}
              className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewQuilt(quilt)}
            >
              <h3 className="font-bold text-lg mb-2">{quilt.name}</h3>
              <p className="text-sm text-gray-600">Item #{quilt.itemNumber}</p>
              <p className="text-sm">Season: {quilt.season}</p>
              <p className="text-sm">Size: {quilt.lengthCm} x {quilt.widthCm} cm</p>
              <p className="text-sm">Weight: {quilt.weightGrams}g</p>
              <p className="text-sm">Material: {quilt.fillMaterial}</p>
              <p className="text-sm">Location: {quilt.location}</p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditQuilt(quilt);
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Quilt Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Quilt</DialogTitle>
            <DialogDescription>
              Add a new quilt to your collection with detailed information and specifications.
            </DialogDescription>
          </DialogHeader>
          <QuiltForm onSuccess={handleCreateSuccess} onCancel={handleCancel} />
        </DialogContent>
      </Dialog>

      {/* Edit Quilt Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quilt</DialogTitle>
            <DialogDescription>
              Update the information and specifications for this quilt.
            </DialogDescription>
          </DialogHeader>
          {selectedQuilt && (
            <QuiltForm
              initialData={selectedQuilt}
              onSuccess={handleEditSuccess}
              onCancel={handleCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Quilt Detail Sheet */}
      <Sheet open={showDetailSheet} onOpenChange={setShowDetailSheet}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Quilt Details</SheetTitle>
            <SheetDescription>
              View detailed information, usage history, and analytics for this quilt.
            </SheetDescription>
          </SheetHeader>
          {selectedQuilt && (
            <div className="mt-6">
              <QuiltDetail
                quilt={selectedQuilt}
                onBack={() => setShowDetailSheet(false)}
                onEdit={handleEditQuilt}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
