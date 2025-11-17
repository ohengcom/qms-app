import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { QuiltTableRow } from './QuiltTableRow';
import type { Quilt, SortField, SortDirection } from '@/types/quilt';
import { useLanguage } from '@/lib/language-provider';

interface QuiltListViewProps {
  quilts: Quilt[];
  searchTerm: string;
  isSelectMode: boolean;
  selectedIds: Set<string>;
  onSelectToggle: (id: string) => void;
  onSelectAll: () => void;
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onEdit: (quilt: Quilt) => void;
  onDelete: (quilt: Quilt) => void;
  onStatusChange: (quilt: Quilt) => void;
  onViewHistory: (quilt: Quilt) => void;
  onDoubleClick?: (quilt: Quilt) => void;
}

export function QuiltListView({
  quilts,
  searchTerm,
  isSelectMode,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  onStatusChange,
  onViewHistory,
  onDoubleClick,
}: QuiltListViewProps) {
  const { t } = useLanguage();

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1" />
    );
  };

  const renderSortableHeader = (field: SortField, label: string) => (
    <th
      key={field}
      className="h-12 px-4 text-center align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none"
      onClick={() => onSort(field)}
      title={t('language') === 'zh' ? '点击排序' : 'Click to sort'}
    >
      <div className="flex items-center justify-center">
        {label}
        {renderSortIcon(field)}
      </div>
    </th>
  );

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {isSelectMode && (
                <th className="h-12 px-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === quilts.length && quilts.length > 0}
                    onChange={onSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
              )}
              {renderSortableHeader('itemNumber', t('quilts.table.itemNumber'))}
              {renderSortableHeader('name', t('quilts.views.name'))}
              {renderSortableHeader('season', t('quilts.table.season'))}
              {renderSortableHeader('size', t('quilts.table.size'))}
              {renderSortableHeader('weight', t('quilts.table.weight'))}
              {renderSortableHeader('fillMaterial', t('quilts.table.fillMaterial'))}
              {renderSortableHeader('color', t('quilts.table.color'))}
              {renderSortableHeader('location', t('quilts.table.location'))}
              {renderSortableHeader('currentStatus', t('quilts.table.status'))}
              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                {t('quilts.views.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {quilts.map(quilt => (
              <QuiltTableRow
                key={quilt.id}
                quilt={quilt}
                searchTerm={searchTerm}
                isSelectMode={isSelectMode}
                isSelected={selectedIds.has(quilt.id)}
                onSelectToggle={() => onSelectToggle(quilt.id)}
                onEdit={() => onEdit(quilt)}
                onDelete={() => onDelete(quilt)}
                onStatusChange={() => onStatusChange(quilt)}
                onViewHistory={() => onViewHistory(quilt)}
                onDoubleClick={onDoubleClick ? () => onDoubleClick(quilt) : undefined}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
