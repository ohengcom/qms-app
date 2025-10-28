'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { QuiltList } from '@/components/quilts/QuiltList';
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
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedQuilt, setSelectedQuilt] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);

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
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setSelectedQuilt(null);
  };

  const handleCancel = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setSelectedQuilt(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <QuiltList
        onCreateQuilt={handleCreateQuilt}
        onEditQuilt={handleEditQuilt}
        onViewQuilt={handleViewQuilt}
      />

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
